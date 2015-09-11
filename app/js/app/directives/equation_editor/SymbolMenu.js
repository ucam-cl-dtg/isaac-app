define([], function() {

	return [function() {

		return {
			priority: 0,
            scope: {
            	symbols: "=",
            },
			restrict: "A",
			templateUrl: "/partials/equation_editor/symbol_menu.html",
			link: function(scope, element, attrs) {
				scope.name="SYMBOLMENU"

				var lst = element.find("ul");
				var bufferedLeft = 0;
				var absorbSymbolDrag = function($e, pageX, pageY, deltaX, deltaY) {

					bufferedLeft += deltaX;

					newLeft = bufferedLeft;

					if (newLeft > 0) {
						newLeft = 0;
					}
					else if (newLeft < element.width() - lst.outerWidth()) {
						if (element.width() < lst.outerWidth()) {
							newLeft = element.width() - lst.outerWidth();
						} else {
							newLeft = 0;
						}
					}

					lst.css("left", newLeft);

					if (pageY > element.offset().top + element.height()) {
						scope.$emit("triggerCloseMenus");
					}

					scope.$emit("newSymbolDrag", pageX, pageY);
				}

				var abortSymbolDrag = function($e, symbol, pageX, pageY) {
					bufferedLeft = parseFloat(lst.css("left"));

                    // If we've dropped outside the menu, spawn this symbol.
                    if (pageY > element.offset().top + element.height()) {
                        scope.$emit("spawnSymbol", symbol, pageX, pageY);
                    } else {
                    	scope.$emit("newSymbolAbortDrag");
                    }
				}

				abortSymbolDrag();

				scope.$on("symbolDrag", absorbSymbolDrag)
				scope.$on("symbolDrop", abortSymbolDrag)
			},
		};
	}];
});