// ==UserScript==
// @name        AEC
// @description Adobe Earnings Counter
// @version     0.2
// @author      Freem
// @match       https://contributor.stock.adobe.com/*
// @icon        https://github.com/cryptonoise/ss/blob/27beccb627b5c4838d96d9f24a32d7df2dcc76f4/AEC.png?raw=true
// ==/UserScript==

(function() {
    'use strict';

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

        const textContainer = document.querySelector('div[data-t="chart-legends"]');
        const existingNewContainer = document.getElementById('word-counts');

        const newHTML = `<b><div>🤖 Нейропродажи:</b> ${illustrationCount}&nbsp;&nbsp;&nbsp;&nbsp;<b>📸 Фотопродажи:</b> ${photosCount}</div>`;

        if (existingNewContainer) {
            existingNewContainer.innerHTML = newHTML;
        } else {
            const newContainer = document.createElement('div');
            newContainer.id = 'word-counts';
            newContainer.style.cssText = 'position: relative; z-index: 9999;';
            newContainer.innerHTML = newHTML;
            textContainer.appendChild(newContainer);
        }

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
