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

	var PageController = ['$scope', 'auth', '$state', '$location', '$window', 'api', '$timeout', '$rootScope', '$compile', function($scope, auth, $state, $location, $window, api, $timeout, $rootScope) {
		// these flags represent whether features have been enabled yet.
		$rootScope.pageTitle = "Group Management";

		$scope.archivedView = false;
		$scope.emailInviteFeatureAvailable = false;

		$scope.myGroups = api.groupManagementEndpoint.get();

		$scope.selectedGroup = null;
		$scope.selectedGroupMembers = null;
		$scope.selectedGroupToken = null;
		$scope.groupJoinURL = null;

		$scope.newGroup = {};

		$scope.hasExistingAssignments = false;

		api.userGameBoards(null, null, 0, 1).$promise.then(function(boards) {
			if(boards.totalResults > 0){
				$scope.hasExistingAssignments = true;
			}
		})

		$scope.setSelectedGroup = function(group) {
			if (group == null || ($scope.selectedGroup && group._id == $scope.selectedGroup._id)) {
				$scope.selectedGroup = null;
				$scope.selectedGroupMembers = null;
				$scope.selectedGroupToken = null;
				$scope.groupJoinURL = null;
			} else {
				$scope.selectedGroup = JSON.parse(JSON.stringify(group));	
				$scope.selectedGroupMembers = api.groupManagementEndpoint.getMembers({id: $scope.selectedGroup._id});

				$scope.selectedGroupMembers.$promise.then(function(){
					$timeout(function(){
						Opentip.findElements();
					}, 500);
				})

				api.groupManagementEndpoint.getToken({id: $scope.selectedGroup._id}).$promise.then(function(result){
					$scope.selectedGroupToken = result;
					$scope.groupJoinURL = $state.href('accountSettings', {"authToken":$scope.selectedGroupToken.token}, {absolute: true});	
				});
			}
		}

		$scope.deleteSelectedGroup = function(group){
			if (group == null){
				$scope.showToast($scope.toastTypes.Failure, "Group Delete Failed", "No group selected"); 
			} 
			else{
				if($scope.selectedGroup && group._id == $scope.selectedGroup._id) {
					$scope.selectedGroup = null;
					$scope.selectedGroupMembers = null;
					$scope.selectedGroupToken = null;
					$scope.groupJoinURL = null;
				}

				var deleteGroup = $window.confirm('Are you sure you want to delete ' + group.groupName + '?'); 
				if(deleteGroup){
					api.groupManagementEndpoint.delete({id: group._id}).$promise.then(function(result){
						$scope.myGroups = api.groupManagementEndpoint.get();
					}).catch(function(e) {
        				$scope.showToast($scope.toastTypes.Failure, "Group Delete Failed", "With error message: (" + e.status + ") "+ e.status + ") "+ e.data.errorMessage != undefined ? e.data.errorMessage : "");
					});
				}
				else{
					return;
				}
			}

		}

		$scope.saveGroup = function(isUpdate) {
        	var Group = api.groupManagementEndpoint;
        	var groupToSave = null;

        	if($scope.selectedGroup && isUpdate) {
        		groupToSave = new Group($scope.selectedGroup);
        	} else {
        		groupToSave = new Group($scope.newGroup);
        	}

        	var savedItem = groupToSave.$save({id: groupToSave._id}).then(function(grp) {
        		$scope.myGroups = api.groupManagementEndpoint.get();
        		$scope.setSelectedGroup(grp);
        		$scope.newGroup = {};

                if (!isUpdate) {
                    $scope.modals.shareCode.show();
                } else {
                    $scope.showToast($scope.toastTypes.Success, "Group Saved", groupToSave.groupName + " group has been saved successfully.");
                }
        	}).catch(function(e) {
        			$scope.showToast($scope.toastTypes.Failure, "Group Save failed", "With error message: (" + e.status + ") "+ e.status + ") "+ e.data.errorMessage != undefined ? e.data.errorMessage : "");
        	});
		}

		$scope.deleteMember = function(group, user) {
			var deleteMember = $window.confirm('Are you sure you want to delete?');   
			if (deleteMember) {
				api.groupManagementEndpoint.deleteMember({id: group._id, userId: user._id}).$promise.then(function(result){
					$scope.selectedGroupMembers = result;
					$scope.showToast($scope.toastTypes.Success, "User Removed", "The user has been removed successfully.");
				}).catch(function(e) {
        			$scope.showToast($scope.toastTypes.Failure, "Member Delete Failed", "With error message: (" + e.status + ") "+ e.status + ") "+ e.data.errorMessage != undefined ? e.data.errorMessage : "");
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