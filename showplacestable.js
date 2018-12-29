// ==UserScript==
// @name       Shutterstock show places table
// @namespace  http://gubnota.github.io/fenki_js_helpers/plugin/monkey/
// @version    0.1.7.4
// @downloadURL http://gubnota.github.io/fenki_js_helpers/plugin/monkey/shutter_places/main.user.js
// @description Shows Shutterstock buyers places map spots one-by-one table
// @include        http*://submit.shutterstock.com/dashboard*
// @copyright  2018, Vladislav Muravyev
// @author Vladislav Muravyev
// @grant          none
// @icon http://gubnota.github.io/fenki_js_helpers/plugin/monkey/shutter_places/ss.png
// @run-at document-end
// ==/UserScript==
(function(window,undefined){var w=window;if(w.self!=w.top){return}if(/:\/\/submit\.shutterstock\.com\//.test(w.location.href)){var el=document.getElementById("shutter_places_window_helper_script");if(el===null){(function(f,e,n,k,i){var n=e.createElement(n);n.setAttribute("id","shutter_places_window_helper_script");n.async=true;n.src=k;if(typeof IFrameWindowHelper=="undefined"){n.onload=function(){ShutterPlacesWindowHelperScript.Button()}}(e[i]("head")[0]||e[i]("body")[0]).appendChild(n)})(window,document,"script",(6==document.location.protocol.length?"https:":"http:")+"//gubnota.github.io/fenki_js_helpers/plugin/monkey/shutter_places/window_helper.js","getElementsByTagName")}}})(window);
