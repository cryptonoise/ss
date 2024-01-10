// ==UserScript==
// @name                SKP
// @description         Shutterstock Keywords Pizding
// @version             4.0
// @author              Freem
// @icon                https://github.com/cryptonoise/ss/blob/master/SKP.png?raw=true
// @match               https://www.shutterstock.com/*
// @exclude             https://www.shutterstock.com/search*
// @grant               none
// ==/UserScript==

(function () {
    'use strict';

    // Функция для ожидания появления элемента на странице
    function waitForElement(selector, callback) {
        const interval = setInterval(function () {
            const element = document.querySelector(selector);
            if (element) {
                clearInterval(interval);
                callback();
            }
        }, 500);
    }

    // Ожидание появления элемента с ключевыми словами
    waitForElement('[data-automation="KeywordList"]', function () {
        // Добавление стилей для отображения ключей
        let style = document.createElement('style');
        document.getElementsByTagName('head')[0].appendChild(style);
        style.innerHTML = `
            .skp {
                background: rgba(255, 255, 255);
                line-height: 150%;
                position: fixed;
                z-index: 99999;
                font-size: 14pt;
                width: 100%;
                bottom: 0;
                padding: 10px 70px 2px 70px;
                border-color: silver;
                border-width: 1px;
                border-style: solid;
            }
            .keys span {
                cursor: pointer;
                transition: color 0.5s;
                display: inline-block;
            }
            .blink {
                animation: blink 1s linear;
                animation-iteration-count: 1;
            }
            .highlight {
                color: green !important;
                background-color: transparent !important;
                transition: color 0.5s;
            }
            .copy-button:hover {
                background-color: #eee;
                box-shadow: 0px 0px 3px #888;
            }
            .copy-button:active {
                background-color: #ddd;
                box-shadow: none;
            }

            @keyframes blink {
                0% { opacity: 1; }
                50% { opacity: 0; }
                100% { opacity: 1; }
            }

            .skp-logo {
                position: absolute;
                bottom: 0;
                right: 10px;
                font-size: 9px;
                color: #36363F;
                text-shadow: 0px 4px 3px rgba(0, 0, 0, 0.4),
                    0px 8px 13px rgba(0, 0, 0, 0.1),
                    0px 18px 23px rgba(0, 0, 0, 0.1);
            }
        `;

        let keysHTML = '';
        let skpElement = document.createElement('div');
        skpElement.className = 'skp';
        document.body.appendChild(skpElement);

        // Извлечение ключевых слов из JSON
        function extractKeywords() {
            let json = document.querySelector('#__NEXT_DATA__').innerHTML;
            let ssjson = JSON.parse(json);
            return ssjson.props.pageProps.asset.keywords;
        }

        // Обновление отображаемых ключевых слов
        function updateKeywords() {
            const keywords = extractKeywords();
            keysHTML = keywords.map(keyword => `<span>${keyword}</span>`).join(', ');

            skpElement.innerHTML = `
                <b><center>🗝 Всего ключей: ${keywords.length}</center></b>
                <div class="keys">${keysHTML}</div>
                <div class="skp-buttons" style="text-align: center;">
                    <button class="copy-button" id="copy-all">Copy all</button>
                    <button class="copy-button" id="copy-selected">Copy selected</button>
                </div>
                <div class="skp-logo">SHUTTERSTOCK KEYWORDS PiZDING</div>
            `;

            // Добавление обработчиков событий для кнопок копирования
            let copyAllButton = skpElement.querySelector('#copy-all');
            let copySelectedButton = skpElement.querySelector('#copy-selected');

            copyAllButton.addEventListener('click', function () {
                let allKeywords = skpElement.querySelectorAll('.skp .keys span');
                let allKeywordsArray = Array.from(allKeywords).map(keyword => keyword.textContent.trim());
                let allKeywordsString = allKeywordsArray.join(', ');
                navigator.clipboard.writeText(allKeywordsString);
            });

            copySelectedButton.addEventListener('click', function () {
                let selectedKeywords = skpElement.querySelectorAll('.skp .keys span.highlight');
                let selectedKeywordsArray = Array.from(selectedKeywords).map(keyword => keyword.textContent.trim());
                let selectedKeywordsString = selectedKeywordsArray.join(', ');
                navigator.clipboard.writeText(selectedKeywordsString);
            });

            // Добавление обработчиков событий для выделения ключевых слов
            let keywordSpans = skpElement.querySelectorAll('.skp .keys span');
            keywordSpans.forEach(keywordSpan => {
                keywordSpan.addEventListener('click', function () {
                    keywordSpan.classList.toggle('highlight');
                });
            });
        }

        // Обновление ключей при загрузке страницы
        updateKeywords();
    });
})();
