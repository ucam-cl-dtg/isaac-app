define([], function() {

	var PageController = ['$scope', 'auth', 'api', '$stateParams', '$window', '$location', function($scope, auth, api, $stateParams, $window, $location) {
		// Create date of birth select options
		$scope.datePicker = {
			days: [],
			months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
			years: []
		};

		// Populate days
		for (var i = 1; i <= 31; i++) {
			$scope.datePicker.days.push(i);
		}

		// Populate years
		var currentYear = new Date().getFullYear();
		for (var i = currentYear; i > 1900; i--) {
			$scope.datePicker.years.push(i);
		}

		$scope.dob = {};

		if ($scope.user.dateOfBirth != null) {
			var date = new Date($scope.user.dateOfBirth);
			$scope.dob.day = date.getDate();
			$scope.dob.month = $scope.datePicker.months[date.getMonth()];
			$scope.dob.year = date.getFullYear();
		}

		// Watch for changes to the DOB selection
		$scope.$watchCollection('dob', function() {
			if ($scope.user == null) {
				// User object hasn't been initialised yet
				return;
			}

			var dob = new Date($scope.dob.year, $scope.datePicker.months.indexOf($scope.dob.month), $scope.dob.day);
			if (!isNaN(dob.getTime())) {
				$scope.user.dateOfBirth = dob.getTime();
			}
		});

		$scope.socialAccounts = function(){
			// object for linked account, nothing linked by default
			var linked = {"GOOGLE":false, "TWITTER":false, "FACEBOOK":false};

			if ($scope.user != null) {
				// loop through linked accounts
				angular.forEach($scope.user.linkedAccounts, function(account){
					Object.keys(linked).forEach(function(key) {
						// If there is a match update to true
    					if(key === account) linked[key] = true;
					});
					
                });
			}
			return linked;
		}

		$scope.removeLinkedAccount = function(provider) {
			api.removeLinkedAccount(provider).then(function() {
				auth.updateUser();
			});
		}
		$scope.addLinkedAccount = function(provider) {
			auth.linkRedirect(provider);
		}

		// Remove search
		$scope.globalFlags.noSearch = true;

        // Work out what state we're in. If we have a "next" query param then we need to display skip button.

        $scope.showSkip = !!$stateParams.next;

        $scope.save = function(next) {

        	if ($scope.account.$valid) {
	        	api.account.saveSettings($scope.user).$promise.then(function() {
	        		if (next) {
			        	$location.url(next)
	        		} else {
			        	$scope.updateSuccess = true;
	        		}
	        	}).catch(function() {
	        		$scope.updateFail = true;
	        	})
	        } else {
	        	// The form is not valid, so display errors.
	        	for(var i in $scope.account.$error.required){
	        		$scope.account.$error.required[i].$dirty = true;
        	}

	        }
        }

        $scope.skip = function() {
        	$location.url($stateParams.next || "/");
        }

        $scope.$watchCollection("user", function() {
        	$scope.updateSuccess = false;
        	$scope.updateFail = false;
        })

        $scope.$on("$destroy", function() {
        	auth.updateUser();
        })

	}]

	return {
		PageController: PageController,
	};
})