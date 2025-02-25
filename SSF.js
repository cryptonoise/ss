// ==UserScript==
// @name         Shutterstock Submit Fix
// @version      1.0
// @author       Freem
// @match        https://submit.shutterstock.com/portfolio/not_submitted/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Функция для получения элемента по XPath
    function getElementByXPath(xpath) {
        const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        return result.singleNodeValue; // Возвращаем первый найденный элемент
    }

    // Функция для безопасного удаления элемента
    function safeRemoveElementByXPath(xpath) {
        const element = getElementByXPath(xpath);
        if (element && element.parentElement) {
            try {
                setTimeout(() => {
                    if (element && element.parentElement) {
                        element.remove(); // Удаляем элемент только если он существует и имеет родителя
                    }
                }, 500); // Задержка для ожидания завершения рендера React
            } catch (e) {
                console.warn('Failed to remove element:', e.message);
            }
        }
    }

    // Функция для безопасного перемещения блока
    function safeMoveBlockToBottom() {
        const blockToMove = getElementByXPath('/html/body/div[1]/div[2]/div/div/div[2]/div[1]/form/div[2]/div[2]/div[2]/div[1]/div/div[2]/div[2]/div[4]');
        const parentContainer = getElementByXPath('/html/body/div[1]/div[2]/div/div/div[2]/div[1]/form/div[2]/div[2]/div[2]/div[1]/div');

        if (blockToMove && parentContainer && parentContainer.contains(blockToMove)) {
            try {
                setTimeout(() => {
                    if (blockToMove && parentContainer && parentContainer.contains(blockToMove)) {
                        parentContainer.appendChild(blockToMove); // Перемещаем блок только если он является дочерним элементом контейнера
                    }
                }, 500); // Задержка для ожидания завершения рендера React
            } catch (e) {
                console.warn('Failed to move block:', e.message);
            }
        }
    }

    // Инициализация MutationObserver для отслеживания изменений в DOM
    const observer = new MutationObserver(() => {
        // Безопасное удаление всех указанных элементов
        safeRemoveElementByXPath('/html/body/div[1]/div[2]/div/div/div[2]/div[1]/form/div[2]/div[2]/div[2]/div[1]/div/div[4]');
        safeRemoveElementByXPath('/html/body/div[1]/div[2]/div/div/div[2]/div[1]/form/div[2]/div[2]/div[2]/div[1]/div/div[5]');
        safeRemoveElementByXPath('/html/body/div[1]/div[2]/div/div/div[2]/div[1]/form/div[2]/div[2]/div[2]/div[1]/div/div[2]/hr[2]');
        safeRemoveElementByXPath('/html/body/div[1]/div[2]/div/div/div[2]/div[1]/form/div[2]/div[2]/div[2]/div[1]/div/div[2]/hr[3]');

        // Безопасное перемещение блока
        safeMoveBlockToBottom();
    });

    // Конфигурация наблюдателя: следим за изменениями в дереве DOM
    const config = { childList: true, subtree: true };

    // Начинаем наблюдать за элементом body
    const body = document.body;
    if (body) {
        observer.observe(body, config); // Запускаем наблюдение
    }

    // Первичное удаление элементов и перемещение блока при загрузке страницы
    safeRemoveElementByXPath('/html/body/div[1]/div[2]/div/div/div[2]/div[1]/form/div[2]/div[2]/div[2]/div[1]/div/div[4]');
    safeRemoveElementByXPath('/html/body/div[1]/div[2]/div/div/div[2]/div[1]/form/div[2]/div[2]/div[2]/div[1]/div/div[5]');
    safeRemoveElementByXPath('/html/body/div[1]/div[2]/div/div/div[2]/div[1]/form/div[2]/div[2]/div[2]/div[1]/div/div[2]/hr[2]');
    safeRemoveElementByXPath('/html/body/div[1]/div[2]/div/div/div[2]/div[1]/form/div[2]/div[2]/div[2]/div[1]/div/div[2]/hr[3]');
    safeMoveBlockToBottom();

    // Очистка: останавливаем наблюдение перед закрытием страницы
    window.addEventListener('beforeunload', () => {
        observer.disconnect(); // Останавливаем наблюдение
    });
})();