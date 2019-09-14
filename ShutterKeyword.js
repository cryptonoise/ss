// ==UserScript==
// @name          Shutterstock Keywords Pizding
// @author        Freem
// @source        https://raw.githubusercontent.com/cryptonoise/ss/master/ShutterKeyword.js
// @version       0.2
// @description   Pizding image keywords
// @include       https://www.shutterstock.com/image-photo/*
// @include       https://www.shutterstock.com/image-vector/*
// @include       https://www.shutterstock.com/image-illustration/*
// ==/UserScript==

(() => {
  
    setTimeout(function() {

    let keywords = document.querySelectorAll('.C_a_c')[0].children[0].children[0].children,
        newKeywords = document.createElement("p"),
        keys = document.querySelector(".C_a_c"),
        parent = keys.parentNode;

    keywords = [...keywords].map(k => k.innerText).map(a => `${a}`);
    newKeywords.innerHTML = `${keywords.length} keywords:<br>${keywords.join(', ')}`;
    newKeywords.style.cssText = 'padding-left: 14px; text-align: left; line-height: 150%';

    parent.appendChild(newKeywords);
    parent.removeChild(keys);

    document.body.innerHTML = document.body.innerHTML.replace('By', 'Loshara:');  
    document.body.innerHTML = document.body.innerHTML.replace('Related keywords', 'Keywords for pizding');  
    document.body.innerHTML = document.body.innerHTML.replace('Similar images', 'Ostalnoe govno'); 

    }, 1700); 

})();


