define(["/partials/equation_editor/canvas_symbol.html"], function(templateUrl) {

	return ["$timeout", function(_$timeout) {

		return {
            scope: {
            	symbol: "=",
            	selected: "=",
                symbolId: "=",
            },
			restrict: "A",
			templateUrl: templateUrl,
			link: function(scope, element, _attrs) {
                scope.name+="CANVAS SYMBOL"

                let renderToken = function() {
                    let newt = scope.symbol.token;

                    if (newt && scope.symbol.type == "string") {
                        let el = element.find(".canvas-symbol");
                        let rt = el.find(".katex-render-target");

                        // Set style here as ng-style has not been processed yet, so measurements will be wrong otherwise.
                        el.css({
                            fontSize: scope.symbol.fontSize,
                            lineHeight: scope.symbol.lineHeight,
                        });

                        katex.render(scope.symbol.token, rt[0]);

                        el.css({
                            marginLeft: -el.width()/2,
                            marginTop: -el.height()/2
                        });
                    }
                };

                scope.$watch("symbol.token", renderToken);
                scope.$watch("symbol.fontSize", renderToken);

                let mousedown = function(e) {
                    scope.$emit("selection_grab", scope.symbolId, "move", e);
                }
                
                let touchStart = function(e) {
                    e = e.originalEvent;
                    if(e.touches.length == 1) {
                        scope.$emit("selection_grab", scope.symbolId, "move", e);
                        element.on("touchmove", touchMove);
                        element.on("touchend", touchEnd);
                    }
                }

                let touchMove = function(e) {
                    e = e.originalEvent;
                    if (e.touches.length == 1) {
                        scope.$emit("selection_drag", e.touches[0].pageX, e.touches[0].pageY, e);
                        e.stopPropagation();
                        e.preventDefault();
                    }
                }

                let touchEnd = function(e) {
                    e = e.originalEvent;
                    if (e.changedTouches.length == 1) {
                        scope.$emit("selection_drop", e.changedTouches[0].pageX, e.changedTouches[0].pageY, e);
                        e.stopPropagation();
                        e.preventDefault();

                        element.off("touchmove", touchMove);
                        element.off("touchend", touchEnd);
                    }
                }

                element.on("mousedown", mousedown);
                element.on("touchstart", touchStart);

			},
		};
	}];
});