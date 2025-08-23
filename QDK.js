// ==UserScript==
// @name         QHero Disambiguate Keywords
// @version      2.3
// @author       Freem
// @description  Уточнение ключевых слов на QHero
// @match        https://qhero.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const CONFIG = {
        CLICK_DELAY_MS: 200,
        DONE_DISPLAY_TIME_MS: 3000,
        COLORS: {
            PLAY_BG: '#ffc0cb',
            PAUSE_BG: '#fd7e14',
            DONE_BG: '#20c997',
            DISABLED_BG: '#ccc',
            BORDER: '#333',
            TEXT: '#000'
        },
        BUTTON: {
            WIDTH: '80px',
            HEIGHT: '30px'
        }
    };

    let isRunning = false;
    let controlButton = null;
    let isTermsActive = false;

    function injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
        .qhero-button-container {
            display: inline-block; vertical-align: middle;
            margin-left: 15px; position: relative; top: 5px;
        }

        .qhero-3d-btn {
            display: inline-block; width: ${CONFIG.BUTTON.WIDTH}; height: ${CONFIG.BUTTON.HEIGHT};
            transform-style: preserve-3d; transform: perspective(1000px);
            transition: transform 2s; cursor: pointer; vertical-align: middle;
        }

        .qhero-3d-btn-disabled { cursor: not-allowed; opacity: 0.6; }

        .qhero-3d-btn:hover:not(.qhero-3d-btn-disabled) {
            transform: perspective(1000px) rotateX(360deg);
        }

        .qhero-3d-btn span {
            position: absolute; width: 100%; height: 100%;
            display: flex; align-items: center; justify-content: center;
            font: 12px Arial, sans-serif; letter-spacing: 0.5px;
            border: 1px solid ${CONFIG.COLORS.BORDER};
            backface-visibility: hidden; transition: 0.3s;
        }

        .qhero-3d-btn span:nth-child(1) { transform: rotateX(360deg) translateZ(15px); }
        .qhero-3d-btn span:nth-child(2) { transform: rotateX(270deg) translateZ(15px); }
        .qhero-3d-btn span:nth-child(3) { transform: rotateX(180deg) translateZ(15px); }
        .qhero-3d-btn span:nth-child(4) { transform: rotateX(90deg) translateZ(15px); }

        .qhero-play span { background: ${CONFIG.COLORS.PLAY_BG}; color: ${CONFIG.COLORS.TEXT}; }
        .qhero-pause span { background: ${CONFIG.COLORS.PAUSE_BG}; color: ${CONFIG.COLORS.TEXT}; }
        .qhero-done span { background: ${CONFIG.COLORS.DONE_BG}; color: ${CONFIG.COLORS.TEXT}; pointer-events: none; }
        .qhero-disabled span { background: ${CONFIG.COLORS.DISABLED_BG}; color: ${CONFIG.COLORS.TEXT}; }
    `;
        document.head.appendChild(style);
    }

    function isActiveTabTerms() {
        return Array.from(document.querySelectorAll('li.active a'))
            .some(a => a.textContent.includes('Terms'));
    }

    // Функция для поиска или создания контейнера для кнопки
    function findOrCreateButtonContainer() {
        // Сначала ищем существующий контейнер
        let container = document.querySelector('.qhero-button-container');

        if (!container) {
            // Если контейнера нет, создаем новый
            const acceptedTab = Array.from(document.querySelectorAll('li a'))
                .find(a => a.textContent.trim().includes('Accepted'));

            if (!acceptedTab) return null;

            container = document.createElement('li');
            container.className = 'qhero-button-container';

            // Вставляем после вкладки "Accepted"
            const parentLi = acceptedTab.closest('li');
            if (parentLi && parentLi.nextSibling) {
                parentLi.parentNode.insertBefore(container, parentLi.nextSibling);
            } else {
                parentLi.parentNode.appendChild(container);
            }
        }

        return container;
    }

    // Функция для создания или обновления кнопки
    function createOrUpdateControlButton() {
        const container = findOrCreateButtonContainer();
        if (!container) return;

        // Если кнопка уже существует в контейнере, используем её
        controlButton = container.querySelector('.qhero-3d-btn');

        if (!controlButton) {
            // Создаем 3D кнопку
            controlButton = document.createElement('div');
            controlButton.className = 'qhero-3d-btn qhero-play';

            for (let i = 0; i < 4; i++) {
                const span = document.createElement('span');
                span.textContent = '▶ Start';
                controlButton.appendChild(span);
            }

            controlButton.addEventListener('click', handleButtonClick);
            container.appendChild(controlButton);
        }

        updateButtonState();
    }

    function handleButtonClick() {
        if (!isTermsActive) return;

        isRunning = !isRunning;
        if (isRunning) {
            updateButtonText('⏸ Pause');
            controlButton.className = 'qhero-3d-btn qhero-pause';
            loopProcessing();
        } else {
            resetToStart();
        }
    }

    function updateButtonState() {
        if (!controlButton) return;

        const wasDone = controlButton.classList.contains('qhero-done');
        if (wasDone) return;

        isTermsActive = isActiveTabTerms();

        if (isTermsActive) {
            controlButton.classList.remove('qhero-3d-btn-disabled');
            if (isRunning) {
                updateButtonText('⏸ Pause');
                controlButton.className = 'qhero-3d-btn qhero-pause';
            } else {
                updateButtonText('▶ Start');
                controlButton.className = 'qhero-3d-btn qhero-play';
            }
        } else {
            controlButton.classList.add('qhero-3d-btn-disabled');
            updateButtonText('✖');
            controlButton.className = 'qhero-3d-btn qhero-disabled qhero-3d-btn-disabled';
        }
    }

    function updateButtonText(text) {
        if (controlButton) {
            controlButton.querySelectorAll('span').forEach(span => span.textContent = text);
        }
    }

    function resetToStart() {
        if (controlButton && isTermsActive) {
            updateButtonText('▶ Start');
            controlButton.className = 'qhero-3d-btn qhero-play';
            isRunning = false;
        }
    }

    function showDoneAndReset() {
        if (!controlButton || !isTermsActive) return;

        isRunning = false;

        updateButtonText('✔ Done');
        controlButton.className = 'qhero-3d-btn qhero-done';

        setTimeout(() => {
            if (isTermsActive) {
                resetToStart();
            }
        }, CONFIG.DONE_DISPLAY_TIME_MS);
    }

    const delay = ms => new Promise(r => setTimeout(r, ms));
    const clickElement = el => el?.click();

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

    async function loopProcessing() {
        while (isRunning && isTermsActive) {
            const didWork = await processNextDisambiguation();
            if (!didWork) {
                showDoneAndReset();
                break;
            }
            await delay(CONFIG.CLICK_DELAY_MS);
        }
    }

    // === ИНИЦИАЛИЗАЦИЯ ===
    injectStyles();

    // Основной цикл проверки и обновления
    setInterval(() => {
        createOrUpdateControlButton();
        updateButtonState();
    }, 1000);

})();
