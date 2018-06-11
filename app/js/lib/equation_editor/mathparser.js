!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t(require("lodash")):"function"==typeof define&&define.amd?define(["lodash"],t):"object"==typeof exports?exports.mathparser=t(require("lodash")):e.mathparser=t(e._)}(window,function(__WEBPACK_EXTERNAL_MODULE__3__){return function(e){var t={};function r(n){if(t[n])return t[n].exports;var o=t[n]={i:n,l:!1,exports:{}};return e[n].call(o.exports,o,o.exports,r),o.l=!0,o.exports}return r.m=e,r.c=t,r.d=function(e,t,n){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)r.d(n,o,function(t){return e[t]}.bind(null,o));return n},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="",r(r.s=4)}([function(module,exports,__webpack_require__){var __WEBPACK_AMD_DEFINE_FACTORY__,__WEBPACK_AMD_DEFINE_ARRAY__,__WEBPACK_AMD_DEFINE_RESULT__;__WEBPACK_AMD_DEFINE_ARRAY__=[],void 0===(__WEBPACK_AMD_DEFINE_RESULT__="function"==typeof(__WEBPACK_AMD_DEFINE_FACTORY__=function(){"use strict";var hasOwnProperty=Object.prototype.hasOwnProperty,assign="function"==typeof Object.assign?Object.assign:function(e,t){if(null==e)throw new TypeError("Target cannot be null or undefined");e=Object(e);for(var r=1;r<arguments.length;r++){var n=arguments[r];if(null!=n)for(var o in n)hasOwnProperty.call(n,o)&&(e[o]=n[o])}return e},hasSticky="boolean"==typeof(new RegExp).sticky;function isRegExp(e){return e&&e.constructor===RegExp}function isObject(e){return e&&"object"==typeof e&&e.constructor!==RegExp&&!Array.isArray(e)}function reEscape(e){return e.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&")}function reGroups(e){var t=new RegExp("|"+e);return t.exec("").length-1}function reCapture(e){return"("+e+")"}function reUnion(e){var t=e.map(function(e){return"(?:"+e+")"}).join("|");return"(?:"+t+")"}function regexpOrLiteral(e){if("string"==typeof e)return"(?:"+reEscape(e)+")";if(isRegExp(e)){if(e.ignoreCase)throw new Error("RegExp /i flag not allowed");if(e.global)throw new Error("RegExp /g flag is implied");if(e.sticky)throw new Error("RegExp /y flag is implied");if(e.multiline)throw new Error("RegExp /m flag is implied");return e.source}throw new Error("not a pattern: "+e)}function objectToRules(e){for(var t=Object.getOwnPropertyNames(e),r=[],n=0;n<t.length;n++){var o=t[n],s=e[o],i=Array.isArray(s)?s:[s],a=[];i.forEach(function(e){isObject(e)?(a.length&&r.push(ruleOptions(o,a)),r.push(ruleOptions(o,e)),a=[]):a.push(e)}),a.length&&r.push(ruleOptions(o,a))}return r}function arrayToRules(e){for(var t=[],r=0;r<e.length;r++){var n=e[r];if(!n.name)throw new Error("Rule has no name: "+JSON.stringify(n));t.push(ruleOptions(n.name,n))}return t}function ruleOptions(e,t){("object"!=typeof t||Array.isArray(t)||isRegExp(t))&&(t={match:t});var r=assign({tokenType:e,lineBreaks:!!t.error,pop:!1,next:null,push:null,error:!1,value:null,getType:null},t),n=r.match;return r.match=Array.isArray(n)?n:n?[n]:[],r.match.sort(function(e,t){return isRegExp(e)&&isRegExp(t)?0:isRegExp(t)?-1:isRegExp(e)?1:t.length-e.length}),r.keywords&&(r.getType=keywordTransform(r.keywords)),r}function compileRules(e,t){e=Array.isArray(e)?arrayToRules(e):objectToRules(e);for(var r=null,n=[],o=[],s=0;s<e.length;s++){var i=e[s];if(i.error){if(r)throw new Error("Multiple error rules not allowed: (for token '"+i.tokenType+"')");r=i}if(0!==i.match.length){n.push(i);var a=reUnion(i.match.map(regexpOrLiteral)),l=new RegExp(a);if(l.test(""))throw new Error("RegExp matches empty string: "+l);var p=reGroups(a);if(p>0)throw new Error("RegExp has capture groups: "+l+"\nUse (?: … ) instead");if(!t&&(i.pop||i.push||i.next))throw new Error("State-switching options are not allowed in stateless lexers (for token '"+i.tokenType+"')");if(!i.lineBreaks&&l.test("\n"))throw new Error("Rule should declare lineBreaks: "+l);o.push(reCapture(a))}}var u=hasSticky?"":"|(?:)",c=hasSticky?"ym":"gm",h=new RegExp(reUnion(o)+u,c);return{regexp:h,groups:n,error:r}}function compile(e){var t=compileRules(e);return new Lexer({start:t},"start")}function compileStates(e,t){var r=Object.getOwnPropertyNames(e);t||(t=r[0]);for(var n=Object.create(null),o=0;o<r.length;o++){var s=r[o];n[s]=compileRules(e[s],!0)}for(var o=0;o<r.length;o++)for(var i=n[r[o]].groups,a=0;a<i.length;a++){var l=i[a],p=l&&(l.push||l.next);if(p&&!n[p])throw new Error("Missing state '"+p+"' (in token '"+l.tokenType+"' of state '"+r[o]+"')");if(l&&l.pop&&1!=+l.pop)throw new Error("pop must be 1 (in token '"+l.tokenType+"' of state '"+r[o]+"')")}return new Lexer(n,t)}function keywordTransform(map){for(var reverseMap=Object.create(null),byLength=Object.create(null),types=Object.getOwnPropertyNames(map),i=0;i<types.length;i++){var tokenType=types[i],item=map[tokenType],keywordList=Array.isArray(item)?item:[item];keywordList.forEach(function(e){if((byLength[e.length]=byLength[e.length]||[]).push(e),"string"!=typeof e)throw new Error("keyword must be string (in keyword '"+tokenType+"')");reverseMap[e]=tokenType})}function str(e){return JSON.stringify(e)}var source="";for(var length in source+="(function(value) {\n",source+="switch (value.length) {\n",byLength){var keywords=byLength[length];source+="case "+length+":\n",source+="switch (value) {\n",keywords.forEach(function(e){var t=reverseMap[e];source+="case "+str(e)+": return "+str(t)+"\n"}),source+="}\n"}return source+="}\n",source+="})",eval(source)}var Lexer=function(e,t){this.startState=t,this.states=e,this.buffer="",this.stack=[],this.reset()};function tokenToString(){return this.value}if(Lexer.prototype.reset=function(e,t){return this.buffer=e||"",this.index=0,this.line=t?t.line:1,this.col=t?t.col:1,this.setState(t?t.state:this.startState),this},Lexer.prototype.save=function(){return{line:this.line,col:this.col,state:this.state}},Lexer.prototype.setState=function(e){if(e&&this.state!==e){this.state=e;var t=this.states[e];this.groups=t.groups,this.error=t.error||{lineBreaks:!0,shouldThrow:!0},this.re=t.regexp}},Lexer.prototype.popState=function(){this.setState(this.stack.pop())},Lexer.prototype.pushState=function(e){this.stack.push(this.state),this.setState(e)},Lexer.prototype._eat=hasSticky?function(e){return e.exec(this.buffer)}:function(e){var t=e.exec(this.buffer);return 0===t[0].length?null:t},Lexer.prototype._getGroup=function(e){if(null===e)return-1;for(var t=this.groups.length,r=0;r<t;r++)if(void 0!==e[r+1])return r;throw new Error("oops")},Lexer.prototype.next=function(){var e=this.re,t=this.buffer,r=e.lastIndex=this.index;if(r!==t.length){var n,o,s=this._eat(e),i=this._getGroup(s);-1===i?(n=this.error,o=t.slice(r)):(o=s[0],n=this.groups[i]);var a=0;if(n.lineBreaks){var l=/\n/g,p=1;if("\n"===o)a=1;else for(;l.exec(o);)a++,p=l.lastIndex}var u={type:n.getType&&n.getType(o)||n.tokenType,value:n.value?n.value(o):o,text:o,toString:tokenToString,offset:r,lineBreaks:a,line:this.line,col:this.col},c=o.length;if(this.index+=c,this.line+=a,0!==a?this.col=c-p+1:this.col+=c,n.shouldThrow)throw new Error(this.formatError(u,"invalid syntax"));return n.pop?this.popState():n.push?this.pushState(n.push):n.next&&this.setState(n.next),u}},"undefined"!=typeof Symbol&&Symbol.iterator){var LexerIterator=function(e){this.lexer=e};LexerIterator.prototype.next=function(){var e=this.lexer.next();return{value:e,done:!e}},LexerIterator.prototype[Symbol.iterator]=function(){return this},Lexer.prototype[Symbol.iterator]=function(){return new LexerIterator(this)}}return Lexer.prototype.formatError=function(e,t){var r=e.value,n=e.offset,o=e.lineBreaks?r.indexOf("\n"):r.length,s=Math.max(0,n-e.col+1),i=this.buffer.substring(s,n+o);return t+=" at line "+e.line+" col "+e.col+":\n\n",t+="  "+i+"\n",t+="  "+Array(e.col).join(" ")+"^"},Lexer.prototype.clone=function(){return new Lexer(this.states,this.state)},Lexer.prototype.has=function(e){for(var t in this.states)for(var r=this.states[t].groups,n=0;n<r.length;n++){var o=r[n];if(o.tokenType===e)return!0;if(o.keywords&&hasOwnProperty.call(o.keywords,e))return!0}return!1},{compile:compile,states:compileStates,error:Object.freeze({error:!0})}})?__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports,__WEBPACK_AMD_DEFINE_ARRAY__):__WEBPACK_AMD_DEFINE_FACTORY__)||(module.exports=__WEBPACK_AMD_DEFINE_RESULT__)},function(e,t,r){!function(){function t(e){return e[0]}function n(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}var o={alpha:"α",beta:"β",gamma:"γ",delta:"δ",epsilon:"ε",varepsilon:"ε",zeta:"ζ",eta:"η",theta:"θ",iota:"ι",kappa:"κ",lambda:"λ",mu:"μ",nu:"ν",xi:"ξ",omicron:"ο",pi:"π",rho:"ρ",sigma:"σ",tau:"τ",upsilon:"υ",phi:"ϕ",chi:"χ",psi:"ψ",omega:"ω",Gamma:"Γ",Delta:"Δ",Theta:"Θ",Lambda:"Λ",Xi:"Ξ",Pi:"Π",Sigma:"Σ",Upsilon:"Υ",Phi:"Φ",Psi:"Ψ",Omega:"Ω"},s=r(0).compile({Int:/[0-9]+/,Id:{match:/[a-zA-Z]+(?:_[a-zA-Z0-9]+)?/,keywords:{Fn:["cos","sin","tan","cosec","sec","cot","arccos","arcsin","arctan","arccosec","arcsec","arccot","cosh","sinh","tanh","cosech","sech","coth","arccosh","arcsinh","arctanh","arccosech","arcsech","arccoth","log","ln"],Radix:["sqrt"]}},Rel:["=","==","<","<=",">",">="],c:/./}),i=null;try{i=window}catch(e){i={innerWidth:800,innerHeight:600}}var a=function(e){for(var t=e;t.children.right;)t=t.children.right;return t},l=function(e){var t=_.cloneDeep(e[0]),r=_.cloneDeep(e[4]);return a(t).children.right=r,t},p=function(e){var t=_.cloneDeep(e[0]),r=_.cloneDeep(e[4]);return a(t).children.right={type:"BinaryOperation",properties:{operation:e[2].text},children:{right:r}},t},u=function(e){var t=_.map(e.split(""),function(e){return/[0-9]/.test(e)?c([{text:e}]):{type:"Symbol",properties:{letter:e},children:{}}});return _.reduceRight(t,function(e,t){return t.children.right=e,t})},c=function(e){return{type:"Num",properties:{significand:e[0].text},children:{}}},h={Lexer:s,ParserRules:[{name:"main",symbols:["_","AS","_"],postprocess:function(e){var t=_.cloneDeep(e[1]);return t.position={x:i.innerWidth/4,y:i.innerHeight/3},t.expression={latex:"",python:""},t}},{name:"main",symbols:["_","AS","_",s.has("Rel")?{type:"Rel"}:Rel,"_","AS","_"],postprocess:function(e){var t=_.cloneDeep(e[1]),r=_.cloneDeep(e[5]),o={type:"Relation",properties:{relation:"=="===e[3].text?"=":e[3].text},children:{rhs:r}};return a(t).children.right=o,function(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{},o=Object.keys(r);"function"==typeof Object.getOwnPropertySymbols&&(o=o.concat(Object.getOwnPropertySymbols(r).filter(function(e){return Object.getOwnPropertyDescriptor(r,e).enumerable}))),o.forEach(function(t){n(e,t,r[t])})}return e}({},t,{position:{x:i.innerWidth/4,y:i.innerHeight/3},expression:{latex:"",python:""}})}},{name:"P",symbols:[{literal:"("},"_","AS","_",{literal:")"}],postprocess:function(e){return{type:"Brackets",properties:{type:"round"},children:{argument:_.cloneDeep(e[2])}}}},{name:"P",symbols:[s.has("Fn")?{type:"Fn"}:Fn,{literal:"("},"_","AS","_",{literal:")"}],postprocess:function(e){var t=_.cloneDeep(e[3]);return{type:"Fn",properties:{name:e[0].text,allowSubscript:"ln"!==e[0].text,innerSuperscript:!1},children:{argument:t}}}},{name:"P",symbols:[s.has("Fn")?{type:"Fn"}:Fn,{literal:"^"},"NUM",{literal:"("},"_","AS","_",{literal:")"}],postprocess:function(e){var t=_.cloneDeep(e[5]),r=_.cloneDeep(e[2]);return{type:"Fn",properties:{name:e[0].text,allowSubscript:!1,innerSuperscript:!0},children:{superscript:r,argument:t}}}},{name:"P",symbols:[s.has("Radix")?{type:"Radix"}:Radix,{literal:"("},"_","AS","_",{literal:")"}],postprocess:function(e){return{type:"Radix",children:{argument:_.cloneDeep(e[3])}}}},{name:"P",symbols:["VAR"],postprocess:t},{name:"P",symbols:["NUM"],postprocess:t},{name:"E",symbols:["P","_",{literal:"^"},"_","E"],postprocess:function(e){var t=_.cloneDeep(e[0]),r=_.cloneDeep(e[4]);if("Fn"!==t.type)return t.children.superscript=r,t;switch(t.properties.name){case"ln":case"log":return{type:"Brackets",properties:{type:"round"},children:{argument:t,superscript:r}};default:return t.properties.superscript=r,t}}},{name:"E",symbols:["P"],postprocess:t},{name:"MD",symbols:["MD","_",{literal:"*"},"_","E"],postprocess:l},{name:"MD",symbols:["MD","_",{literal:" "},"_","E"],postprocess:l},{name:"MD",symbols:["MD","_",{literal:"/"},"_","E"],postprocess:function(e){return{type:"Fraction",children:{numerator:_.cloneDeep(e[0]),denominator:_.cloneDeep(e[4])}}}},{name:"MD",symbols:["E"],postprocess:t},{name:"AS",symbols:["AS","_",{literal:"+"},"_","MD"],postprocess:p},{name:"AS",symbols:["AS","_",{literal:"-"},"_","MD"],postprocess:p},{name:"AS",symbols:["MD"],postprocess:t},{name:"VAR",symbols:[s.has("Id")?{type:"Id"}:Id],postprocess:function(e){var t=new RegExp(_.keys(o).join("|"),"g"),r=e[0].text.replace(t,function(e){return o[e]||e}).split("_"),n=u(r[0]);if(r.length>1){var s=u(r[1]);a(n).children.subscript=s}return n}},{name:"NUM",symbols:[s.has("Int")?{type:"Int"}:Int],postprocess:c},{name:"_$ebnf$1",symbols:[]},{name:"_$ebnf$1",symbols:["_$ebnf$1",/[\s]/],postprocess:function(e){return e[0].concat([e[1]])}},{name:"_",symbols:["_$ebnf$1"]}],ParserStart:"main"};void 0!==e&&void 0!==e.exports?e.exports=h:window.grammar=h}()},function(e,t){var r,n;r=this,n=function(){function e(t,r,n){return this.id=++e.highestId,this.name=t,this.symbols=r,this.postprocess=n,this}function t(e,t,r,n){this.rule=e,this.dot=t,this.reference=r,this.data=[],this.wantedBy=n,this.isComplete=this.dot===e.symbols.length}function r(e,t){this.grammar=e,this.index=t,this.states=[],this.wants={},this.scannable=[],this.completed={}}function n(e,t){this.rules=e,this.start=t||this.rules[0].name;var r=this.byName={};this.rules.forEach(function(e){r.hasOwnProperty(e.name)||(r[e.name]=[]),r[e.name].push(e)})}function o(){this.reset("")}function s(e,t,s){if(e instanceof n){var i=e;s=t}else i=n.fromCompiled(e,t);for(var a in this.grammar=i,this.options={keepHistory:!1,lexer:i.lexer||new o},s||{})this.options[a]=s[a];this.lexer=this.options.lexer,this.lexerState=void 0;var l=new r(i,0);this.table=[l];l.wants[i.start]=[],l.predict(i.start),l.process(),this.current=0}return e.highestId=0,e.prototype.toString=function(e){function t(e){return e.literal?JSON.stringify(e.literal):e.type?"%"+e.type:e.toString()}var r=void 0===e?this.symbols.map(t).join(" "):this.symbols.slice(0,e).map(t).join(" ")+" ● "+this.symbols.slice(e).map(t).join(" ");return this.name+" → "+r},t.prototype.toString=function(){return"{"+this.rule.toString(this.dot)+"}, from: "+(this.reference||0)},t.prototype.nextState=function(e){var r=new t(this.rule,this.dot+1,this.reference,this.wantedBy);return r.left=this,r.right=e,r.isComplete&&(r.data=r.build()),r},t.prototype.build=function(){var e=[],t=this;do{e.push(t.right.data),t=t.left}while(t.left);return e.reverse(),e},t.prototype.finish=function(){this.rule.postprocess&&(this.data=this.rule.postprocess(this.data,this.reference,s.fail))},r.prototype.process=function(e){for(var t=this.states,r=this.wants,n=this.completed,o=0;o<t.length;o++){var i=t[o];if(i.isComplete){if(i.finish(),i.data!==s.fail){for(var a=i.wantedBy,l=a.length;l--;){var p=a[l];this.complete(p,i)}if(i.reference===this.index){var u=i.rule.name;(this.completed[u]=this.completed[u]||[]).push(i)}}}else{if("string"!=typeof(u=i.rule.symbols[i.dot])){this.scannable.push(i);continue}if(r[u]){if(r[u].push(i),n.hasOwnProperty(u)){var c=n[u];for(l=0;l<c.length;l++){var h=c[l];this.complete(i,h)}}}else r[u]=[i],this.predict(u)}}},r.prototype.predict=function(e){for(var r=this.grammar.byName[e]||[],n=0;n<r.length;n++){var o=r[n],s=this.wants[e],i=new t(o,0,this.index,s);this.states.push(i)}},r.prototype.complete=function(e,t){var r=e.nextState(t);this.states.push(r)},n.fromCompiled=function(t,r){var o=t.Lexer;t.ParserStart&&(r=t.ParserStart,t=t.ParserRules);var s=new n(t=t.map(function(t){return new e(t.name,t.symbols,t.postprocess)}),r);return s.lexer=o,s},o.prototype.reset=function(e,t){this.buffer=e,this.index=0,this.line=t?t.line:1,this.lastLineBreak=t?-t.col:0},o.prototype.next=function(){if(this.index<this.buffer.length){var e=this.buffer[this.index++];return"\n"===e&&(this.line+=1,this.lastLineBreak=this.index),{value:e}}},o.prototype.save=function(){return{line:this.line,col:this.index-this.lastLineBreak}},o.prototype.formatError=function(e,t){var r=this.buffer;if("string"==typeof r){var n=r.indexOf("\n",this.index);-1===n&&(n=r.length);var o=r.substring(this.lastLineBreak,n),s=this.index-this.lastLineBreak;return t+=" at line "+this.line+" col "+s+":\n\n",t+="  "+o+"\n",t+="  "+Array(s).join(" ")+"^"}return t+" at index "+(this.index-1)},s.fail={},s.prototype.feed=function(e){var t,n=this.lexer;for(n.reset(e,this.lexerState);t=n.next();){var s=this.table[this.current];this.options.keepHistory||delete this.table[this.current-1];var i=this.current+1,a=new r(this.grammar,i);this.table.push(a);for(var l=t.value,p=n.constructor===o?t.value:t,u=s.scannable,c=u.length;c--;){var h=u[c],f=h.rule.symbols[h.dot];if(f.test?f.test(p):f.type?f.type===t.type:f.literal===l){var y=h.nextState({data:p,token:t,isToken:!0,reference:i-1});a.states.push(y)}}if(a.process(),0===a.states.length){var m=this.lexer.formatError(t,"invalid syntax")+"\n";m+="Unexpected "+(t.type?t.type+" token: ":""),m+=JSON.stringify(void 0!==t.value?t.value:t)+"\n";var d=new Error(m);throw d.offset=this.current,d.token=t,d}this.options.keepHistory&&(s.lexerState=n.save()),this.current++}return s&&(this.lexerState=n.save()),this.results=this.finish(),this},s.prototype.save=function(){var e=this.table[this.current];return e.lexerState=this.lexerState,e},s.prototype.restore=function(e){var t=e.index;this.current=t,this.table[t]=e,this.table.splice(t+1),this.lexerState=e.lexerState,this.results=this.finish()},s.prototype.rewind=function(e){if(!this.options.keepHistory)throw new Error("set option `keepHistory` to enable rewinding");this.restore(this.table[e])},s.prototype.finish=function(){var e=[],t=this.grammar.start;return this.table[this.table.length-1].states.forEach(function(r){r.rule.name===t&&r.dot===r.rule.symbols.length&&0===r.reference&&r.data!==s.fail&&e.push(r)}),e.map(function(e){return e.data})},{Parser:s,Grammar:n,Rule:e}},"object"==typeof e&&e.exports?e.exports=n():r.nearley=n()},function(e,t){e.exports=__WEBPACK_EXTERNAL_MODULE__3__},function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.parseExpression=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",t=new n.Parser(i),r=null;try{r=t.feed(e).results}catch(e){r={error:e}}return r};s(r(3));var n=r(2),o=s(r(1));function s(e){return e&&e.__esModule?e:{default:e}}var i=n.Grammar.fromCompiled(o.default)}])});