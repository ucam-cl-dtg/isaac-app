/**
 * Copyright 2018 Ian Davies, James Sharkey
 *
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

export const PageController = ['$scope', '$rootScope', '$state', '$stateParams', 'activeCategory', 'categories', function($scope, $rootScope, $state, $stateParams, activeCategory, categories) {

    $scope.categories = categories
    $scope.activeCategory = activeCategory
    $scope.type = $stateParams.type;
    $scope.fragmentId = "support_" + $stateParams.type + "_" + $stateParams.idSuffix;
    $scope.title = $stateParams.type[0].toUpperCase() + $stateParams.type.substring(1);

    $rootScope.pageTitle = $scope.title + " Support: " + activeCategory.title;

}];
