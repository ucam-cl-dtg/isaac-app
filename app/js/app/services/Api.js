define([], function() {


	
	var Api = function ApiConstructor($resource, server) {

		this.pages = $resource(server + "/api/pages/:id");
		this.content = $resource(server + "/api/pages/:id"); // TODO: Use the actual content endpoint once it is written.
		this.questions = $resource(server + "/api/pages/:id");
		this.concepts = $resource(server + "/api/pages/:id");

		var conceptsPerPage = 10;
		var conceptList = $resource(server + "/api/concepts?start_index=:startIndex&limit=:limit", {}, {'query': {method: 'GET', isArray: false }});
		var questionList = $resource(server + "/api/questions?start_index=:startIndex&limit=:limit", {}, {'query': {method: 'GET', isArray: false }});


		this.getConceptList = function(page){
			return conceptList.query({"startIndex" : page*conceptsPerPage, "limit" : conceptsPerPage});
		}

		this.getQuestionList = function(page){
			return questionList.query({"startIndex" : page*conceptsPerPage, "limit" : conceptsPerPage});
		}

		this.getImageUrl = function(path) {
			// check if the image source is a fully qualified link (suggesting it is external to the Isaac site)
			if(path.indexOf("http") > -1){
				return path;
			}
			else{
				return server + "/api/images/" + path;
			}
		}

		this.admin = {
			synchroniseDatastores: function() {
				$.post(server + "/api/admin/synchronise_datastores").then(function() {
					console.warn("Synchronising Datastores. The next page load will take a while.");
				})
			}
		};
	}

	return Api;
});