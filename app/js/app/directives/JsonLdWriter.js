/**
 * Copyright 2014 Stephen Cummins
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import angular from "angular";

define([],function() {

    return [function() {
        return {
            restrict: 'EA',
            scope: {
                script: '='
            },
            link: function(scope, element, attrs) {
                scope.$watch('script', function (newValue, oldValue) {
                    if (newValue.name) {
                        element.empty();
                        let scriptTag = angular.element(document.createElement("script"));
                        scriptTag.attr("type", "application/ld+json")
                        scriptTag.text(JSON.stringify(newValue));
                        element.append(scriptTag);                                
                    }
                });
            }
        };
    }]
})