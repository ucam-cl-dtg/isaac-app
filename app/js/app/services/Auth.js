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

	var service = ['api', 'persistence', '$window', '$location', '$state', '$rootScope', '$timeout', '$cookies', '$interval', function(api, persistence, $window, $location, $state, $rootScope, $timeout, $cookies, $interval) {

		this.loginRedirect = function(provider, target) {
			
			persistence.save('afterAuth', target || "");

			api.authentication.getAuthRedirect({provider: provider}).$promise.then(function(data) {
				console.log("Redirect data:", data);

				$window.location.href = data.redirectUrl;
			}).catch(function(e) {
            	$state.go("authError", {errorMessage: e.data.errorMessage, statusText: e.data.responseCodeType});
			})
		}

		this.providerCallback = function(provider, params) {
			var next = persistence.load('afterAuth');
			persistence.save('afterAuth', '');
            next = next || "/";
            next = next.replace("#!", "");

            params.provider = provider;

            api.authentication.getAuthResult(params).$promise.then(function(u) {
                console.debug("Logged in user:", u);
                console.debug("Redirecting to", next);

                $rootScope.user = u;
                $rootScope.user.$promise.then(function(u){
                	setupUserConsistencyCheck();			
                });

                if (u.firstLogin && '/' == next) {
                	$state.go("accountSettings", {location: "replace"});
                } else {
	                $location.replace();
	                $location.url(next);
                }

            }).catch(function(e) {
            	$state.go("authError", {errorMessage: e.data.errorMessage, statusText: e.data.responseCodeType}, {location: "replace"});
            	cancelUserConsistencyCheck()
            });

		}

		this.linkRedirect = function(provider) {
			persistence.save('afterAuth', '/account');

			api.authentication.getLinkRedirect({provider: provider}).$promise.then(function(data) {
				console.log("Redirect data:", data);

				$window.location.href = data.redirectUrl;
			})

		}

		var interval = null;

		this.logout = function() {
			var p = api.authentication.logout({}).$promise;
			
			p.then(function() {
				$rootScope.user = null;

			}).catch(function(e) {
				console.error("Failed to log out:", e)

			})
			cancelUserConsistencyCheck();
			return p;
		}

		var updateUserPreferences = function() {
			$rootScope.userPreferences = api.user.getUserPreferences();
			return $rootScope.userPreferences.$promise;
		}

		this.updateUser = function() {
			return new Promise(function(resolve, reject) {
				var userResource = api.currentUser.get();
				if (!$rootScope.user) {
					$rootScope.user = userResource;
				}
				
				userResource.$promise.then(function(u) {

					return new Promise(function(resolve, reject) {
						$timeout(function() {
							$rootScope.user = u;
							setupUserConsistencyCheck();
							$rootScope.$apply();
							resolve();
						});
					}).then(updateUserPreferences).then(function() {
						$rootScope.checkForWebSocket(); // Setting $rootScope.user above removes the user snapshot, so ping WebSocket!
						resolve(u);
					});

				}).catch(function(){
					cancelUserConsistencyCheck();
					reject();
				});
			});
		}
		


		this.login = function(userPrototype) {
			// expects the user object to contain an email and password property.
			return new Promise(function(resolve, reject){
				api.authentication.login(userPrototype).$promise.then(function(u){
					$rootScope.user = u;
		        	setupUserConsistencyCheck();
					resolve();
				}).catch(function(e){
					$rootScope.user = {
						resolved: true,
						$promise: Promise.resolve({}),
					};
			        cancelUserConsistencyCheck();
					reject(e);
				});
			});
		}

		var setupUserConsistencyCheck = function() {
			cancelUserConsistencyCheck();
			// Note: Had to use local storage rather than cookies for this because cookies sometimes did not update across browser tabs in chrome.
			// This is especially so when using third party authenticators for some reason.
			// We also need to make sure that we can in fact write to Local Storage before setting the timeout!
			if (persistence.save("currentUserId", $rootScope.user._id)) {

				interval = $interval(function() {
					var currentId = persistence.load("currentUserId")
					if (currentId != $rootScope.user._id) {
		            	cancelUserConsistencyCheck();
		            	$rootScope.modals.userConsistencyError.show();
						// we want to know how often this happens.
						api.logger.log({
							type: "USER_CONSISTENCY_WARNING_SHOWN",
							userAgent: navigator.userAgent,
						});
		            	$rootScope.user = api.currentUser.get();
					}
		        }, 1000)
			} else {
				console.error("Cannot perform user consistency checking!");
				api.logger.log({
					type: "USER_CONSISTENCY_CHECKING_FAILED",
					userAgent: navigator.userAgent,
				});
			}
		}

		var cancelUserConsistencyCheck = function() {
	       	persistence.save("currentUserId", null)
	        if (interval) {
	        	$interval.cancel(interval);
	        	interval = null;
	        }   
		}
	}];

	// this should not be used in the router resolver property as it will only return once.
	// TODO should this be deprecated?
	var promiseLoggedIn = ['auth', '$rootScope', function(auth, $rootScope) {
		return $rootScope.user.$promise.catch(function(r) {
			if (r.status == 401)
				return Promise.reject("require_login");
			return Promise.reject("Something went wrong:", r);
		});
	}];

	return {
		service: service,
		promiseLoggedIn: promiseLoggedIn,
	}
});