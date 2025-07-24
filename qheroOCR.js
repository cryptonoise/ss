// ==UserScript==
// @name         QHero Release OCR
// @version      3.6
// @description  Распознавание данных релизов для QHero с авто-выбором чекбоксов + адаптивные названия релизов + Owner name
// @author       Freem
// @match        https://qhero.com/collection/*
// @require      https://unpkg.com/tesseract.js@4.1.0/dist/tesseract.min.js
// ==/UserScript==
(function() {
    'use strict';
    const OCR_LANGUAGE = 'eng';

    // --- Фикс для названий релизов ---
    function applyReleasesTitleFix() {
        const isReleasesActive = document.querySelector('li.active a')?.textContent?.trim() === 'Releases';
        if (!isReleasesActive) return;
        if (document.getElementById('release-title-fix')) return;
        const style = document.createElement('style');
        style.id = 'release-title-fix';
        style.textContent = `
            .asset-prop .row-header {
                white-space: normal !important;
                word-break: break-word !important;
                line-height: 1.4 !important;
            }
            .asset-prop .property.row {
                height: auto !important;
                min-height: 29px;
                padding-top: 4px;
                padding-bottom: 4px;
            }
        `;
        document.head.appendChild(style);
    }
    const tabObserver = new MutationObserver(applyReleasesTitleFix);
    tabObserver.observe(document.body, { childList: true, subtree: true });
    applyReleasesTitleFix();

    // --- OCR ---
    async function performOCR(imageUrl, language) {
        return Tesseract.recognize(imageUrl, language, { logger: () => {} });
    }

    // --- Извлечение данных для Model ---
    function extractModelInfo(text) {
        const shootRef = text.match(/Shoot Name\/Ref\s*:\s*(.+?)(?:\r?\n|$)/i)?.[1]?.trim() || null;

        const nameMatches = text.match(/Name\s*:\s*(.+?)(?:\r?\n|$)/gi);
        let modelName = null;
        if (nameMatches && nameMatches.length >= 2) {
            modelName = nameMatches[1].replace(/Name\s*:\s*/i, '').trim();
        }

        const modelSectionStart = text.search(/Model Information/i);
        let birthDate = null;
        if (modelSectionStart !== -1) {
            const modelSection = text.substring(modelSectionStart);
            birthDate = modelSection.match(/\bDate of Birth.*?\b(\d{1,2}\/\d{1,2}\/\d{2,4})\b/i)?.[1] || null;
        }

        let gender = null;
        if (modelSectionStart !== -1) {
            const modelSection = text.substring(modelSectionStart);
            gender = modelSection.match(/Gender\s*:\s*(.+?)(?:\r?\n|$)/i)?.[1]?.trim() || null;
        }

        return {
            name: modelName,
            birthDate: birthDate,
            gender: gender,
            shootRef: shootRef
        };
    }

    // --- Извлечение данных для Property ---
    function extractPropertyInfo(text) {
        const shootRef = text.match(/Shoot Name\/Ref\s*:\s*(.+?)(?:\r?\n|$)/i)?.[1]?.trim() || null;
        const ownerName = text.match(/Owner name\s*:\s*(.+?)(?:\r?\n|$)/i)?.[1]?.trim() || null;

        const propertySectionStart = text.search(/Property Information/i);
        let description = null;
        if (propertySectionStart !== -1) {
            const propertySection = text.substring(propertySectionStart);
            description = propertySection.match(/Description\s*:\s*(.+?)(?:\r?\n|$)/i)?.[1]?.trim() || null;
        }

        return {
            description: description,
            shootRef: shootRef,
            ownerName: ownerName
        };
    }

    function containsIncorrectRelease(text, mode) {
        return (mode === 'model' && /Property release/i.test(text)) ||
               (mode === 'property' && /Model release/i.test(text));
    }

    async function selectDropdownValue(container, valueStr) {
        return new Promise((resolve) => {
            const trigger = container.querySelector('.select2-choice, .select2-selection, .select2-selection__rendered');
            if (!trigger) return resolve(false);
            trigger.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
            const trySelect = (attempt = 1) => {
                const labels = Array.from(document.querySelectorAll('.select2-result-label'));
                if (!labels.length) {
                    if (attempt < 10) return setTimeout(() => trySelect(attempt + 1), 100);
                    return resolve(false);
                }
                const cleaned = s => s.trim().toLowerCase();
                const found = labels.find(label => cleaned(label.textContent || '') === cleaned(valueStr));
                const li = found?.closest('li');
                if (!li) return resolve(false);
                li.scrollIntoView({ behavior: "smooth", block: "center" });
                li.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
                li.click();
                setTimeout(() => { document.body.click(); resolve(true); }, 200);
            };
            setTimeout(() => trySelect(1), 150);
        });
    }

    async function selectGender(container, genderStr) {
        return selectDropdownValue(container, genderStr);
    }

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
        if (radio) { radio.click(); radio.dispatchEvent(new Event('change', { bubbles: true })); }
    }

    // --- Спиннер ---
    function updateSpinner(button, frame) {
        if (button.dataset.spinnerActive === "true") button.textContent = `Распознавание ${frame}`;
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

    // --- Вставка Model ---
    async function handleModelInsert(event) {
        const button = event.target;
        const originalText = button.textContent;
        button.disabled = true;
        button.dataset.spinnerActive = "true";
        const frames = ['⠋','⠙','⠹','⠸','⠼','⠴','⠦','⠧','⠇','⠏'];
        (function spin(i=0) {
            if (button.dataset.spinnerActive === "true") {
                updateSpinner(button, frames[i]);
                setTimeout(() => spin((i + 1) % frames.length), 100);
            }
        })();
        try {
            chooseRadio("model");
            chooseRadio("no");
            const img = document.querySelector('img.img-responsive');
            if (!img) throw new Error("Изображение не найдено.");
            const result = await performOCR(img.src, OCR_LANGUAGE);
            if (containsIncorrectRelease(result.data.text, 'model')) {
                stopSpinner(button, '❌ Некорректный релиз', originalText, 2000); return;
            }

            const { name, birthDate, gender, shootRef } = extractModelInfo(result.data.text);

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

            if (gender) {
                const genderLabel = Array.from(document.querySelectorAll('label'))
                    .find(label => label.textContent.includes('Model gender'));
                const genderSelect = genderLabel?.nextElementSibling;
                if (genderSelect) await selectGender(genderSelect, gender);
            }

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
            console.error('Ошибка OCR:', e);
            stopSpinner(button, '❌ Ошибка', originalText, 2000);
        }
    }

    // --- Вставка Property ---
    async function handlePropertyInsert(event) {
        const button = event.target;
        const originalText = button.textContent;
        button.disabled = true;
        button.dataset.spinnerActive = "true";
        const frames = ['⠋','⠙','⠹','⠸','⠼','⠴','⠦','⠧','⠇','⠏'];
        (function spin(i=0) {
            if (button.dataset.spinnerActive === "true") {
                updateSpinner(button, frames[i]);
                setTimeout(() => spin((i + 1) % frames.length), 100);
            }
        })();
        try {
            chooseRadio("prop");
            const img = document.querySelector('img.img-responsive');
            if (!img) throw new Error("Изображение не найдено.");
            const result = await performOCR(img.src, OCR_LANGUAGE);
            if (containsIncorrectRelease(result.data.text, 'property')) {
                stopSpinner(button, '❌ Некорректный релиз', originalText, 2000); return;
            }

            const { description, shootRef, ownerName } = extractPropertyInfo(result.data.text);

            const propInput = findInputByPlaceholder("Name of property");
            if (description) {
                propInput.value = description;
                propInput.dispatchEvent(new Event('input', { bubbles: true }));
                propInput.dispatchEvent(new Event('change', { bubbles: true }));
            }

            if (shootRef || ownerName) {
                const refInput = findInputByPlaceholder("Release Reference");
                if (refInput) {
                    let reference = '';
                    if (ownerName) reference += `[${ownerName}] `;
                    if (shootRef) reference += shootRef;
                    refInput.value = reference.trim();
                    refInput.dispatchEvent(new Event('input', { bubbles: true }));
                    refInput.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }

            stopSpinner(button, '✅ Готово', originalText);
        } catch (e) {
            console.error('Ошибка OCR:', e);
            stopSpinner(button, '❌ Ошибка', originalText, 2000);
        }
    }

    // --- Кнопки ---
    function createAndInsertButtons() {
        const modalHeader = document.querySelector('.modal-header');
        const modalTitle = document.querySelector('h4.modal-title')?.textContent?.trim();
        if (!modalHeader || modalHeader.querySelector('.ocr-insert-button')) return;
        if (modalTitle !== 'Edit the release') return;
        modalHeader.style.display = "flex";
        modalHeader.style.justifyContent = "center";
        modalHeader.style.alignItems = "center";
        modalHeader.style.gap = "8px";
        function createBtn(text, handler) {
            const btn = document.createElement('button');
            btn.className = 'ocr-insert-button';
            btn.textContent = text;
            Object.assign(btn.style, {
                fontSize: '13px', padding: '5px 12px', cursor: 'pointer',
                border: '1px solid #ccc', borderRadius: '4px', background: 'transparent',
                color: '#333', boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                transition: 'box-shadow 0.2s, transform 0.1s'
            });
            btn.addEventListener('mouseenter', () => { btn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)'; btn.style.transform = 'translateY(-1px)'; });
            btn.addEventListener('mouseleave', () => { btn.style.boxShadow = '0 1px 2px rgba(0,0,0,0.2)'; btn.style.transform = 'translateY(0)'; });
            btn.addEventListener('click', handler);
            return btn;
        }
        modalHeader.appendChild(createBtn("Заполнить Model", handleModelInsert));
        modalHeader.appendChild(createBtn("Заполнить Property", handlePropertyInsert));
    }

    const modalObserver = new MutationObserver(() => {
        if (document.querySelector('h4.modal-title')) setTimeout(createAndInsertButtons, 100);
    });
    modalObserver.observe(document.body, { childList: true, subtree: true });
})();
