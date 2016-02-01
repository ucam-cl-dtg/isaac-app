/**
 * Copyright 2015 James Sharkey & Ian Davies
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

	var PageController = ['$scope', 'api', 'tags', function($scope, api, tags) {
		
		api.questionsPage.get().$promise.then(function (page) {

			var randomFeaturedQuestions = [];
			while ((page.featuredQuestions.length > 0) && (randomFeaturedQuestions.length < 5)) {
				var q = page.featuredQuestions.splice(Math.floor(Math.random() * page.featuredQuestions.length), 1)[0];
				randomFeaturedQuestions.push(q);
			}

			page.topBoards.length = Math.min(page.topBoards.length, 5);
			page.extraordinaryQuestions.length = Math.min(page.extraordinaryQuestions.length, 5);

			$scope.featuredQuestions = randomFeaturedQuestions.map(function(q) {
				var item = {};
				item.title = q.title;
				item.subtitle = tags.getFieldTag(q.tags).title;
				item.level = q.level;
				item.url = "/questions/" + q.id + "?board=" + q.boardId;
				return item;
			});

			$scope.topBoards = page.topBoards.map(function(b) {
				var item = {};
				item.title = b.title;
				item.url = "/gameboards#" + b.id;
				return item;
			});

			$scope.extraordinaryQuestions = page.extraordinaryQuestions;
		}).catch(function(e){
			console.warn("Couldn't load top boards page: ", e);
			$scope.topBoards = false;
			$scope.featuredQuestions = false;
			$scope.extraordinaryQuestions = false;
		});
	}];

	return {
		PageController: PageController
	};
});