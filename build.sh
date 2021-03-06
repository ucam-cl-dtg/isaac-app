#! /bin/bash

set -e # Exit on failure

if test -z "$1"; then
  read -p "isaac-app version to build (e.g. v1.3.0 or 'master'):" VERSION_TO_DEPLOY
else
  VERSION_TO_DEPLOY="$1"
fi

BUILD_DIR=/tmp/isaacDeploy

echo Building in $BUILD_DIR

rm -rf $BUILD_DIR
mkdir -p $BUILD_DIR
cd $BUILD_DIR

git clone -b $VERSION_TO_DEPLOY --depth 1 https://github.com/ucam-cl-dtg/isaac-app.git
cd isaac-app

# Determine segue version to use. Honest.
if [[ $VERSION_TO_DEPLOY == v* ]]; then
	SEGUE_VERSION=`grep urlPrefix\(\"/api/ < app/js/app/app.js | sed 's/.*\/api\/\([^\/]*\)\/api.*/\1/g'`
else
	# Change the app src to request the API from a particular branch
	if test -z "$2"; then
          read -p "Override API version to target [$VERSION_TO_DEPLOY]" SEGUE_VERSION
	else
          SEGUE_VERSION=$2
    fi
    SEGUE_VERSION=${SEGUE_VERSION:-$VERSION_TO_DEPLOY}

	sed -i.bak "s/api\/[^\/]*\/api/api\/$SEGUE_VERSION\/api/g" app/js/app/app.js
	rm app/js/app/app.js.bak
fi

npm install
npm run build:prod
docker build -t "docker.isaacscience.org/isaac-app:${VERSION_TO_DEPLOY,,}" --pull --build-arg API_VERSION=$SEGUE_VERSION .
docker push "docker.isaacscience.org/isaac-app:${VERSION_TO_DEPLOY,,}"

cd ..
rm -rf isaac-app

git clone -b $SEGUE_VERSION --depth 1 https://github.com/ucam-cl-dtg/isaac-api.git
cd isaac-api
if [ -n "$UPDATE_API_DEPS" ]; then
    docker build -f Dockerfile-base -t isaac-api-base . --pull
fi
docker build -f Dockerfile-api -t "docker.isaacscience.org/isaac-api:$SEGUE_VERSION" .
docker push "docker.isaacscience.org/isaac-api:$SEGUE_VERSION"
docker build -f Dockerfile-etl -t "docker.isaacscience.org/isaac-etl:$SEGUE_VERSION" .
docker push "docker.isaacscience.org/isaac-etl:$SEGUE_VERSION"

cd ..
rm -rf isaac-api
echo "Build complete"
echo "Now run, for example:"
echo "   ./compose dev $VERSION_TO_DEPLOY up -d"