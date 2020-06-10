// ==UserScript==
// @name          SKP
// @description   Shutterstock Keywords Pizding
// @version       0.9
// @author        Freem
// @icon          https://raw.githubusercontent.com/cryptonoise/ss/master/skpicon.png
// @match         https://www.shutterstock.com/*image-photo*
// @match         https://www.shutterstock.com/*image-vector*
// @match		      https://www.shutterstock.com/*image-illustration*
// @match         https://www.shutterstock.com/*video*
// @require       http://code.jquery.com/jquery-latest.min.js
// @grant         none
// ==/UserScript==

'use strict';

// Преобразователь ключей
var $j = jQuery.noConflict();

    $j(document).ready(function() {
    		setTimeout(function() {
        		var a = '';
        		$j.each( $j('.C_a_c'), function(i, left) {
            		$j('a', left).each(function() {
                		a+=$j(this).text()+', ';
            		});
        		});
        console.log(a);
        		$j('[class="C_a_c"]').css({ height: "100px" });
        		$j('[class="C_a_c"]').html('<div class="row" style="position: relative;height:100px;width:100%;color:green;padding: 5px 5px 5px 5px;">' + a + '</div>');         
          
// Вставить ключи в начало страницы       
let div = document.createElement('div');
		div.className = "nkeys";
		div.innerHTML = ('<center><div class="row" style="position: relative;height:100px;width:100%;color:green;padding: 25px 10px 10px 10px;font-family: sans-serif;background-color: #feeff4">' + a + '</div></center>');  
		document.body.prepend(div);
		div.before(document.createElement('hr'))
		div.after(document.createElement('hr'))
    
// Заголовок страницы 
var p = document.createElement('p');
		document.body.prepend(p);
var em = document.createElement('em');
		em.append('SKP'); 
    p.innerHTML = (
			'<center><b><H3><div class="nkeystitle" style="color:#cf1d11; padding: 15px 10px 10px 10px;text-shadow: 0 1px 0 #ccc, 0 2px 0 #c9c9c9, 0 3px 0 #bbb, 0 4px 0 #b9b9b9, 0 5px 0 #aaa, 0 6px 1px rgba(0,0,0,.1), 0 0 5px rgba(0,0,0,.1), 0 1px 3px rgba(0,0,0,.3), 0 3px 5px rgba(0,0,0,.2), 0 5px 10px rgba(0,0,0,.25), 0 10px 10px rgba(0,0,0,.2), 0 20px 20px rgba(0,0,0,.15);">' + "Shutterstock Keywords Pizding" + '</div></H3></b></center>'
		);      

          
// Превью в начале страницы     
var findimage = document.querySelector('.m_j_g')
var imageSrc = findimage.getAttribute('src');
		function createImageHtml() {
				return `<div>${imageSrc}</div>`;
		}       
let preview = document.createElement('preview');
		preview.className = "npreview";
		preview.innerHTML = ('<center><div class="imma" style="background-color: #feeff4;"><img src=' + imageSrc + ' style="margin-top:30px; height:420px" ></div></center>');     
    div.before(preview); 
          
// Стиль описания фото + его дублирование в начало страницы
var title = document.querySelector('.m_b_b');
		title.style.cssText = "font-size:25px;"; 
		var cln = title.cloneNode(true);
		div.before(cln); 
    cln.style.cssText = "text-align: center; background-color: #feeff4;color: #49152c;padding: 30px 50px;font-family: 'Lato', sans-serif;font-size: 25px;";

// Стиль ID
var photoid = document.querySelector('.m_b_a');
		photoid.style.cssText = "color: red; font-size:16px;"; 
          
//Заменитель текста
    (function() {
        var replacements, regex, key, textnodes, node, s; 
 
        replacements = { 
        // English
        "Related keywords": "Keywords for pizding",
        "By": "📷 Успешный стокер:",
        "By ": "📷 Успешный стокер:",
        "Similar images": "Симиляры:",
        "Same model": "Та же модель:",
        "Similar video clips": "Видео симиляры",
        "Same artist": "Тот же успешный стокер:",
        "Log in": "Pizding mode = on",
        "Create your account": "Ах ты, шалунишка!",
        "Create your free account": "Pizding mode = on",  
        "Download": "Ах ты, шалунишка!",  
        // Russian
        "Войти": "Pizding mode = on",
        "Создайте аккаунт": "Ах ты, шалунишка!",
        "Автор:": "📷 Успешный стокер:",
        "Связанные ключевые слова": "Keywords for pizding",
        "Похожие изображения": "Симиляры:",
        "Тот же автор": "Тот же успешный стокер:",
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

    }, 300);
});
