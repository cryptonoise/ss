// ==UserScript==
// @name           AKP
// @description    Adobe Keywords Pizding
// @version        0.7
// @author         Freem
// @match          https://stock.adobe.com/images/*
// @match          https://stock.adobe.com/video/*
// @match          https://stock.adobe.com/*/images/*
// @match          https://stock.adobe.com/*/video/*
// @match          https://stock.adobe.com/stock-photo/*
// @match          https://stock.adobe.com/*/stock-photo/*
// @match          https://stock.adobe.com/templates/*
// @icon           https://github.com/cryptonoise/ss/blob/master/AKP.png?raw=true
// ==/UserScript==


(function() {
    'use strict';

    // Убираем рекламу
    let hideElement = document.querySelector('.hide-on-small-only');
    if (hideElement) {
        hideElement.style.display = 'none';
    }

    const currentUrl = window.location.href;
    const pathsToCheck = ["/ru/", "/ua/", "/de/", "/dk/", "/it/", "/pe/", "/vn/", "/my/", "/th/", "/jp/"];

    if (pathsToCheck.some(path => currentUrl.includes(path))) {
        const newUrl = pathsToCheck.reduce((url, path) => url.replace(path, "/in/"), currentUrl);
        window.location.href = newUrl;
    }

    const css = document.createElement('style');
    css.type = 'text/css';
    css.innerHTML = `
        @keyframes blink {
            0% { opacity: 1; }
            50% { opacity: 0; }
            100% { opacity: 1; }
        }
        .blink { animation: blink 1s linear; animation-iteration-count: 1; }
        .highlight { color: green !important; background-color: transparent !important; }
        .copy-button:hover { background-color: #eee; box-shadow: 0px 0px 3px #888; }
        .copy-button:active { background-color: #ddd; box-shadow: none; }
    `;
    document.head.appendChild(css);

    function changeKeywordsDisplay() {
        let tmpKeywordsNode = document.querySelector('.fx8d1q_spectrum-Tags');
        if (!tmpKeywordsNode) {
            console.log('Keywords container not found!');
            return;
        }

        console.log('Found keywords container. Extracting keywords...');
        let keywords = Array.from(tmpKeywordsNode.querySelectorAll('.fx8d1q_spectrum-Tag-cell span')).map(span => span.textContent.trim());

        let keywordsString = '';
        keywords.forEach((keyword, index) => {
            keywordsString += `<span class="keyword">${keyword}</span>`;
            if (index !== keywords.length - 1) {
                keywordsString += ', ';
            }
        });

        const fixedKeywordsArea = document.querySelector('.fixed-keywords-area .fixed-keywords');
        if (!fixedKeywordsArea) {
            console.log('Fixed keywords area not found!');
            return;
        }

        fixedKeywordsArea.innerHTML = keywordsString;

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

        document.querySelector('.fixed-keywords-area .fixed-keyword-count').innerHTML = '<b>🗝 Total keywords:</b> ' + keywords.length;
    }

    let contentWrapper = document.createElement('div');
    contentWrapper.style.cssText = `
        position: relative;
        min-height: 150px;
    `;
    document.body.appendChild(contentWrapper);

    let fixedKeywordsContainer = document.createElement('div');
    fixedKeywordsContainer.style.cssText = `
        margin-top: 10px;
        position: fixed;
        width: 100%;
        bottom: 0;
        background: #fff;
        padding: 20px;
        text-align: center;
        border-top: 1px solid silver;
        font-size: 18px;
        box-sizing: border-box;
        z-index: 999;
    `;
    fixedKeywordsContainer.className = 'fixed-keywords-area';
    fixedKeywordsContainer.innerHTML = '<div class="fixed-keyword-count"></div><div class="fixed-keywords" style="word-wrap: break-word; padding: 0 10px;"></div>';
    contentWrapper.appendChild(fixedKeywordsContainer);

    const fixedKeywordsArea = document.querySelector('.fixed-keywords-area .fixed-keywords');
    fixedKeywordsArea.style.cssText = `
        margin-top: 10px;
        margin-bottom: 10px;
        padding: 0 10px;
    `;

    let adobeKeywordsPizdingText = document.createElement('div');
    adobeKeywordsPizdingText.style.cssText = `
        position: absolute;
        bottom: 0;
        right: 10px;
        font-size: 12px;
    `;
    adobeKeywordsPizdingText.innerHTML = 'ADOBE KEYWORDS PiZDING';
    fixedKeywordsContainer.appendChild(adobeKeywordsPizdingText);

    let copyAllButton = document.createElement('button');
    copyAllButton.innerHTML = 'Copy all';
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

    let copySelectedButton = document.createElement('button');
    copySelectedButton.innerHTML = 'Copy selected';
    copySelectedButton.style.cssText = `
        margin-top: 10px;
        margin-left: 10px;
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

    let observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.target.closest('.fx8d1q_spectrum-Tags')) {
                console.log('Keywords container updated. Refreshing...');
                changeKeywordsDisplay();
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Выполняем один раз, чтобы сразу обновить ключевые слова
    setTimeout(() => {
        changeKeywordsDisplay();
    }, 1000); // Даем странице время для загрузки данных
})();

