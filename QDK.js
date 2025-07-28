// ==UserScript==
// @name         QHero Disambiguate Keywords
// @version      1.8
// @author       Freem
// @description  Уточнение ключевых слов на QHero
// @match        https://qhero.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const CONFIG = {
        CLICK_DELAY_MS: 200,        // Задержка между кликами (в миллисекундах)
        DONE_DISPLAY_TIME_MS: 3000, // Время отображения кнопки "Done" (в миллисекундах)
        // Цвета кнопки
        COLORS: {
            PLAY_BG: '#ffc0cb',     // Цвет фона в состоянии "Start"
            PAUSE_BG: '#fd7e14',    // Цвет фона в состоянии "Pause"
            DONE_BG: '#20c997',     // Цвет фона в состоянии "Done"
            BORDER: '#333',         // Цвет рамки кнопки
            TEXT: '#000'            // Цвет текста
        },
        BUTTON: {
            WIDTH: '80px',          // Ширина кнопки
            HEIGHT: '30px'          // Высота кнопки
        }
    };

    let isRunning = false;
    let controlButton = null;
    let buttonInserted = false; // Флаг для отслеживания вставки кнопки

    // Добавляет стили кнопки
    function injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .qhero-3d-btn {
                display: inline-block;
                width: ${CONFIG.BUTTON.WIDTH};
                height: ${CONFIG.BUTTON.HEIGHT};
                margin-left: 10px;
                transform-style: preserve-3d;
                transform: perspective(1000px);
                transition: transform 2s;
                cursor: pointer;
                vertical-align: middle;
            }
            .qhero-3d-btn:hover { transform: perspective(1000px) rotateX(360deg); }
            .qhero-3d-btn span {
                position: absolute;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                font: 12px Arial, sans-serif;
                letter-spacing: 0.5px;
                border: 1px solid ${CONFIG.COLORS.BORDER};
                backface-visibility: hidden;
                transition: 0.3s;
            }
            .qhero-3d-btn span:nth-child(1) { transform: rotateX(360deg) translateZ(15px); }
            .qhero-3d-btn span:nth-child(2) { transform: rotateX(270deg) translateZ(15px); }
            .qhero-3d-btn span:nth-child(3) { transform: rotateX(180deg) translateZ(15px); }
            .qhero-3d-btn span:nth-child(4) { transform: rotateX(90deg) translateZ(15px); }
            .qhero-play span { background: ${CONFIG.COLORS.PLAY_BG}; color: ${CONFIG.COLORS.TEXT}; }
            .qhero-pause span { background: ${CONFIG.COLORS.PAUSE_BG}; color: ${CONFIG.COLORS.TEXT}; }
            .qhero-done span { background: ${CONFIG.COLORS.DONE_BG}; color: ${CONFIG.COLORS.TEXT}; pointer-events: none; }
        `;
        document.head.appendChild(style);
    }

    // Создаёт кнопку и вставляет её после вкладки "Accepted"
    function createControlButton() {
        // Проверяем, не создана ли уже кнопка или не вставлена
        if (controlButton || buttonInserted) return;

        // Ищем вкладку "Accepted"
        const acceptedTab = Array.from(document.querySelectorAll('li a'))
            .find(a => a.textContent.trim().includes('Accepted'));

        if (!acceptedTab) return;

        // Создаем контейнер для кнопки
        const buttonContainer = document.createElement('li');
        buttonContainer.style.display = 'inline-block';
        buttonContainer.style.verticalAlign = 'middle';

        // Создаем 3D кнопку
        controlButton = document.createElement('div');
        controlButton.className = 'qhero-3d-btn qhero-play';

        for (let i = 0; i < 4; i++) {
            const span = document.createElement('span');
            span.textContent = '▶ Start';
            controlButton.appendChild(span);
        }

        controlButton.addEventListener('click', toggleProcessing);
        buttonContainer.appendChild(controlButton);

        // Вставляем кнопку после вкладки "Accepted"
        const parentLi = acceptedTab.closest('li');
        if (parentLi && parentLi.nextSibling) {
            parentLi.parentNode.insertBefore(buttonContainer, parentLi.nextSibling);
        } else {
            parentLi.parentNode.appendChild(buttonContainer);
        }

        buttonInserted = true;
    }

    // Удаляет кнопку
    function removeControlButton() {
        if (controlButton && controlButton.parentNode) {
            controlButton.parentNode.remove();
            controlButton = null;
            buttonInserted = false;
        }
    }

    // Старт/пауза
    function toggleProcessing() {
        isRunning = !isRunning;
        if (isRunning) {
            updateButtonText('⏸ Pause');
            controlButton.className = 'qhero-3d-btn qhero-pause';
            loopProcessing();
        } else {
            resetToStart();
        }
    }

    // Обновляет текст на кнопке
    function updateButtonText(text) {
        if (controlButton) {
            controlButton.querySelectorAll('span').forEach(span => span.textContent = text);
        }
    }

    // Сброс кнопки в Start
    function resetToStart() {
        if (controlButton) {
            updateButtonText('▶ Start');
            controlButton.className = 'qhero-3d-btn qhero-play';
            isRunning = false;
        }
    }

    // Показывает "Done" и возвращается к "Start"
    function showDoneAndReset() {
        if (!controlButton) return;
        updateButtonText('✔ Done');
        controlButton.className = 'qhero-3d-btn qhero-done';
        setTimeout(resetToStart, CONFIG.DONE_DISPLAY_TIME_MS);
    }

    // Проверяет активна ли вкладка "Terms"
    function isActiveTabTerms() {
        return Array.from(document.querySelectorAll('li.active a'))
            .some(a => a.textContent.includes('Terms'));
    }

    const delay = ms => new Promise(r => setTimeout(r, ms));
    const clickElement = el => el?.click();

    // Обрабатывает следующий элемент
    async function processNextDisambiguation() {
        const all = Array.from(document.querySelectorAll('div.row.property.keyword'));
        const next = all.find(div =>
            getComputedStyle(div).backgroundColor === 'rgb(255, 255, 224)' &&
            !div.dataset.processed
        );
        if (!next) return false;

        next.dataset.processed = "true";
        next.style.backgroundColor = '#ccffcc';
        next.scrollIntoView({ behavior: 'smooth', block: 'center' });

        let el = next, asset = null;
        while (el = el.nextElementSibling) {
            if (el.classList.contains('asset-prop')) { asset = el; break; }
            if (el.classList.contains('property') && el.classList.contains('keyword')) break;
        }
        if (!asset) return true;

        const textBlock = asset.querySelector('.col-xs-8.full-view.row-header');
        if (textBlock) clickElement(textBlock);

        const addRest = [...asset.querySelectorAll('a')]
            .find(a => a.textContent.trim().startsWith('Add to rest'));
        if (addRest) clickElement(addRest);

        return true;
    }

    // Основной цикл
    async function loopProcessing() {
        while (isRunning) {
            const didWork = await processNextDisambiguation();
            if (!didWork) {
                showDoneAndReset();
                break;
            }
            await delay(CONFIG.CLICK_DELAY_MS);
        }
    }

    injectStyles();

    // Показывает кнопку, если вкладка "Terms" активна
    setInterval(() => {
        if (isActiveTabTerms()) {
            createControlButton();
        } else {
            removeControlButton();
        }
    }, 1000);

})();
