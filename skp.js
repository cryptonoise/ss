// ==UserScript==
// @name          SKP
// @description   Shutterstock Keywords Pizding
// @version       1.6
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

(() => { 

    document.getElementsByClassName('m_h_db022')[0].style.visibility = 'hidden';
  
  
    const $ = document.querySelector.bind(document);
    const imageUrl = $('.m_l_a99ec').children[0].src;

    let keywords = $('.C_a_03061').firstElementChild.firstElementChild.children,
        newKeywords = document.createElement("div"),
        lastModifiedDiv = document.createElement("div"),
        my_parent = $('body');

// Keywords as links
//    const words = [...keywords].map(k => k.innerText).map(a => `<a href="/search/${a}">${a}</a>`);
    const words = [...keywords].map(k => k.innerText).map(a => `${a}`);
    let sortedIndex;
    for (let i = words.length - 1; i > 0; i--)
    {
        if (words[i] < words[i-1]) {
            sortedIndex = i;
            break;
        }
    }

    let soldWords = '';
    let notSoldWords = '';
    for (let i = 0; i < words.length -1; i++) {
        if (sortedIndex && i < sortedIndex) {
            soldWords += (words[i] + ', ');
        } else {
            notSoldWords += words[i] + ', ';
        }
    }

    if (soldWords.length > 0) {
        soldWords = soldWords.substring(0, soldWords.length-2);
    }

    if (notSoldWords.length > 0) {
        notSoldWords = notSoldWords.substring(0, notSoldWords.length-2);
    }

    let resultList = '';
    if (soldWords.length > 0) {
        resultList += `<center><b>Продаваемые ключи</b></center><br><span style='color:FireBrick'>${soldWords}</span>`;
    }

    if (soldWords.length > 0 && notSoldWords.length > 0) {
        resultList += '<br><br>';
    }

    if (notSoldWords.length > 0) {
        resultList += `<center><b>Ключи</b></center><br><span style='color:LightSeaGreen'>${notSoldWords}</span>`;
    }

    newKeywords.innerHTML = ('<center><b><H4><div class="skp"'
      + 'style="color:Maroon; text-shadow: 0 1px 0 #ccc, 0 2px 0 #c9c9c9, 0 3px 0 #bbb, 0 4px 0 #b9b9b9, 0 5px 0 #aaa, 0 6px 1px rgba(0,0,0,.1),'
      + '0 0 5px rgba(0,0,0,.1), 0 1px 3px rgba(0,0,0,.3), 0 3px 5px rgba(0,0,0,.2), 0 5px 10px rgba(0,0,0,.25), 0 10px 10px rgba(0,0,0,.2), 0 20px 20px rgba(0,0,0,.15);">' 
      + "Shutterstock Keywords Pizding" + '</div></H4></b></center>'
		  + `<br><hr><b><code>Всего ключей: </b></code>${keywords.length}<br><b><code>Продаваемых: </b></code>${sortedIndex}<br><hr>${resultList}`);
    newKeywords.style.cssText = `
        text-align: left;
        width: 420px;
        background-color: white;
        line-height: 170%;
        position: absolute;
        padding: 20px;
        right: 315px;
        top: 130px;
        z-index: 10;`;
    my_parent.appendChild(newKeywords);

// text replacer
    setTimeout(function(){
    document.body.innerHTML = document.body.innerHTML.replace(/By /g, "Успешный стокер: ");
		document.body.innerHTML = document.body.innerHTML.replace(/undefined/g, "нет :(");
      }, 3000);  

})();
