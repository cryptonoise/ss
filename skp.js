// ==UserScript==
// @name                SKP
// @description         Shutterstock Keywords Pizding
// @version             2.8
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
  
	$(".jss198").hide()
  $(".jss7").hide()
  
	let style = document.createElement('style');
	document.getElementsByTagName('head')[0].appendChild(style);
	style.innerHTML = ` 
      .skp {
        background: rgba(255, 255, 255, 0.70);
        line-height: 150%;
        position: relative;
        font-size: 14pt;
				padding: 15px 15px 2px 15px;
				margin-bottom: 24px;
				border-radius: 8px;
				border-color: silver;
				border-width: 1px;
				border-style: solid;
                }
      .sold-keys {
        color: rgb(10, 171, 128);
                }

			.skp-logo {
    		font-size: 10px;
  			text-align: right;
				color: #36363F;
				text-shadow: 0px 4px 3px rgba(0,0,0,0.4),
                     0px 8px 13px rgba(0,0,0,0.1),
                     0px 18px 23px rgba(0,0,0,0.1);
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

	function keysRefresh() {
		setTimeout(() => {
			let newKeywordsAll = document.createElement("div");
			newKeywordsAll.className = 'skp';
			document.querySelector('.jss200').before(newKeywordsAll);
			newKeywordsAll.innerHTML = `
						<b>🗝 Продаваемых ключей <span class="sold-keys">${sortedIndex}</span> из ${words.length}</b>
						<br><span class="sold-keys">${soldWords}</span>${notSoldWords.trim().slice(0, -1)}
						<div class="skp-logo">SHUTTERSTOCK KEYWORDS PiZDING</div>
			`;
		}, 1000);
	}

	function clearCache() {
		setTimeout(() => {
			let newKeywordsAll = document.querySelector(".skp");
			newKeywordsAll.innerHTML = '';
		}, 500);
	}

	keysRefresh();

	function refresh() {
		let url = window.location.pathname;
		location.replace(url);
	}

	document.querySelector('head title').addEventListener('DOMSubtreeModified', refresh);
    
 
	
})();
