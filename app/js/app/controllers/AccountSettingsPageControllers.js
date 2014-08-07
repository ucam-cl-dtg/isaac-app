define([], function() {

	var PageController = ['$scope', 'auth', 'api', '$stateParams', function($scope, auth, api, $stateParams) {

		$scope.user = auth.getUser();

		$scope.save = function() {
			api.account.saveSettings($scope.user);
		}

		$scope.schools = api.schools;
		
	}]

	return {
		PageController: PageController,
	};
})