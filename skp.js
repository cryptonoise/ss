// ==UserScript==
// @name                SKP
// @description         Shutterstock Keywords Pizding
// @version             2.1
// @author              Freem
// @icon                https://raw.githubusercontent.com/cryptonoise/ss/master/skpicon.png
// @match               https://www.shutterstock.com/*image-photo*
// @match               https://www.shutterstock.com/*image-vector*
// @match               https://www.shutterstock.com/*image-illustration*
// @exclude             https://www.shutterstock.com/video*
// @exclude             https://www.shutterstock.com/search*
// @require             http://code.jquery.com/jquery-latest.min.js
// @grant               none
// ==/UserScript==

(function() {
    'use strict';
    let style = document.createElement('style');
    document.getElementsByTagName('head')[0].appendChild(style);
    style.innerHTML = ` 
                       .insert_box {
                        background: rgba(255, 255, 255, 0.70);
                        line-height: 150%;
                        padding: 20px;
                        position: relative;
												font-size: 12pt;
                       }
                       .sold-keys {
                       	color: rgb(10, 171, 128);
                       }
    `;

    let json = document.querySelector('#__NEXT_DATA__').innerHTML;
    let ssjson = JSON.parse(json);
      
    let words = ssjson.props.pageProps.asset.keywords;
    
    let sortedIndex = 0;
    for (let i = words.length - 1; i > 0; i--){
      if (words[i] < words[i-1]) {
        sortedIndex = i;
        break;
      }
    }
  
    let soldWords = '';
    for (let i = 0; i < words.length -1; i++) {
      if (sortedIndex && i < sortedIndex) {
          soldWords += `${words[i]}, `;
      }
    }
  
    let notSoldWords = '';
    for (let i = sortedIndex; i < words.length; i++) {
      notSoldWords += `${words[i]}, `;
    }
  
    setTimeout(() => {
        let newKeywordsAll = document.createElement("div");
        newKeywordsAll.className = 'insert_box';
        document.querySelector('.jss279').appendChild(newKeywordsAll);
        newKeywordsAll.innerHTML = ('<center><b><H2><div class="skp"'
      + 'style="color:Maroon; text-shadow: 0 1px 0 #ccc, 0 2px 0 #c9c9c9, 0 3px 0 #bbb, 0 4px 0 #b9b9b9, 0 5px 0 #aaa, 0 6px 1px rgba(0,0,0,.1),'
      + '0 0 5px rgba(0,0,0,.1), 0 1px 3px rgba(0,0,0,.3), 0 3px 5px rgba(0,0,0,.2), 0 5px 10px rgba(0,0,0,.25), 0 10px 10px rgba(0,0,0,.2), 0 20px 20px rgba(0,0,0,.15);">'
      + 'Shutterstock Keywords Pizding</div></H2></b></center>'

     	+ `<br><b>🗝 Продаваемых ключей <span class="sold-keys">${sortedIndex}</span> из ${words.length}</b><br/>
				 <span class="sold-keys">${soldWords}</span>${notSoldWords.trim().slice(0, -1)}`);

    }, 500);


      
})();
