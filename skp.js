// ==UserScript==
// @name                SKP
// @description         Shutterstock Keywords Pizding
// @version             2.2
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
      .skp {
        background: rgba(255, 255, 255, 0.70);
        line-height: 150%;
        position: relative;
        font-size: 14pt;
				border-radius: 8px;
				padding: 24px;
                }
      .sold-keys {
        color: rgb(10, 171, 128);
                }
			
			.skp-logo {
  color: hsla(0, 0%, 0%, .9);
  font: normal 10px Varela Round, sans-serif;
  letter-spacing: 5px;
  text-align: right;
  text-transform: uppercase;
  width: 100%;
  animation: move linear 2000ms infinite;  
}

@keyframes move {
  0% {
    text-shadow:
      4px -4px 0 hsla(0, 100%, 50%, 1), 
      3px -3px 0 hsla(0, 100%, 50%, 1), 
      2px -2px 0 hsla(0, 100%, 50%, 1), 
      1px -1px 0 hsla(0, 100%, 50%, 1),
      -4px 4px 0 hsla(180, 100%, 50%, 1), 
      -3px 3px 0 hsla(180, 100%, 50%, 1), 
      -2px 2px 0 hsla(180, 100%, 50%, 1), 
      -1px 1px 0 hsla(180, 100%, 50%, 1)
    ;
  }
  25% {    
    text-shadow:      
      -4px -4px 0 hsla(180, 100%, 50%, 1), 
      -3px -3px 0 hsla(180, 100%, 50%, 1), 
      -2px -2px 0 hsla(180, 100%, 50%, 1), 
      -1px -1px 0 hsla(180, 100%, 50%, 1),
      4px 4px 0 hsla(0, 100%, 50%, 1), 
      3px 3px 0 hsla(0, 100%, 50%, 1), 
      2px 2px 0 hsla(0, 100%, 50%, 1), 
      1px 1px 0 hsla(0, 100%, 50%, 1)      
    ;
  }
  50% {
    text-shadow:
      -4px 4px 0 hsla(0, 100%, 50%, 1), 
      -3px 3px 0 hsla(0, 100%, 50%, 1), 
      -2px 2px 0 hsla(0, 100%, 50%, 1), 
      -1px 1px 0 hsla(0, 100%, 50%, 1),
      4px -4px 0 hsla(180, 100%, 50%, 1), 
      3px -3px 0 hsla(180, 100%, 50%, 1), 
      2px -2px 0 hsla(180, 100%, 50%, 1), 
      1px -1px 0 hsla(180, 100%, 50%, 1)
    ;
  }
  75% {
    text-shadow:
      4px 4px 0 hsla(180, 100%, 50%, 1), 
      3px 3px 0 hsla(180, 100%, 50%, 1), 
      2px 2px 0 hsla(180, 100%, 50%, 1), 
      1px 1px 0 hsla(180, 100%, 50%, 1),
      -4px -4px 0 hsla(0, 100%, 50%, 1), 
      -3px -3px 0 hsla(0, 100%, 50%, 1), 
      -2px -2px 0 hsla(0, 100%, 50%, 1), 
      -1px -1px 0 hsla(0, 100%, 50%, 1)      
    ;
  }
  100% {
    text-shadow:
      4px -4px 0 hsla(0, 100%, 50%, 1), 
      3px -3px 0 hsla(0, 100%, 50%, 1), 
      2px -2px 0 hsla(0, 100%, 50%, 1), 
      1px -1px 0 hsla(0, 100%, 50%, 1),
      -4px 4px 0 hsla(180, 100%, 50%, 1), 
      -3px 3px 0 hsla(180, 100%, 50%, 1), 
      -2px 2px 0 hsla(180, 100%, 50%, 1), 
      -1px 1px 0 hsla(180, 100%, 50%, 1)
    ;
  }  
}

    `;
	let json = document.querySelector('#__NEXT_DATA__').innerHTML;
	let ssjson = JSON.parse(json);
	let words = ssjson.props.pageProps.asset.keywords;
	let sortedIndex = 0;
	for (let i = words.length - 1; i > 0; i--) {
		if (words[i] < words[i - 1]) {
			sortedIndex = i;
			break;
		}
	}
	let soldWords = '';
	for (let i = 0; i < words.length - 1; i++) {
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
		newKeywordsAll.className = 'skp';
		document.querySelector('.jss279').before(newKeywordsAll);
		newKeywordsAll.innerHTML = `
						<b>🗝 Продаваемых ключей <span class="sold-keys">${sortedIndex}</span> из ${words.length}</b>
						<br><span class="sold-keys">${soldWords}</span>${notSoldWords.trim().slice(0, -1)}
						<div class="skp-logo">Shutterstock Keywords Pizding</div>
			`;
	}, 1000);
})();
