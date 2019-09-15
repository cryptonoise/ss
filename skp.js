// ==UserScript==
// @name          SKP
// @author        Freem
// @source        https://raw.githubusercontent.com/cryptonoise/ss/master/skp.js
// @version       0.3
// @description   Shutterstock Keywords Pizding
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

      
    //Text replacer 
    (function() {
        var replacements, regex, key, textnodes, node, s; 
 
        replacements = { 
        "Welcome to Shutterstock – images for every project, all with worry-free licensing": "Shutterstock Keywords Pizding запущен!",
        "Find your plan": "ПРЕВЕД! Логиниться не надо. Копируй ключи прям так!",
        "Related keywords": "Keywords for pizding",
        "By": "Успешный стокер:",
        "By ": "Успешный стокер:",
        "Similar images": "Мало спиздил? Вот еще фоточки:",
        "Same model": "Та же модель:",
        "Same artist": "Тот же успешный стокер:",
        "Log in": "Ах ты шалунишка!",
        "Create your account": "Атата по попке!",
        "Create your free account": "Ах ты шалунишка!",  
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

    }, 1700); 

})();


