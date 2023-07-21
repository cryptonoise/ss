// ==UserScript==
// @name        AEC
// @description Adobe Earnings Counter
// @version     0.1
// @author      Freem
// @match       https://contributor.stock.adobe.com/*/insights/*
// @icon        https://github.com/cryptonoise/ss/blob/27beccb627b5c4838d96d9f24a32d7df2dcc76f4/AEC.png?raw=true
// ==/UserScript==

(function() {
    'use strict';

    function updateCounts() {
        let illustrationCount = 0;
        let photosCount = 0;

        let types = document.querySelectorAll('[data-t="insights-top-sellers-table-row-asset-type"] span');

        types.forEach((type) => {
            if(type.textContent.trim() === "Illustrations") {
                illustrationCount++;
            } else if(type.textContent.trim() === "Photos") {
                photosCount++;
            }
        });

        const textContainer = document.querySelector('div[data-t="chart-legends"]');
        const existingNewContainer = document.getElementById('word-counts');

        // Счетчики теперь находятся в одном элементе div
        const newHTML = `<b><div>🤖 Нейропродажи:</b> ${illustrationCount}&nbsp;&nbsp;&nbsp;&nbsp;<b>📸 Фотопродажи:</b> ${photosCount}</div>`;

        if (existingNewContainer) { // If our container already exists, we just update the text.
            existingNewContainer.innerHTML = newHTML;
        } else { // Otherwise, we create a new container and append return it.
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
    }, 100);
})();