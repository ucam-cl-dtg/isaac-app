/**
 * Copyright 2014 Nick Rogers
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

    return ["$http", "$location", "api", "$timeout", function($http, $location, api, $timeout) {
		return {

			restrict: "A",

            template: '<div class="ru_share" ng-click="getShareLink()"></div>',

			link: function(scope, element, attrs) {
				scope.showShareUrl = false;
				scope.shareUrl = null;

                scope.getShareLink = function() {
	                scope.showShareUrl = !scope.showShareUrl;
	                if (scope.showShareUrl) {

						if (attrs.sharelink) {
							var data = {"longUrl": window.location.origin + '/' + attrs.sharelink};
						}
						else {
							var data = {"longUrl": window.location.href};
						}

						$http.post('https://www.googleapis.com/urlshortener/v1/url?key=AIzaSyBcVr1HZ_JUR92xfQZSnODvvlSpNHYbi4Y', data, {withCredentials: false}).then(function(response) {
							scope.shareUrl = response.data.id.replace("https://goo.gl/", window.location.origin + "/s/");
							var shortCode = response.data.id.replace("https://goo.gl/", "");
		                	api.logger.log({
			                	type: "SHOW_SHARE_URL",
			                	shortCode: shortCode,
			                	longUrl: data.longUrl,
		                	});
						}).catch(function() {
							// Fail silently
						});
	                }
                };
			}
		};
	}]
});