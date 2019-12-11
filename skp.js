// ==UserScript==
// @name          SKP
// @description   Shutterstock Keywords Pizding
// @version       0.5
// @author        Freem
// @source        https://raw.githubusercontent.com/cryptonoise/ss/master/skp.js
// @icon          https://raw.githubusercontent.com/cryptonoise/ss/master/skpicon.png
// @match         https://www.shutterstock.com/*image-photo*
// @match         https://www.shutterstock.com/*image-vector*
// @match		      https://www.shutterstock.com/*image-illustration*
// @match         https://www.shutterstock.com/*video*
// @require       http://code.jquery.com/jquery-latest.min.js
// @grant         none
// ==/UserScript==

'use strict';

var $j = jQuery.noConflict();

$j(document).ready(function() {
    setTimeout(function() {
        var a = '';
        $j.each( $j('[data-automation="ExpandableKeywordsList_container_div"'), function(i, left) {
            $j('a', left).each(function() {
                a+=$j(this).text()+', ';
            });
        });
        console.log(a);
        $j('[class="C_a_c"]').css({ height: "100px" });
        $j('[class="C_a_c"]').html('<div class="row" style="position: relative;height:150px;width:100%;padding: 10px 10px 10px 30px;">' + a + '</div>');



    //Text replacer 
    (function() {
        var replacements, regex, key, textnodes, node, s; 
 
        replacements = { 
        "Related keywords": "Keywords for pizding",
        "By": "📷 Успешный стокер:",
        "By ": "📷 Успешный стокер:",
        "Similar images": "Симиляры:",
        "Same model": "Та же модель:",
        "Same artist": "Тот же успешный стокер:",
        "Log in": "Ах ты, шалунишка!",
        "Create your account": "Атата по попке!",
        "Create your free account": "Ах ты, шалунишка!",  
        "Download": "Атата по попке!",  
     };
 
    regex = {}; 
        for (key in replacements) { 
        regex[key] = new RegExp(key, 'g'); 
    }
        textnodes = document.evaluate( "//body//text()", document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null); 
 
    for (var i = 0; i < textnodes.snapshotLength; i++) { 
        node = textnodes.snapshotItem(i); 
        s = node.data; 
    for (key in replacements) { 
        s = s.replace(regex[key], replacements[key]); 
    }
        node.data = s; 
    }
    })();

    }, 1900);
});
