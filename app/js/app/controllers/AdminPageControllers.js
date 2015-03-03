/**
 * Copyright 2014 Ian Davies
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at
 * 		http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
define([], function() {

	var PageController = ['$scope', 'auth', 'api', '$window', '$rootScope', function($scope, auth, api, $window, $rootScope) {
		$rootScope.pageTitle = "Admin Page";

		$scope.contentVersion = api.contentVersion.get();
		$scope.userSearch = {};
		$scope.userSearch.searchTerms = "";

		$scope.isAdminUser = $rootScope.user.role == 'ADMIN';

		$scope.statistics = api.statisticsEndpoint.get();
		
		$scope.statsLoading = true;
		$scope.statistics.$promise.then(function(){
			$scope.statsLoading = false;
		});

		$scope.setVersion = function() {
			$scope.versionChange = "IN_PROGRESS"
			api.contentVersion.set({version: $scope.contentVersion.liveVersion}, {}).$promise.then(function() {
				api.contentVersion.get().$promise.then(function(r) {
					$scope.contentVersion = r;
					$scope.versionChange = "SUCCESS";
				});
			}).catch(function(e) {
				console.error(e);
				$scope.versionChange = "ERROR"
			});
		}
		
		$scope.hasSearched = false;
		$scope.findUsers = function() {
			if ($scope.userSearch.searchTerms != "") {
				$scope.userSearch.results = api.adminUserSearch.search({ 'email' : $scope.userSearch.searchTerms});
				$scope.userSearch.hasSearched=true;
			}
		}

		$scope.deleteUser = function(userId) {
			var deleteUser = $window.confirm('Are you sure you want to delete?');   

			if (deleteUser) {
					api.adminDeleteUser.delete({'userId' : userId}).$promise.then(function(){
					$window.alert('User deleted');
					$scope.findUsers();
				});
			} else {
				return;
			}
		}
	}]

	return {
		PageController: PageController,
	};
})