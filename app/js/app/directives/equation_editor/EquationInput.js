"use strict";
define(function(require) {

    var MySketch = require("inequality").MySketch;
    var mathparser = require("lib/equation_editor/mathparser.js");

    return ["$timeout", "$rootScope", "api", function($timeout, $rootScope, api) {

        return {
            scope: {
                state: "=",
                questionDoc: "=",
                editorMode: "=",
            },
            restrict: "A",
            templateUrl: "/partials/equation_editor/equation_input.html",
            link: function(scope, element, attrs) {
                scope.textEntryError = [];
                if (scope.questionDoc && scope.questionDoc.availableSymbols) {
                    try {
                        scope.symbolList = scope.questionDoc.availableSymbols.map(function (str) {return str.trim().replace(';', ',')}).join(", ");
                    } catch (err) {
                        // Do not let invalid availableSymbols prevent anyone from answering the question!
                        scope.symbolList = null;
                    }
                }

                scope.selectedSymbols = [];

                var letterMap = {"\\alpha": "α", "\\beta": "β", "\\gamma": "γ", "\\delta": "δ", "\\epsilon": "ε", "\\varepsilon": "ε", "\\zeta": "ζ", "\\eta": "η", "\\theta": "θ", "\\iota": "ι", "\\kappa": "κ", "\\lambda": "λ", "\\mu": "μ", "\\nu": "ν", "\\xi": "ξ", "\\omicron": "ο", "\\pi": "π", "\\rho": "ρ", "\\sigma": "σ", "\\tau": "τ", "\\upsilon": "υ", "\\phi": "ϕ", "\\chi": "χ", "\\psi": "ψ", "\\omega": "ω", "\\Gamma": "Γ", "\\Delta": "Δ", "\\Theta": "Θ", "\\Lambda": "Λ", "\\Xi": "Ξ", "\\Pi": "Π", "\\Sigma": "Σ", "\\Upsilon": "Υ", "\\Phi": "Φ", "\\Psi": "Ψ", "\\Omega": "Ω"};
                var inverseLetterMap = {};
                for (var k in letterMap) {
                    inverseLetterMap[letterMap[k]] = k;
                }
                inverseLetterMap["ε"] = "\\varepsilon"; // Make sure that this one wins.

                var sketch = null;
                var editorCanvas = element.find(".equation-editor-text-entry")[0];
                var p = new p5(function (p) {
                    sketch = new MySketch(p, scope, element.width(), element.height(), [], true);
                    $rootScope.sketch = sketch;
                    return sketch;
                }, editorCanvas);

                var timer = null;
                scope.textEdit = function() {
                    // This is on a keyUp event so it should not fire when showEquationEditor returns (see below)
                    if (timer) {
                        $timeout.cancel(timer);
                        timer = null;
                    }
                    timer = $timeout(function() {
                        var pycode = element.find(".eqn-text-input")[0].value;
                        var parsedExpression = mathparser.parseExpression(pycode);
                        sketch.symbols.length = 0;
                        if (parsedExpression.length > 0) {
                            console.log(parsedExpression[0]);
                            sketch.parseSubtreeObject(parsedExpression[0]);
                        }

                        var openBracketsCount = pycode.split('(').length - 1;
                        var closeBracketsCount = pycode.split(')').length - 1;

                        scope.state.textEntry = true;
                        var regexStr = "[^ (-)*-/0-9<->A-Z^-_a-z±²-³¼-¾×÷]+";
                        var badCharacters = RegExp(regexStr);
                        var goodCharacters = RegExp(regexStr.replace("^", ""), 'g');
                        scope.textEntryError = [];
                        if (/\\[a-zA-Z()]|[{}]/.test(pycode)) {
                            scope.textEntryError.push('LaTeX syntax is not supported.');
                        }
                        if (badCharacters.test(pycode)) {
                            scope.textEntryError.push('Some of the characters you are using are not allowed: ' + _.uniq(pycode.replace(goodCharacters, '')).join(' '));
                        }
                        if (openBracketsCount != closeBracketsCount) {
                            scope.textEntryError.push('You are missing some ' + (closeBracketsCount > openBracketsCount ? 'opening' : 'closing') + ' brackets.');
                        }
                        if (/\.[0-9]/.test(pycode)) {
                            scope.textEntryError.push('Please convert decimal numbers to fractions.');
                        }
                    }, 250);
                };

                var replaceSpecialChars = function (s) {
                    for (var k in inverseLetterMap) {
                        // Special characters have special needs (i.e., a space after them).
                        // If the special character is followed by a non-special character, add a space:
                        s = s.replace(new RegExp(k + "(?=[A-Za-z0-9])", "g"), inverseLetterMap[k] + ' ');
                        // Otherwise just replace it.
                        s = s.replace(new RegExp(k, "g"), inverseLetterMap[k]);
                    }
                    return s;
                };

                scope.newEditorState = function (s) {
                    scope.state = s;

                    console.log("New state:", s);

                    var rp = $(".eqn-preview");
                    rp.empty();

                    // this renders the result in the preview box in the bottom right corner of the eqn editor
                    if (scope.state.result) {
                        scope.state.result["tex"] = replaceSpecialChars(scope.state.result["tex"]);
                        scope.state.result["python"] = replaceSpecialChars(scope.state.result["python"]).replace(/\\/g, "").replace(/varepsilon/g, "epsilon");
                        katex.render(scope.state.result["tex"], rp[0]);
                    }

                    // TODO: Set the initial state?
                };

                scope.edit = function() {

                    history.pushState({'null':'is null'}, "A Fake Title", window.location.href);
                    window.onpopstate = function(e) {
                        e.preventDefault();
                        $("#equationModal").foundation("reveal", "close");
                    };

                    $rootScope.showEquationEditor(scope.state, scope.questionDoc, scope.editorMode).then(function(finalState) {
                        scope.state = finalState;
                        if (finalState.hasOwnProperty("result") && finalState.result.hasOwnProperty("python")) {
                            element.find(".eqn-text-input")[0].value = finalState.result.python;
                        }
                        scope.$apply();
                    });
                };

                scope.$watch("state", function(s) {
                    if (s && s.result) {
                        // We have an existing answer to the question.
                        // If we have the LaTeX form, render it; else answer was typed:
                        if (s.result.tex) {
                            katex.render(s.result.tex, element.find(".eqn-preview")[0]);
                        } else {
                            element.find(".eqn-preview").html("Click to replace your typed answer");
                        }
                        // If we have the python form, add it to the text entry box (unless we're currently typing in the box; Safari bug!):
                        if (s.result.python && !(element.find(".eqn-text-input")[0] === document.activeElement)) {
                            element.find(".eqn-text-input")[0].value = s.result.python;
                        }
                    } else if (scope.questionDoc) {
                        // This is a question part not yet attempted:
                        element.find(".eqn-preview").html("Click to enter your answer");
                    } else {
                        // This is probably the /equality page:
                        element.find(".eqn-preview").html("Click to enter a formula!");
                    }
                })
            }
        };
    }];
});
