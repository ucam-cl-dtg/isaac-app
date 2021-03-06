/**
 * Copyright 2016 Ian Davies & Andrew Wells

 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export const PageController = ['$scope', '$rootScope', '$stateParams', 'api', function($scope, _$rootScope, _$stateParams, api) {
    $scope.mode = "sketcher";
    $scope.$watch("graphState", function(s) {
        if (s == null) {
            $scope.graphState = {};
            return;
        } else if (Object.keys(s).length === 0 && s.constructor === Object) {
            return;
        }
        try {
            let curves = s;
            $scope.curveState = {
                curve: curves
            };
            api.questionSpecification.getSpec({"type":"graphChoice","value":JSON.stringify(s)}).$promise.then(
                function(spec) {
                    $scope.getSpec = spec.results.toString();
                });
        } catch (e) {
            console.error("Invalid curves");
        }
    });
}];
