// ==UserScript==
// @name        AEC
// @description Adobe Earnings Counter
// @version     0.3
// @author      Freem
// @match       https://contributor.stock.adobe.com/*
// @icon        https://github.com/cryptonoise/ss/blob/27beccb627b5c4838d96d9f24a32d7df2dcc76f4/AEC.png?raw=true
// ==/UserScript==

(function() {
    'use strict';

    // Добавим стили для анимаций
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
    `;
    document.head.appendChild(css);

    function updateCounts() {
        let illustrationCount = 0;
        let photosCount = 0;

        let types = document.querySelectorAll('[data-t="insights-top-sellers-table-row-asset-type"] span');

        types.forEach((type) => {
            let typeText = type.textContent.trim().toLowerCase();
            if (typeText === "illustrations" || typeText === "иллюстрации" || typeText === "ілюстрації") {
                illustrationCount++;
            } else if (typeText === "photos" || typeText === "фото" || typeText === "фотографії") {
                photosCount++;
            }
        });

        const illustrationText = `🤖 Нейропродажи: ${illustrationCount}`;
        const photosText = `📸 Фотопродажи: ${photosCount}`;

        const textContainer = document.querySelector('div[data-t="chart-legends"]');
        let newContainer = document.getElementById('word-counts');

        if (newContainer) {
            newContainer.innerHTML = `<b><span>${illustrationText}</span><span style="margin-left:20px;">${photosText}</span></b>`;
        } else {
            newContainer = document.createElement('div');
            newContainer.id = 'word-counts';
            newContainer.style.cssText = 'position: relative; z-index: 9999; text-decoration: none;';
            newContainer.innerHTML = `<b><span>${illustrationText}</span><span style="margin-left:20px;">${photosText}</span></b>`;
            textContainer.appendChild(newContainer);
        }

        newContainer.onclick = function() {
            navigator.clipboard.writeText(`${illustrationText} | ${photosText}`);
            this.classList.add('blink');
            setTimeout(() => this.classList.remove('blink'), 1000);
        };

        newContainer.addEventListener('mouseover', function() {
            this.style.textDecoration = 'underline';
        });

        newContainer.addEventListener('mouseout', function() {
            this.style.textDecoration = 'none';
        });
    }

    let observer = new MutationObserver(updateCounts);

    setTimeout(function() {
        let tableContainer = document.querySelector('tbody');
        if (tableContainer) {
            observer.observe(tableContainer, { childList: true, subtree: true });
        }
        updateCounts();

        setInterval(updateCounts, 1000);
    });
})();
