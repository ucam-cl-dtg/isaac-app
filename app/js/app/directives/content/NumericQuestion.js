define(["app/honest/responsive_video"], function(rv) {

	return ["api", "units", function(api, units) {

		return {
			scope: true,

			restrict: 'A',

			templateUrl: "/partials/content/NumericQuestion.html",

			link: function(scope, element, attrs) {

				scope.selectedChoice = {
					type: "quantity",
				};

				scope.toggleUnitsDropdown = function() {

					if (scope.unitsDropdownStyle) {
						scope.unitsDropdownStyle = null;
					} else {
						var btnPos = element.find("button").offset();
						var parent = element.find("button").parent().offset();

						scope.unitsDropdownStyle = {
							top: btnPos.top + btnPos.height - parent.top,
							left: btnPos.left - parent.left,
						}
					}
				}

				scope.unitOptions = [];

				units.getUnits().then(function(allUnits) {

					// Add potential units to options list
					for (var i in scope.doc.knownUnits) {
						var unitsFromQuestion = scope.doc.knownUnits[i];

						if (unitsFromQuestion && scope.unitOptions.indexOf(unitsFromQuestion) == -1) 
							scope.unitOptions.push(unitsFromQuestion);
					}

					var unitsPool = JSON.parse(JSON.stringify(allUnits));

					while (scope.unitOptions.length < 6) {
						// Fill the unit options up with other random units
						var u = unitsPool.splice(Math.floor(Math.random() * unitsPool.length), 1)[0].replace("\\\\", "\\");

						if (scope.unitOptions.indexOf(u) == -1) {
							// Splice the randomly selected units into a randomly selected location
							scope.unitOptions.splice(Math.floor(Math.random() * (scope.unitOptions.length + 1)), 0, u);
						}
					}

					scope.selectedUnitsDisplay = "";

				})

				scope.selectUnit = function(u) {
					scope.selectedChoice.units = u;

					if (scope.selectedChoice.units != undefined) {
						if (scope.selectedChoice.units == "")
							scope.selectedUnitsDisplay = "None";
						else
							scope.selectedUnitsDisplay = "$\\units{" + scope.selectedChoice.units + "}$";
					} else {
						scope.selectedUnitsDisplay = "";
					}
					scope.chosenUnitsForDisplay = 
					scope.unitsDropdownStyle = null;
				}

				scope.$watch("validationResponse", function(r, oldR) {
					if (!r && r === oldR) {
						return; // Init
					}
					
					if(r) {

						scope.selectedChoice.value = r.answer.value;
						scope.selectUnit(r.answer.units);

						if (scope.accordionSection) {
							if (r.correct) {
								scope.accordionSection.titleSuffix = "$\\quantity{ " + scope.selectedChoice.value + " }{ " + (scope.selectedChoice.units || "") + " }$  ✓";
							} else {							
								scope.accordionSection.titleSuffix = "";
							}

							scope.accordionSection.correctAnswerFlag.isCorrect = r.correct;
						}
					} else {

						// The user started changing their answer after a previous validation response.

						// Just in case this is the initialisation of scope.validationResponse, 
						// remove any watch the accordion might have.
						
						if (scope.accordionSection)
							scope.accordionSection.correctAnswerFlag.unwatch();
					}

				})

			}
		};
	}];
});