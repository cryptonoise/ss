// ==UserScript==
// @name         QHero Disambiguate Keywords
// @version      1.4
// @author       Freem
// @description  Уточняет ключевые слова QHero
// @match        https://qhero.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const CLICK_DELAY_MS = 200;
    const DONE_DISPLAY_TIME_MS = 3000;

    let isRunning = false;
    let controlButton = null;
    let buttonContainer = null;

    // Добавляем стили для 3D-эффекта
    const style = document.createElement('style');
    style.textContent = `
        .qhero-3d-button {
            position: fixed;
            bottom: 20px;
            left: 20px;
            z-index: 99999;
            width: 120px;
            height: 40px;
            transition: transform 4s;
            transform-style: preserve-3d;
            transform: perspective(1000px) rotateX(0deg);
            cursor: pointer;
        }

        .qhero-3d-button:hover {
            transform: perspective(1000px) rotateX(360deg);
        }

        .qhero-3d-button span {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Arial, sans-serif;
            font-size: 14px;
            letter-spacing: 1px;
            transition: 0.5s;
            border: 1px solid #333;
            box-sizing: border-box;
            backface-visibility: hidden;
        }

        .qhero-3d-button:hover span {
            color: #fff;
        }

        .qhero-3d-button span:nth-child(1) {
            transform: rotateX(360deg) translateZ(20px);
        }

        .qhero-3d-button span:nth-child(2) {
            transform: rotateX(270deg) translateZ(20px);
        }

        .qhero-3d-button span:nth-child(3) {
            transform: rotateX(180deg) translateZ(20px);
        }

        .qhero-3d-button span:nth-child(4) {
            transform: rotateX(90deg) translateZ(20px);
        }

        /* Стили для разных состояний */
        .qhero-play span {
            color: #000;
            background: #b76e79; /* Розовый */
        }

        .qhero-pause span {
            color: #000;
            background: #fd7e14; /* Оранжевый */
        }

        .qhero-done span {
            color: #000;
            background: #20c997; /* Бирюзовый */
            pointer-events: none;
        }
    `;
    document.head.appendChild(style);

    function createControlButton() {
        if (controlButton) return;

        // Создаем контейнер для 3D-кнопки
        buttonContainer = document.createElement('div');
        buttonContainer.className = 'qhero-3d-button qhero-play';

        // Создаем 4 спана для 3D-эффекта
        for (let i = 0; i < 4; i++) {
            const span = document.createElement('span');
            span.textContent = '▶ Start';
            buttonContainer.appendChild(span);
        }

        buttonContainer.addEventListener('click', () => {
            isRunning = !isRunning;
            if (isRunning) {
                // Обновляем текст на всех спанах
                buttonContainer.querySelectorAll('span').forEach(span => {
                    span.textContent = '⏸ Pause';
                });
                buttonContainer.className = 'qhero-3d-button qhero-pause';
                loopProcessing();
            } else {
                buttonContainer.querySelectorAll('span').forEach(span => {
                    span.textContent = '▶ Start';
                });
                buttonContainer.className = 'qhero-3d-button qhero-play';
            }
        });

        document.body.appendChild(buttonContainer);
        controlButton = buttonContainer;
    }

    function resetToStart() {
        if (controlButton) {
            controlButton.querySelectorAll('span').forEach(span => {
                span.textContent = '▶ Start';
            });
            controlButton.className = 'qhero-3d-button qhero-play';
            isRunning = false;
        }
    }

    function showDoneAndReset() {
        if (!controlButton) return;

        // Показываем Done
        controlButton.querySelectorAll('span').forEach(span => {
            span.textContent = '✔ Done';
        });
        controlButton.className = 'qhero-3d-button qhero-done';

        // Через 3 секунды возвращаем в состояние "Start"
        setTimeout(() => {
            resetToStart();
        }, DONE_DISPLAY_TIME_MS);
    }

    function isActiveTabTerms() {
        const activeTabs = document.querySelectorAll('li.active a');
        return Array.from(activeTabs).some(a => a.textContent.trim().includes('Terms'));
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

        const addRest = [...nextAsset.querySelectorAll('a')]
            .find(a => a.textContent.trim().startsWith('Add to rest'));
        if (addRest) await clickElement(addRest);

        return true;
    }

    async function loopProcessing() {
        while (isRunning) {
            const didWork = await processNextDisambiguation();
            if (!didWork) {
                showDoneAndReset();
                break;
            }
            await delay(CLICK_DELAY_MS);
        }
    }

    // Отслеживаем активность вкладки Terms
    setInterval(() => {
        if (isActiveTabTerms()) {
            createControlButton();
        }
    }, 1000);

})();
