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

	var PageController = ['$scope', 'auth', 'api', 'gameBoardTitles', 'boardSearchOptions', 'boardProcessor', '$rootScope', '$timeout', '$stateParams', '$state', function($scope, auth, api, gameBoardTitles, boardSearchOptions, boardProcessor, $rootScope, $timeout, $stateParams, $state) {
		
		$rootScope.pageTitle = "My Boards";

		var updateBoards = function(limit) {
			$scope.setLoading(true);
			api.userGameBoards($scope.selectedFilterOption.value, $scope.selectedSortOption.value, 0, limit).$promise.then(function(boards) {
				$scope.boards = boards;
				boardProcessor.augmentBoards(boards.results, $scope.user._id);
				$scope.filterOptions = boardProcessor.filterOptions;
				$scope.setLoading(false);
			})
		};

		$scope.isTeacher = $scope.user != null && ($scope.user.role == 'TEACHER' || $scope.user.role == 'ADMIN' || $scope.user.role == 'CONTENT_EDITOR' || $scope.user.role == 'EVENT_MANAGER');
		$scope.boardSearchOptions = boardSearchOptions;
		$scope.propertyName = 'lastVisited';
		$scope.reverse = true;
		$scope.sortIcon = {sortable: '⇕', ascending: '⇑', descending: '⇓'};

		$scope.loadMore = function() {
			if (mergeInProgress) return;
			mergeInProgress = true;
			$scope.setLoading(true);
			api.userGameBoards($scope.selectedFilterOption.value, $scope.selectedSortOption.value, $scope.boards.results.length).$promise.then(function(newBoards){
				// Merge new boards into results 
				boardProcessor.augmentBoards(newBoards.results, $scope.user._id);
				$.merge($scope.boards.results, newBoards.results);
				$scope.setLoading(false);
				mergeInProgress = false;
			});
		};

		$scope.deleteBoard = function(board){
			lookupAssignedGroups(board).$promise.then(function(groupsAssigned) {
				if (groupsAssigned != null && groupsAssigned.length != 0) {
					if ($scope.user.role == "ADMIN" || $scope.user.role == "EVENT_MANAGER") {
						alert("Warning: You currently have groups assigned to this board. If you delete this your groups will still be assigned but you won't be able to unassign them or see the board in your Assigned Boards or My boards page.");
					} else {
						$scope.showToast($scope.toastTypes.Failure, "Board Deletion Not Allowed", "You have groups assigned to this board. To delete this board, you must unassign all groups.");
						return;
					}
				}
				
				var boardTitle = board.title ? board.title : $scope.generateGameBoardTitle(board);
				// Warn user before deleting
				var confirmation = confirm("You are about to delete " + boardTitle + " board?");
				if (confirmation) {
					// TODO: This needs to be reviewed
					// Currently reloading boards after delete
					$scope.setLoading(true);
					api.deleteGameBoard(board.id).$promise.then(function(){
						updateBoards($scope.boards.results.length);
						$scope.setLoading(false);
						$scope.showToast($scope.toastTypes.Success, "Board Deleted", "You have successfully deleted the board: " + boardTitle);
					}).catch(function(e){
						$scope.showToast($scope.toastTypes.Failure, "Board Deletion Failed", "With error message: (" + e.status + ") " + e.data.errorMessage != undefined ? e.data.errorMessage : "");
					});
				}
			})
		}

		$scope.sortBy = function(propertyName) {
			$scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
			$scope.propertyName = propertyName;
		};

		$scope.$watchGroup(["selectedNoBoardsOption", "selectedFilterOption"], function(newVal, oldVal) {
			if (newVal !== oldVal) {
				updateBoards($scope.selectedNoBoardsOption.value);
			}
		});
		
		$scope.$watch("selectedSortOption", function(newVal, oldVal) {
			if (newVal !== oldVal) {
				updateBoards($scope.boards.results.length);
			}
		});

		$scope.$watch("selectedViewOption", function(newVal, oldVal) {
			if (newVal !== oldVal) {
				var allBoardsLoaded = $scope.selectedFilterOption == boardSearchOptions.filter.values.all && $scope.selectedNoBoardsOption == boardSearchOptions.noBoards.values.all; 
				$state.go('boards', {view: $scope.selectedViewOption.value}, {notify: !allBoardsLoaded}); // only request boards if all boards are not already loaded
				setDefaultBoardSearchOptions($scope.selectedViewOption.defaultFieldName, allBoardsLoaded);
				window.scrollTo(0, 0);
			}
		});

		var setDefaultBoardSearchOptions = function(viewDefaultField, allBoardsLoaded) {
			if (['cardDefault', 'tableDefault'].indexOf(viewDefaultField) >= 0) {
				// API parameters
				for (boardSearchParameter in $scope.boardSearchOptions) {
					var boardSearchOption = boardSearchOptions[boardSearchParameter];
					var selectedOptionVariableName = 'selected' + boardSearchParameter.charAt(0).toUpperCase() + boardSearchParameter.slice(1) + 'Option';
					var defaultValueKey = boardSearchOption[viewDefaultField];
					// if all boards are loaded ignore default assignment for selectedNoBoardsOption
					if (!(allBoardsLoaded && selectedOptionVariableName == 'selectedNoBoardsOption')) {
						$scope[selectedOptionVariableName] = boardSearchOption.values[defaultValueKey];
					}
				}
				// Front-end filters
				$scope.exactMatch = {
					completion: undefined,
					createdBy: undefined
				};
				$scope.partialMatch = {
					title: undefined,
					subjects: undefined,
					levels: undefined
				};
			}
		};

		var lookupAssignedGroups = function(board) {
			var groups = api.assignments.getAssignedGroups({gameId: board.id});
			return groups;
		};

		// main
		var mergeInProgress = false;
		var queryParamDefinedViewValue = $stateParams.view && boardSearchOptions.view.values[$stateParams.view];
		var suggestedViewValueForScreenSize = Foundation.utils.is_medium_up() ? boardSearchOptions.view.values.table : boardSearchOptions.view.values.card;
		var initialViewValue = queryParamDefinedViewValue || suggestedViewValueForScreenSize;

		setDefaultBoardSearchOptions(initialViewValue.defaultFieldName, false);
		updateBoards($scope.selectedNoBoardsOption.value);
	}];

	return {
		PageController: PageController
	};
})
