!function(e){function t(r){if(n[r])return n[r].exports;var o=n[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,t),o.l=!0,o.exports}var n={};return t.m=e,t.c=n,t.i=function(e){return e},t.d=function(e,t,n){Object.defineProperty(e,t,{configurable:!1,enumerable:!0,get:n})},t.n=function(e){var n=e&&e.__esModule?function(){return e["default"]}:function(){return e};return t.d(n,"a",n),n},t.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t.p="/generator-confit.git/",t(t.s=19)}([,function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),n(17),t["default"]=function(){console.log("badge")}()},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t["default"]=function(){function e(e){return e.keys().map(e)}e(n(5))}()},,,function(e,t,n){function r(e){return n(o(e))}function o(e){var t=a[e];if(!(t+1))throw new Error("Cannot find module '"+e+"'.");return t}var a={"./badge/index.js":1};r.keys=function(){return Object.keys(a)},r.resolve=o,e.exports=r,r.id=5},,,,,function(e,t,n){t=e.exports=n(11)(),t.push([e.i,".badge,.badge__browser,.badge__grunt,.badge__node,.badge__npm,.badge__protractor,.badge__webpack{display:inline-block;min-width:10px;padding:3px 7px;font-size:1.2rem;font-weight:700;color:#fff;line-height:1;vertical-align:middle;white-space:nowrap;text-align:center;background-color:#ccc;border-radius:10px}.badge>p,.badge__browser>p,.badge__grunt>p,.badge__node>p,.badge__npm>p,.badge__protractor>p,.badge__webpack>p{margin:0}h3 .badge,h3 .badge__browser,h3 .badge__grunt,h3 .badge__node,h3 .badge__npm,h3 .badge__protractor,h3 .badge__webpack{position:relative;top:-2px}.badge__browser{background-color:#d00}.badge__browser:before{content:'Browser'}.badge__node{background-color:#08d}.badge__node:before{content:'NodeJS'}.badge__grunt{background-color:#000}.badge__grunt:before{content:'Grunt'}.badge__npm{background-color:#f0dc00;color:#000}.badge__npm:before{content:'NPM'}.badge__protractor{background-color:purple}.badge__protractor:before{content:'Protractor'}.badge__webpack{background-color:green}.badge__webpack:before{content:'Webpack'}",""])},function(e,t){e.exports=function(){var e=[];return e.toString=function(){for(var e=[],t=0;t<this.length;t++){var n=this[t];n[2]?e.push("@media "+n[2]+"{"+n[1]+"}"):e.push(n[1])}return e.join("")},e.i=function(t,n){"string"==typeof t&&(t=[[null,t,""]]);for(var r={},o=0;o<this.length;o++){var a=this[o][0];"number"==typeof a&&(r[a]=!0)}for(o=0;o<t.length;o++){var i=t[o];"number"==typeof i[0]&&r[i[0]]||(n&&!i[2]?i[2]=n:n&&(i[2]="("+i[2]+") and ("+n+")"),e.push(i))}},e}},,,,,function(e,t){function n(e,t){for(var n=0;n<e.length;n++){var r=e[n],o=p[r.id];if(o){o.refs++;for(var a=0;a<o.parts.length;a++)o.parts[a](r.parts[a]);for(;a<r.parts.length;a++)o.parts.push(u(r.parts[a],t))}else{for(var i=[],a=0;a<r.parts.length;a++)i.push(u(r.parts[a],t));p[r.id]={id:r.id,refs:1,parts:i}}}}function r(e){for(var t=[],n={},r=0;r<e.length;r++){var o=e[r],a=o[0],i=o[1],c=o[2],u=o[3],s={css:i,media:c,sourceMap:u};n[a]?n[a].parts.push(s):t.push(n[a]={id:a,parts:[s]})}return t}function o(e,t){var n=g(),r=v[v.length-1];if("top"===e.insertAt)r?r.nextSibling?n.insertBefore(t,r.nextSibling):n.appendChild(t):n.insertBefore(t,n.firstChild),v.push(t);else{if("bottom"!==e.insertAt)throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");n.appendChild(t)}}function a(e){e.parentNode.removeChild(e);var t=v.indexOf(e);t>=0&&v.splice(t,1)}function i(e){var t=document.createElement("style");return t.type="text/css",o(e,t),t}function c(e){var t=document.createElement("link");return t.rel="stylesheet",o(e,t),t}function u(e,t){var n,r,o;if(t.singleton){var u=_++;n=h||(h=i(t)),r=s.bind(null,n,u,!1),o=s.bind(null,n,u,!0)}else e.sourceMap&&"function"==typeof URL&&"function"==typeof URL.createObjectURL&&"function"==typeof URL.revokeObjectURL&&"function"==typeof Blob&&"function"==typeof btoa?(n=c(t),r=f.bind(null,n),o=function(){a(n),n.href&&URL.revokeObjectURL(n.href)}):(n=i(t),r=d.bind(null,n),o=function(){a(n)});return r(e),function(t){if(t){if(t.css===e.css&&t.media===e.media&&t.sourceMap===e.sourceMap)return;r(e=t)}else o()}}function s(e,t,n,r){var o=n?"":r.css;if(e.styleSheet)e.styleSheet.cssText=m(t,o);else{var a=document.createTextNode(o),i=e.childNodes;i[t]&&e.removeChild(i[t]),i.length?e.insertBefore(a,i[t]):e.appendChild(a)}}function d(e,t){var n=t.css,r=t.media;if(r&&e.setAttribute("media",r),e.styleSheet)e.styleSheet.cssText=n;else{for(;e.firstChild;)e.removeChild(e.firstChild);e.appendChild(document.createTextNode(n))}}function f(e,t){var n=t.css,r=t.sourceMap;r&&(n+="\n/*# sourceMappingURL=data:application/json;base64,"+btoa(unescape(encodeURIComponent(JSON.stringify(r))))+" */");var o=new Blob([n],{type:"text/css"}),a=e.href;e.href=URL.createObjectURL(o),a&&URL.revokeObjectURL(a)}var p={},l=function(e){var t;return function(){return"undefined"==typeof t&&(t=e.apply(this,arguments)),t}},b=l(function(){return/msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase())}),g=l(function(){return document.head||document.getElementsByTagName("head")[0]}),h=null,_=0,v=[];e.exports=function(e,t){if("undefined"!=typeof DEBUG&&DEBUG&&"object"!=typeof document)throw new Error("The style-loader cannot be used in a non-browser environment");t=t||{},"undefined"==typeof t.singleton&&(t.singleton=b()),"undefined"==typeof t.insertAt&&(t.insertAt="bottom");var o=r(e);return n(o,t),function(e){for(var a=[],i=0;i<o.length;i++){var c=o[i],u=p[c.id];u.refs--,a.push(u)}if(e){var s=r(e);n(s,t)}for(var i=0;i<a.length;i++){var u=a[i];if(0===u.refs){for(var d=0;d<u.parts.length;d++)u.parts[d]();delete p[u.id]}}}};var m=function(){var e=[];return function(t,n){return e[t]=n,e.filter(Boolean).join("\n")}}()},function(e,t,n){var r=n(10);"string"==typeof r&&(r=[[e.i,r,""]]);n(16)(r,{});r.locals&&(e.exports=r.locals)},,function(e,t,n){e.exports=n(2)}]);
//# sourceMappingURL=snippets.4ed0ae05.bundle.js.map