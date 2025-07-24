// ==UserScript==
// @name         QHero Release OCR
// @namespace    http://tampermonkey.net/
// @version      4
// @description  Распознавание данных релизов для QHero с авто-выбором чекбоксов
// @author       Freem
// @match        https://qhero.com/collection/*
// @require      https://unpkg.com/tesseract.js@4.1.0/dist/tesseract.min.js
// ==/UserScript==
(function() {
    'use strict';
    const OCR_LANGUAGE = 'eng';
    // --- OCR ---
    async function performOCR(imageUrl, language) {
        // Отключаем логгер полностью для предотвращения нагрузки
        return Tesseract.recognize(imageUrl, language, {
            logger: () => {} // Пустой логгер
        });
    }
    // --- Извлечение данных ---
    function extractModelInfo(text) {
        // Ищем секцию "Model Information"
        const modelSectionMatch = text.match(/Model Information([\s\S]*?)(?=\n{2,}|$)/i);
        let modelSectionText = text; // fallback на весь текст
        if (modelSectionMatch) {
            modelSectionText = modelSectionMatch[1];
        }
        // В секции ищем Name и Date
        const nameRegex = /Name\s*:\s*(.+?)(?:\r?\n|$)/i;
        const dateRegex = /\bDate of Birth.*?\b(\d{1,2}\/\d{1,2}\/\d{2,4})\b/i;
        return {
            name: modelSectionText.match(nameRegex)?.[1]?.trim() || null,
            birthDate: text.match(dateRegex)?.[1] || null // Date ищем во всем тексте, т.к. она может быть вне секции
        };
    }
    function extractPropertyInfo(text) {
        const sectionStart = text.indexOf("Property Information");
        if (sectionStart === -1) return { description: null };
        const descMatch = text.substring(sectionStart).match(/Description\s*:\s*(.+?)(?:\r?\n|$)/i);
        return { description: descMatch?.[1]?.trim() || null };
    }
    // --- Извлечение Shoot Name/Ref ---
    function extractShootRef(text) {
        // Ищем строку "Shoot Name/Ref:" и захватываем текст до конца строки
        const refRegex = /Shoot Name\/Ref\s*:\s*(.+?)(?:\r?\n|$)/i;
        return text.match(refRegex)?.[1]?.trim() || null;
    }
    // --- Проверка релиза ---
    function containsIncorrectRelease(text, mode) {
        if (mode === 'model' && /Property release/i.test(text)) return true;
        if (mode === 'property' && /Model release/i.test(text)) return true;
        return false;
    }
    // --- Вставка даты ---
    async function selectDropdownValue(container, valueStr) {
        return new Promise((resolve) => {
            const trigger = container.querySelector('.select2-choice, .select2-selection, .select2-selection__rendered');
            if (!trigger) return resolve(false);
            trigger.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
            const trySelect = (attempt = 1) => {
                const labels = Array.from(document.querySelectorAll('.select2-result-label'));
                if (!labels.length) {
                    if (attempt < 10) {
                        setTimeout(() => trySelect(attempt + 1), 100);
                    } else {
                        resolve(false);
                    }
                    return;
                }
                const cleaned = s => s.trim().toLowerCase();
                const target = cleaned(valueStr);
                const found = labels.find(label => cleaned(label.textContent || '') === target);
                const li = found?.closest('li');
                if (!li) return resolve(false);
                li.scrollIntoView({ behavior: "smooth", block: "center" });
                li.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
                li.click();
                setTimeout(() => {
                    document.body.click();
                    resolve(true);
                }, 200);
            };
            setTimeout(() => trySelect(1), 150);
        });
    }
    // --- Общие функции ---
    function findInputByPlaceholder(placeholderText) {
        return document.querySelector(`input[placeholder="${placeholderText}"]`);
    }
    function findBirthdateSelects() {
        return {
            yearSelect: document.querySelector('.date-selector .year-selector'),
            monthSelect: document.querySelector('.date-selector .month-selector'),
            daySelect: document.querySelector('.date-selector .day-selector')
        };
    }
    function chooseRadio(value) {
        const radio = document.querySelector(`input[type="radio"][value="${value}"]`);
        if (radio) {
            radio.click();
            radio.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }
    // --- Спиннер (без setInterval) ---
    function updateSpinner(button, frame) {
        if (button.dataset.spinnerActive === "true") {
            button.textContent = `Распознавание ${frame}`;
        }
    }
    function stopSpinner(button, finalText, originalText, delay = 1500) {
        button.dataset.spinnerActive = "false";
        button.textContent = finalText;
        setTimeout(() => {
            if (button.dataset.spinnerActive === "false") {
                button.textContent = originalText;
                button.disabled = false;
            }
        }, delay);
    }
    // --- Обработчик Insert Model ---
    async function handleModelInsert(event) {
        const button = event.target;
        const originalText = button.textContent;
        button.disabled = true;
        button.dataset.spinnerActive = "true";
        const frames = ['⠋','⠙','⠹','⠸','⠼','⠴','⠦','⠧','⠇','⠏'];
        let i = 0;
        const spin = () => {
            if (button.dataset.spinnerActive === "true") {
                updateSpinner(button, frames[i]);
                i = (i + 1) % frames.length;
                setTimeout(spin, 100);
            }
        };
        spin();
        try {
            chooseRadio("model");
            chooseRadio("no");
            const img = document.querySelector('img.img-responsive');
            if (!img) throw new Error("Изображение не найдено.");
            const result = await performOCR(img.src, OCR_LANGUAGE);
            // Проверка на Property release
            if (containsIncorrectRelease(result.data.text, 'model')) {
                stopSpinner(button, '❌ Некорректный релиз', originalText, 2000);
                return;
            }
            const { name, birthDate } = extractModelInfo(result.data.text);
            const shootRef = extractShootRef(result.data.text); // Извлекаем Shoot Name/Ref
            const nameInput = findInputByPlaceholder("Name of model");
            if (name) {
                nameInput.value = name;
                nameInput.dispatchEvent(new Event('input', { bubbles: true }));
                nameInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
            const { yearSelect, monthSelect, daySelect } = findBirthdateSelects();
            const [monthRaw, dayRaw, yearRaw] = birthDate?.split('/') || [];
            const month = parseInt(monthRaw), day = parseInt(dayRaw), year = parseInt(yearRaw);
            const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June',
                                'July', 'August', 'September', 'October', 'November', 'December'];
            if (year && yearSelect) await selectDropdownValue(yearSelect, year.toString());
            if (month && monthSelect) await selectDropdownValue(monthSelect, monthNames[month]);
            if (day && daySelect) await selectDropdownValue(daySelect, day.toString());

            // Вставляем Shoot Name/Ref в поле "Release Reference" для Model
            if (shootRef) {
                const refInput = findInputByPlaceholder("Release Reference");
                if (refInput) {
                    refInput.value = shootRef;
                    refInput.dispatchEvent(new Event('input', { bubbles: true }));
                    refInput.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }

            stopSpinner(button, '✅ Готово', originalText);
        } catch (e) {
            console.error("[OCR Model Error]", e.message); // Можно удалить
            stopSpinner(button, '❌ Ошибка', originalText, 2000);
        }
    }
    // --- Обработчик Insert Property ---
    async function handlePropertyInsert(event) {
        const button = event.target;
        const originalText = button.textContent;
        button.disabled = true;
        button.dataset.spinnerActive = "true";
        const frames = ['⠋','⠙','⠹','⠸','⠼','⠴','⠦','⠧','⠇','⠏'];
        let i = 0;
        const spin = () => {
            if (button.dataset.spinnerActive === "true") {
                updateSpinner(button, frames[i]);
                i = (i + 1) % frames.length;
                setTimeout(spin, 100);
            }
        };
        spin();
        try {
            chooseRadio("prop");
            const img = document.querySelector('img.img-responsive');
            if (!img) throw new Error("Изображение не найдено.");
            const result = await performOCR(img.src, OCR_LANGUAGE);
            // Проверка на Model release
            if (containsIncorrectRelease(result.data.text, 'property')) {
                stopSpinner(button, '❌ Некорректный релиз', originalText, 2000);
                return;
            }
            const { description } = extractPropertyInfo(result.data.text);
            const shootRef = extractShootRef(result.data.text); // Извлекаем Shoot Name/Ref
            const propInput = findInputByPlaceholder("Name of property");
            if (description) {
                propInput.value = description;
                propInput.dispatchEvent(new Event('input', { bubbles: true }));
                propInput.dispatchEvent(new Event('change', { bubbles: true }));
            }

             // Вставляем Shoot Name/Ref в поле "Release Reference" для Property
             if (shootRef) {
                const refInput = findInputByPlaceholder("Release Reference");
                if (refInput) {
                    refInput.value = shootRef;
                    refInput.dispatchEvent(new Event('input', { bubbles: true }));
                    refInput.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }

            stopSpinner(button, '✅ Готово', originalText);
        } catch (e) {
            console.error("[OCR Property Error]", e.message); // Можно удалить
            stopSpinner(button, '❌ Ошибка', originalText, 2000);
        }
    }
    // --- Создание кнопок ---
    function createAndInsertButtons() {
        const modalHeader = document.querySelector('.modal-header');
        if (!modalHeader || modalHeader.querySelector('.ocr-insert-button')) return;
        modalHeader.style.display = "flex";
        modalHeader.style.justifyContent = "center";
        modalHeader.style.alignItems = "center";
        modalHeader.style.gap = "8px";
        const styleBtn = {
            fontSize: '13px',
            padding: '5px 12px',
            cursor: 'pointer',
            border: '1px solid #ccc',
            borderRadius: '4px',
            background: 'transparent',
            color: '#333',
            boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
            transition: 'box-shadow 0.2s, transform 0.1s'
        };
        function createBtn(text, handler) {
            const btn = document.createElement('button');
            btn.className = 'ocr-insert-button';
            btn.textContent = text;
            Object.assign(btn.style, styleBtn);
            btn.addEventListener('mouseenter', () => {
                btn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
                btn.style.transform = 'translateY(-1px)';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.boxShadow = '0 1px 2px rgba(0,0,0,0.2)';
                btn.style.transform = 'translateY(0)';
            });
            btn.addEventListener('click', handler);
            return btn;
        }
        const modelBtn = createBtn("Заполнить Model", handleModelInsert);
        const propBtn = createBtn("Заполнить Property", handlePropertyInsert);
        modalHeader.appendChild(modelBtn);
        modalHeader.appendChild(propBtn);
    }
    const modalObserver = new MutationObserver(() => {
        if (document.querySelector('h4.modal-title')) {
            setTimeout(createAndInsertButtons, 100);
        }
    });
    modalObserver.observe(document.body, { childList: true, subtree: true });
    if (document.querySelector('h4.modal-title')) {
        setTimeout(createAndInsertButtons, 500);
    }
})();