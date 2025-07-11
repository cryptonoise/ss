// ==UserScript==
// @name         QHero Disambiguate Keywords
// @version      1.0
// @author       Freem
// @description  Уточняет ключевые слова на QHero
// @match        https://qhero.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // 🔧 Задержка между обработкой жёлтых блоков (в мс)
    const CLICK_DELAY_MS = 500;

    let isRunning = false;
    let controlButton = null;

    function createControlButton() {
        if (controlButton) return;

        const btnStyle = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            z-index: 99999;
            padding: 10px 15px;
            background-color: #28a745;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        `;
        const pauseStyle = `background-color: #dc3545;`;

        controlButton = document.createElement('button');
        controlButton.innerText = '▶ Start';
        controlButton.style.cssText = btnStyle;
        controlButton.addEventListener('click', () => {
            isRunning = !isRunning;
            controlButton.innerText = isRunning ? '⏸ Pause' : '▶ Start';
            controlButton.style.cssText = isRunning ? btnStyle + pauseStyle : btnStyle;

            if (isRunning) {
                loopProcessing();
            }
        });
        document.body.appendChild(controlButton);
    }

    function removeControlButton() {
        if (controlButton) {
            controlButton.remove();
            controlButton = null;
        }
    }

    function isActiveTabTerms() {
        const activeTabs = document.querySelectorAll('li.active a');
        return Array.from(activeTabs).some(a => {
            return a.textContent.trim().includes('Terms');
        });
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function clickElement(el) {
        if (el) el.click();
    }

    async function processNextDisambiguation() {
        const all = Array.from(document.querySelectorAll('div.row.property.keyword'));
        const nextYellow = all.find(div =>
            window.getComputedStyle(div).backgroundColor === 'rgb(255, 255, 224)' &&
            !div.dataset.processed
        );

        if (!nextYellow) return false;

        nextYellow.dataset.processed = "true";
        nextYellow.style.backgroundColor = '#ccffcc';
        nextYellow.scrollIntoView({ behavior: 'smooth', block: 'center' });

        let el = nextYellow;
        let nextAsset = null;
        while (el = el.nextElementSibling) {
            if (el.classList.contains('asset-prop')) {
                nextAsset = el;
                break;
            }
            if (el.classList.contains('row') && el.classList.contains('property') && el.classList.contains('keyword')) {
                break;
            }
        }

        if (!nextAsset) return true;

        const textBlock = nextAsset.querySelector('.col-xs-8.full-view.row-header');
        if (textBlock) await clickElement(textBlock);

        // Ищем ссылку с текстом, начинающимся на "Add to rest"
        const addRest = [...nextAsset.querySelectorAll('a')]
            .find(a => a.textContent.trim().startsWith('Add to rest'));
        if (addRest) await clickElement(addRest);

        return true;
    }

    async function loopProcessing() {
        while (isRunning) {
            const didWork = await processNextDisambiguation();
            if (!didWork) break;
            await delay(CLICK_DELAY_MS);
        }
    }

    // Проверяем каждые 1 секунду состояние вкладки Terms
    setInterval(() => {
        if (isActiveTabTerms()) {
            createControlButton();
        } else {
            removeControlButton();
        }
    }, 1000);
})();
