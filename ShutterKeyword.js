// ==UserScript==
// @name         ShutterKeyword
// @namespace
// @version      1.0
// @description  Extract the keyword from Shutter Stock Preview Page
// @author       Satinka
// @match        https://www.shutterstock.com/*image-photo*
// @match        https://www.shutterstock.com/image-vector*
// @match        https://www.shutterstock.com/image-illustration*
// @copyright    2016, Naphong
// @require      http://code.jquery.com/jquery-latest.min.js
// @grant        none



// ==/UserScript==
/* jshint -W097 */
'use strict';

// =========== PARAMETERS ===========



//===================================

var $j = jQuery.noConflict();

$j(document).ready(function() {
    CreateStyles(); 
    
    var a = '';
    $j.each( $j('.product-page-keywords'), function(i, left) {
       $j('a', left).each(function() {
           a+=$j(this).text()+', ';
       });
    });
    
    $j('.product-page-keywords').html('<div class="titleKeyword">Keyword here</div><div class="txtKeyword">' + a + '</div>');
    $j('.product-page-keywords').removeClass();
});

function CreateStyles() {
    var sheet = (function() {
        var style = document.createElement("style");
        style.appendChild(document.createTextNode(""));
        
        document.head.appendChild(style);
        return style.sheet;
    })(); 
        
    var txtKeywordStyle = "padding:5px; margin:15px; border-radius: 25px; border: 2px solid #73AD21;";
    addCSSRule(sheet, ".txtKeyword", txtKeywordStyle, 0);
}

function addCSSRule(sheet, selector, rules, index) {
	if("insertRule" in sheet) {
		sheet.insertRule(selector + "{" + rules + "}", index);
	}
	else if("addRule" in sheet) {
		sheet.addRule(selector, rules, index);
	}
}
