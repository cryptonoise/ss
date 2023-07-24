// ==UserScript==
// @name           AKP
// @description    Adobe Keywords Pizding
// @version        0.4
// @author         Freem
// @match          https://stock.adobe.com/images/*
// @match          https://stock.adobe.com/video/*
// @match          https://stock.adobe.com/templates/*
// @icon           https://github.com/cryptonoise/ss/blob/master/AKP.png?raw=true
// ==/UserScript==

(function() {
    'use strict';

    /* Animation */
    const css = document.createElement('style');
    css.type = 'text/css';
    css.innerHTML = `
        @keyframes blink {
            0%   { opacity: 1; }
            50%  { opacity: 0; }
            100% { opacity: 1; }
        }

        .blink {
            animation: blink 1s linear;
            animation-iteration-count: 1;
        }

        .highlight {
            color: green !important;
            background-color: transparent !important;
        }

        .copy-button:hover {
            background-color: #eee;
            box-shadow: 0px 0px 3px #888;
        }

        .copy-button:active {
            background-color: #ddd;
            box-shadow: none;
        }
    `;
    document.head.appendChild(css);

    function changeKeywordsDisplay() {
        let tmpKeywordsNode = document.querySelector('#details-keywords-list-tmp');
        if (!tmpKeywordsNode) return;

        let keywords = Array.from(tmpKeywordsNode.querySelectorAll('a')).map(a => a.textContent.trim());

        // Create a keywords string with the span tags
        let keywordsString = '';

        keywords.forEach((keyword, index) => {
            keywordsString += `<span class="keyword">${keyword}</span>`;
            // Add comma after keyword unless it is the last one
            if (index !== keywords.length - 1) {
                keywordsString += ', ';
            }
        });

        // Display the keywords in the fixed area.
        const fixedKeywordsArea = document.querySelector('.fixed-keywords-area .fixed-keywords');
        fixedKeywordsArea.innerHTML = keywordsString;

        // Add click event to each keyword
        fixedKeywordsArea.querySelectorAll('.keyword').forEach(keywordElement => {
            keywordElement.onclick = function() {
                if (this.classList.contains('highlight')) {
                    this.classList.remove('highlight');
                } else {
                    this.classList.add('blink');
                    setTimeout(() => {
                        this.classList.remove('blink');
                        this.classList.add('highlight');
                    }, 1000);
                }
            };
        });

        // Display keyword count.
        document.querySelector('.fixed-keywords-area .fixed-keyword-count').innerHTML = '<b>🗝 Всего ключей:</b> ' + keywords.length;
    }

    // Create a fixed area at the bottom of the page for keywords.
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
        box-sizing: border-box;
    `;
    fixedKeywordsContainer.className = 'fixed-keywords-area';
    fixedKeywordsContainer.innerHTML = '<div class="fixed-keyword-count"></div><div class="fixed-keywords" style="word-wrap: break-word; padding: 0 10px;"></div>';
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

    // Add "Copy All" button
    let copyAllButton = document.createElement('button');
    copyAllButton.innerHTML = 'Скопировать все';
    copyAllButton.style.cssText = `
        margin-left: 10px;
        font-size: 16px;
        padding: 2px 5px;
        border: none;
        background-color: #eee;
        cursor: pointer;
    `;
    copyAllButton.classList.add('copy-button');
    copyAllButton.onclick = function() {
        let keywords = document.querySelectorAll('.fixed-keywords .keyword');
        let keywordsArray = Array.from(keywords).map(keyword => keyword.textContent.trim());
        let keywordsString = keywordsArray.join(', ');
        navigator.clipboard.writeText(keywordsString);
    };
    fixedKeywordsContainer.appendChild(copyAllButton);

    // Add "Copy Selected" button
    let copySelectedButton = document.createElement('button');
    copySelectedButton.innerHTML = 'Скопировать выделенные';
    copySelectedButton.style.cssText = `
        margin-left:10px;
        font-size: 16px;
        padding: 2px 5px;
        border: none;
        background-color: #eee;
        cursor: pointer;
    `;
    copySelectedButton.classList.add('copy-button');
    copySelectedButton.onclick = function() {
        let selectedKeywords = document.querySelectorAll('.fixed-keywords .highlight');
        let selectedKeywordsArray = Array.from(selectedKeywords).map(keyword => keyword.textContent.trim());
        let selectedKeywordsString = selectedKeywordsArray.join(', ');
        navigator.clipboard.writeText(selectedKeywordsString);
    };
    fixedKeywordsContainer.appendChild(copySelectedButton);

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

    // Call the function immediately to apply the effects to the current keywords on the page
    changeKeywordsDisplay();
})();
