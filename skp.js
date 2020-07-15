// ==UserScript==
// @name          SKP
// @description   Shutterstock Keywords Pizding
// @version       1.3
// @author        Freem
// @icon          https://raw.githubusercontent.com/cryptonoise/ss/master/skpicon.png
// @match					https://www.shutterstock.com/*image-photo*
// @match					https://www.shutterstock.com/*image-vector*
// @match					https://www.shutterstock.com/*image-illustration*
// @exclude				https://www.shutterstock.com/video*
// @exclude				https://www.shutterstock.com/search*
// @require				http://code.jquery.com/jquery-latest.min.js
// @grant         none
// ==/UserScript==

'use strict';

//Text replacer 
    (function() {
        var replacements, regex, key, textnodes, node, s; 
        replacements = { 

        "By": "Успешный стокер:",
        "By ": "Успешный стокер:",
        "stock photo": "",  
        "Royalty-free": "Stock photo",
          
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

// Ловец ключей
var $j = jQuery.noConflict();

    $j(document).ready(function() {
    		setTimeout(function() {
        		var key = '';
        		$j.each( $j('.C_a_c'), function(i, left) {
            		$j('a', left).each(function() {
                		key += $j (this).text() + ', ';
            		});
        		});
        console.log(key);
        		$j('[class="C_a_c"]').css({ height: "100px" });
        		$j('[class="C_a_c"]').html('<div class="keys" style="position: relative;height:100%;width:100%;color:green;padding: 5px 5px 5px 5px;">' + key + '</div>');   

// Скрыть весь контент
document.getElementById('content').style.display = 'none';    
          
// Кнопка
var showhide       = document.createElement ('div');
showhide.innerHTML = '<center><button id="showcontent" type="button">'
                + 'Показать / Скрыть страницу</button></center>'
                ;
showhide.setAttribute ('id', 'buttonContainer');
document.body.prepend (showhide);
document.getElementById ("showcontent").addEventListener (
    "click", ButtonClickAction, false
);

function ButtonClickAction () {
  var showhide = document.getElementById("content");
  if (showhide.style.display === "none") {
    showhide.style.display = "block";
  } else {
    showhide.style.display = "none";
  }
};   

// Вставить ключи в начало страницы       
let nkeys = document.createElement('div');
		nkeys.innerHTML = ('<div class="back" style="background-color: #feeff4; width:100%;"</div>'
                       + '<center><p class="keys" style="position: relative;height:100%;width:90%;color:green;padding: 25px 10px 10px 10px;font-family: sans-serif;">'
                       + key + '</p></center>');  
		document.body.prepend(nkeys);
		nkeys.before(document.createElement('hr'))
		nkeys.after(document.createElement('hr'))
          
// Превью в начале страницы     
var findimage = document.querySelector('.m_k_g')
var imageSrc = findimage.getAttribute('src');
		function createImageHtml() {
				return `<div>${imageSrc}</div>`;
		}       
let preview = document.createElement('preview');
		preview.className = "npreview";
		preview.innerHTML = ('<center><div class="imma" style="background-color: #feeff4;"><img src=' + imageSrc + ' style="margin:30px 0px 30px 0px; height:420px" ></div></center>');     
    nkeys.before(preview); 
          
// SKP logo 
var skp = document.createElement('p');
		document.body.prepend(skp);
var skpem = document.createElement('em');
		skpem.prepend('SKP'); 
    skp.innerHTML = (
			'<center><b><H3><div class="nkeystitle" style="color:#cf1d11; padding: 15px 10px 10px 10px;text-shadow: 0 1px 0 #ccc, 0 2px 0 #c9c9c9, 0 3px 0 #bbb, 0 4px 0 #b9b9b9, 0 5px 0 #aaa, 0 6px 1px rgba(0,0,0,.1), 0 0 5px rgba(0,0,0,.1), 0 1px 3px rgba(0,0,0,.3), 0 3px 5px rgba(0,0,0,.2), 0 5px 10px rgba(0,0,0,.25), 0 10px 10px rgba(0,0,0,.2), 0 20px 20px rgba(0,0,0,.15);">' 
      + "Shutterstock Keywords Pizding" + '</div></H3></b></center>'
		);
          
// Стиль описания фото + его дублирование в начало страницы
var title = document.querySelector('.m_b_b');
		title.style.cssText = "font-size:25px;"; 
		var titlecln = title.cloneNode(true);
		nkeys.before(titlecln); 
    titlecln.style.cssText = "text-align: center; background-color: #feeff4; color: #49152c; padding: 30px 50px;font-family: 'Lato', sans-serif;font-size: 25px; border-style: dotted none dotted none; ";

// Contributor
var contributor = document.querySelector('.oc_B_a');
var contributorstyle = document.querySelector('.b_t_e').style.cssText = "color: red";
var newcontributor = contributor.cloneNode(true);    
    newcontributor.style.cssText = "background-color: #feeff4;  justify-content: center; align-items: center; display: flex; padding: 20px 0px 20px 0px; font-size: 45px; ";
		preview.before(newcontributor);
          
// Photo ID
var photoid = document.querySelector('.m_b_a');
		photoid.style.cssText = "color: red; font-size:16px;"; 
var newphotoid = photoid.cloneNode(true);
    newphotoid.style.cssText = "text-align: center; background-color: #feeff4; color: #49152c; font-family: 'Lato', sans-serif;font-size: 15px;";
		preview.before(newphotoid);     
          
   
let search = document.createElement('div');
		nkeys.innerHTML = ('<div class="back" style="background-color: #feeff4; width:100%;"</div>'
                       + '<center><p class="keys" style="position: relative;height:100px;width:90%;color:green;padding: 25px 10px 10px 10px;font-family: sans-serif;">'
                       + a + '</p></center>');


     
//Задержка перед выполнением
    }, 200);
   
});
