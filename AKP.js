// ==UserScript==
// @name           AKP
// @description    Adobe Keywords Pizding
// @version        0.6
// @author         Freem
// @match          https://stock.adobe.com/images/*
// @match          https://stock.adobe.com/*/images/*
// @match          https://stock.adobe.com/stock-photo/*
// @match          https://stock.adobe.com/video/*
// @match          https://stock.adobe.com/templates/*
// @icon           https://github.com/cryptonoise/ss/blob/master/AKP.png?raw=true
// ==/UserScript==

(function() {
    'use strict';

    // Убираем рекламу. Находим элемент с классом "hide-on-small-only"
    let hideElement = document.querySelector('.hide-on-small-only');
    // Проверяем, существует ли элемент
    if (hideElement) {
        // Скрываем элемент
        hideElement.style.display = 'none';
    }

    // Получаем текущий URL
    const currentUrl = window.location.href;

    // Список идентификаторов региона, которые нужно исправить
    const pathsToCheck = ["/ru/", "/ua/", "/de/", "/dk/", "/it/", "/pe/", "/vn/", "/my/", "/th/", "/jp/"];

    // Проверяем, содержит ли текущий URL один из указанных идентификаторов региона
    if (pathsToCheck.some(path => currentUrl.includes(path))) {
        // Заменяем регион на "/in/" в URL
        const newUrl = pathsToCheck.reduce((url, path) => url.replace(path, "/in/"), currentUrl);
        // Перенаправляем пользователя на новый URL
        window.location.href = newUrl;
    }

    /* Анимация */
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

        // Создаем строку с ключевыми словами с тегами span
        let keywordsString = '';

        keywords.forEach((keyword, index) => {
            keywordsString += `<span class="keyword">${keyword}</span>`;
            // Добавляем запятую после ключевого слова, если оно не последнее
            if (index !== keywords.length - 1) {
                keywordsString += ', ';
            }
        });

        // Отображаем ключевые слова в фиксированной области.
        const fixedKeywordsArea = document.querySelector('.fixed-keywords-area .fixed-keywords');
        fixedKeywordsArea.innerHTML = keywordsString;

        // Добавляем обработчик клика для каждого ключевого слова
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

        // Отображаем количество ключевых слов.
        document.querySelector('.fixed-keywords-area .fixed-keyword-count').innerHTML = '<b>🗝 Total keywords:</b> ' + keywords.length;
    }

    // Создаем обертку для контента, чтобы был виден футер при прокрутке страницы
    let contentWrapper = document.createElement('div');
    contentWrapper.style.cssText = `
        position: relative;
        min-height: 150px;
    `;
    document.body.appendChild(contentWrapper);

	// Создаем фиксированную область внизу страницы для ключевых слов.
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
	    z-index: 999;
	`;
	fixedKeywordsContainer.className = 'fixed-keywords-area';
	fixedKeywordsContainer.innerHTML = '<div class="fixed-keyword-count"></div><div class="fixed-keywords" style="word-wrap: break-word; padding: 0 10px;"></div>';
	contentWrapper.appendChild(fixedKeywordsContainer); //

    // Создаем текстовый элемент в правом нижнем углу фиксированной области.
    let adobeKeywordsPizdingText = document.createElement('div');
    adobeKeywordsPizdingText.style.cssText = `
        position: absolute;
        bottom: 0;
        right: 10px;
        font-size: 12px;
    `;
    adobeKeywordsPizdingText.innerHTML = 'ADOBE KEYWORDS PiZDING';
    fixedKeywordsContainer.appendChild(adobeKeywordsPizdingText);

    // Добавляем кнопку "Копировать все"
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

    // Добавляем кнопку "Копировать выбранные"
    let copySelectedButton = document.createElement('button');
    copySelectedButton.innerHTML = 'Copy selected';
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

    // Наблюдатель для реагирования на изменения.
    let observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.target.closest('#details-keywords-list-tmp')) {
                changeKeywordsDisplay();
            }
        });
    });

    // Начинаем наблюдение за телом страницы с заданными параметрами.
    observer.observe(document.body, { childList: true, subtree: true });

    // Вызываем функцию немедленно, чтобы применить эффекты к текущим ключевым словам на странице
    changeKeywordsDisplay();
})();
