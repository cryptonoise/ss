// ==UserScript==
// @name       AKP
// @description Adobe Keywords Pizding
// @namespace  http://tampermonkey.net/
// @version     0.1
// @author      Freem
// @match      https://stock.adobe.com/*
// @icon       https://github.com/cryptonoise/ss/blob/master/AKP.png?raw=true
// ==/UserScript==

(function() {
    'use strict';

    function changeKeywordsDisplay() {
        let tmpKeywordsNode = document.querySelector('#details-keywords-list-tmp');
        if (!tmpKeywordsNode) return;

        let keywordsNode = document.querySelector('.details-keywords-list-original');

        let keywords = Array.from(tmpKeywordsNode.querySelectorAll('a')).map(a => a.textContent.trim());

        // Show keywords in original keywordsNode.
        keywordsNode.innerHTML = keywords.join(', ');

        // Display the keywords in the fixed area.
        document.querySelector('.fixed-keywords-area .fixed-keywords').innerHTML = keywords.join(', ');

        // Display keyword count.
        document.querySelector('.fixed-keywords-area .fixed-keyword-count').innerHTML = '<b>🗝 Всего ключей:</b> ' + keywords.length;
    }

    // Create a fixed area at the bottom of the page for the keywords.
    let fixedKeywordsContainer = document.createElement('div');
    fixedKeywordsContainer.style.cssText = `
        position: fixed;
        width: 100%;
        bottom: 0;
        background: #fff;
        padding: 20px 20px 20px 20px;
        text-align: center;
        border-top: 1px solid silver;
        font-size: 18px;
        box-sizing: border-box; // Ensures padding is included in width
    `;
    fixedKeywordsContainer.className = 'fixed-keywords-area';
    fixedKeywordsContainer.innerHTML = '<div class="fixed-keyword-count"></div><div class="fixed-keywords" style="word-wrap: break-word; padding: 0 10px;"></div>'; // added word-wrap and padding rights and left
    document.body.appendChild(fixedKeywordsContainer);

    // Create a text element in the bottom right corner of the fixed area.
    let adobeKeywordsPizdingText = document.createElement('div');
    adobeKeywordsPizdingText.style.cssText = `
        position: absolute;
        bottom: 0;
        right: 10px;
        font-size: 12px;
    `;
    adobeKeywordsPizdingText.innerHTML = 'ADOBE KEYWORDS PiZDING';
    fixedKeywordsContainer.appendChild(adobeKeywordsPizdingText);

    // Observer to react on changes.
    let observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.target.closest('#details-keywords-list-tmp')) {
                changeKeywordsDisplay();
            }
        });
    });

    // Start observing the body with the configured parameters.
    observer.observe(document.body, { childList: true, subtree: true });
})();