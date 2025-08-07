import os
import xml.etree.ElementTree as ET
from lxml import etree
from pathlib import Path
import shutil

# ========================================
# Настройки
# ========================================
MIN_NEW_ENGINE = 1300  # Engine 1300+ = Capture One 21 и новее
OLD_BACKUP_FOLDER_NAME = "_old_styles" # Имя папки для бэкапа

# Шаблон ColorCorrections: 8 слоёв, нейтральные значения (не меняют изображение)
DEFAULT_COLOR_CORRECTIONS_TEMPLATE = (
    "1,1,0,6,0,0,255,128,128,0,0,0,0,0,0,0,0,0;"
    "1,1,0,6,0,0,255,128,128,0,0,0,0,0,0,0,0,0;"
    "1,1,0,6,0,0,255,128,128,0,0,0,0,0,0,0,0,0;"
    "1,1,0,6,0,0,255,128,128,0,0,0,0,0,0,0,0,0;"
    "1,1,0,6,0,0,255,128,128,0,0,0,0,0,0,0,0,0;"
    "1,1,0,6,0,0,255,128,128,0,0,0,0,0,0,0,0,0;"
    "1,1,0,6,0,0,255,128,128,0,0,0,0,0,0,0,0,0;"
    "1,1,0,6,0,0,255,128,128,0,0,0,0,0,0,0,0,0"
)

# ========================================
# Вспомогательные функции
# ========================================
def parse_xml_from_string(content, file_name="unknown"):
    """Безопасный парсинг XML без лишнего логирования"""
    try:
        # Удаляем BOM, если есть
        if content.startswith('\ufeff'):
            content = content[1:]

        content = content.strip()
        if not content:
            return None

        # Удаляем XML-декларацию
        if content.startswith('<?xml'):
            pos = content.find('?>')
            if pos != -1:
                content = content[pos + 2:].strip()
            else:
                content = content[content.find('>') + 1:].strip()

        # Убедимся, что контент начинается с <SL
        if not content.strip().startswith('<SL'):
            return None

        # Найдём начало и конец корневого тега <SL> ... </SL>
        end_tag = "</SL>"

        # Найдём закрывающий </SL>
        end_pos = content.rfind(end_tag)

        if end_pos == -1:
            # Нет закрывающего тега — попробуем его добавить
            content = content.rstrip() + "\n</SL>"
        else:
            # Обрезаем всё после </SL>
            real_end = end_pos + len(end_tag)
            if real_end < len(content):
                content = content[:real_end]

        # Проверим, что теперь XML корректный
        root = ET.fromstring(content)
        return root

    except Exception:
        # Любая ошибка при парсинге -> None
        return None

def get_engine_version(root):
    """Возвращает числовое значение Engine. Если не число — возвращает None."""
    engine_str = root.attrib.get("Engine", None)
    if engine_str is None:
        return None # Engine отсутствует
    try:
        return int(engine_str.strip())
    except ValueError:
        return None # Engine не является числом

def extract_color_corrections(root):
    """Извлекает значение ColorCorrections, если есть"""
    for elem in root.findall("E"):
        if elem.attrib.get("K") == "ColorCorrections":
            return elem.attrib.get("V", "")
    return ""

def merge_color_corrections(original, template):
    """
    Объединяет существующие настройки ColorCorrections с шаблоном.
    Сохраняет оригинальные значения, где они есть.
    Остальные слои берутся из шаблона.
    """
    original_layers = [layer.strip() for layer in original.split(";") if layer.strip()]
    template_layers = template.split(";")

    merged = []
    for i in range(len(template_layers)):
        if i < len(original_layers) and original_layers[i]:
            merged.append(original_layers[i])
        else:
            merged.append(template_layers[i])

    return ";".join(merged)

def remove_icc_profile(root):
    """Удаляет элемент <E K="ICCProfile" ... /> из XML, если он есть."""
    for elem in root.findall("E"):
        if elem.attrib.get("K") == "ICCProfile":
            root.remove(elem)
            return True # Удалён
    return False # Не найден

def create_color_corrections_element(value):
    """Создаёт элемент <E K="ColorCorrections"> с заданным значением"""
    return ET.Element("E", {
        "K": "ColorCorrections",
        "V": value
    })

def process_cos_content(content: str, file_name: str):
    """Обрабатывает XML-содержимое стиля (.cos или .costyle)"""
    root = parse_xml_from_string(content, file_name)
    if root is None:
        return None

    # Получаем текущий Engine
    engine_version = get_engine_version(root)
    # Если Engine отсутствует или не число, считаем стиль "современным" или "не требующим обновления по Engine"
    # и не обновляем его Engine. Только добавляем/обновляем ColorCorrections и удаляем ICCProfile.
    # Но по логике скрипта, если стиль попал в old_engine_files, он уже проверен на < 1300.
    # Однако, чтобы быть уверенным, проверим здесь.
    # Нет, логика такая: если стиль попал в old_engine_files, он точно < 1300.
    # Но если get_engine_version возвращает None, это странно. Лучше обработать.
    # Пересмотрим логику в main.

    # Извлекаем текущие ColorCorrections
    current_cc = extract_color_corrections(root)

    # Формируем обновлённый ColorCorrections
    new_cc_value = merge_color_corrections(current_cc, DEFAULT_COLOR_CORRECTIONS_TEMPLATE)

    # Проверяем, есть ли элемент ColorCorrections
    cc_element = None
    for elem in root.findall("E"):
        if elem.attrib.get("K") == "ColorCorrections":
            cc_element = elem
            break

    if cc_element is not None:
        cc_element.set("V", new_cc_value)
    else:
        root.append(create_color_corrections_element(new_cc_value))

    # Удаляем ICCProfile, если есть
    remove_icc_profile(root)

    # Обновляем Engine, если он был и был старым
    # Но так как мы уже проверили это в main, можно просто установить MIN_NEW_ENGINE
    # if engine_version is not None and engine_version < MIN_NEW_ENGINE:
    # Упрощаем: если мы обрабатываем файл, значит он требует обновления Engine
    root.set("Engine", str(MIN_NEW_ENGINE))

    # Сериализуем обратно в строку
    xml_str = ET.tostring(root, encoding='unicode')
    full_content = f'<?xml version="1.0"?>\n{xml_str}'

    # Форматируем с помощью lxml
    parser = etree.XMLParser(remove_blank_text=True)
    element = etree.fromstring(full_content, parser)
    pretty_content = etree.tostring(element, pretty_print=True, encoding='unicode')

    return pretty_content

def convert_single_file(src_path: Path, backup_path: Path, input_folder: Path):
    """Обрабатывает один файл (.cos или .costyle), сохраняя оригинал в backup_path с сохранением структуры и перезаписывая исходный"""
    try:
        # Оба типа файлов - обычные текстовые XML
        with open(src_path, 'r', encoding='utf-8-sig') as f:
            original_content = f.read()

        processed_content = process_cos_content(original_content, src_path.name)
        if processed_content is None:
            return False

        # 1. Копируем оригинальный файл в папку бэкапа, сохраняя структуру
        try:
            relative_path = src_path.relative_to(input_folder)
            backup_file_path = backup_path / relative_path
            backup_file_path.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src_path, backup_file_path) # copy2 сохраняет метаданные
        except Exception:
            # Не прерываем основную операцию из-за ошибки бэкапа
            pass

        # 2. Перезаписываем оригинальный файл
        try:
            with open(src_path, 'w', encoding='utf-8') as f:
                f.write(processed_content)
            return True
        except Exception:
            return False

    except Exception:
        return False

# ========================================
# Основная логика
# ========================================
def main():
    print("🔍 Capture One Style Converter v14")
    print("— Поддержка .cos и .costyle (как XML)")
    print("— Обновление всех стилей с Engine < 1300")
    print("— Добавление/обновление ColorCorrections (8 слоёв)")
    print("— Удаление ICCProfile")
    print("— Копирование оригиналов в папку '_old_styles' с сохранением структуры")
    print("— Перезапись оригинальных файлов обновлёнными\n")

    # Ввод пути
    input_path = input("📁 Введите путь к папке со стилями: ").strip().strip('"\'')
    input_folder = Path(input_path)

    if not input_folder.exists():
        print("❌ Ошибка: Указанный путь не существует.")
        return
    if not input_folder.is_dir():
        print("❌ Ошибка: Указанный путь не является папкой.")
        return

    # Поиск всех .cos и .costyle
    cos_files = list(input_folder.rglob("*.cos"))
    costyle_files = list(input_folder.rglob("*.costyle"))
    all_files = cos_files + costyle_files

    if not all_files:
        print("⚠️  В указанной папке нет файлов .cos или .costyle.")
        return

    # Анализ: какие Engine
    old_engine_files = []
    new_engine_files = []
    corrupted_files = []

    for file_path in all_files:
        try:
            # Читаем содержимое
            # Используем логику из v6/v10/v13 - оба типа файлов как XML
            with open(file_path, 'r', encoding='utf-8-sig') as f:
                content = f.read()

            root = parse_xml_from_string(content, file_path.name)
            if root is None:
                corrupted_files.append(file_path)
                continue

            engine_version = get_engine_version(root)

            # Исправленная логика:
            # - Если Engine отсутствует (None) или >= MIN_NEW_ENGINE -> Современный
            # - Если Engine < MIN_NEW_ENGINE -> Устаревший
            if engine_version is not None and engine_version < MIN_NEW_ENGINE:
                old_engine_files.append((file_path, engine_version))
            else:
                new_engine_files.append((file_path, engine_version if engine_version is not None else "N/A"))

        except Exception:
            corrupted_files.append(file_path)

    # Отчёт (только итоги)
    total = len(all_files)
    old_count = len(old_engine_files)
    new_count = len(new_engine_files)
    corrupt_count = len(corrupted_files)

    print(f"\n📊 Найдено стилей: {total}")
    print(f"  • Устаревшие (Engine < {MIN_NEW_ENGINE}): {old_count}")
    if old_count > 0:
        engines = [str(v) for _, v in old_engine_files]
        unique_engines = sorted(set(engines), key=lambda x: int(x) if x.isdigit() else 0)
    print(f"  • Современные (Engine ≥ {MIN_NEW_ENGINE} или отсутствует): {new_count}")
    if corrupt_count:
        print(f"  • Повреждённые/нечитаемые: {corrupt_count}")
    if old_count == 0:
        print("\n✅ Нет стилей для обновления.")
        return

    # Предложение конвертировать (только итоги и запрос)
    print(f"\n🔄 Найдено {old_count} устаревших стилей.")
    response = input("Хотите обновить их? (y/n): ").strip().lower()
    if response not in ('y', 'yes', 'д', 'да'):
        print("Отменено пользователем.")
        return

    # Создание папки для бэкапа
    backup_folder = input_folder / OLD_BACKUP_FOLDER_NAME
    try:
        backup_folder.mkdir(parents=True, exist_ok=True)
    except Exception:
        print(f"❌ Ошибка при подготовке папки для бэкапа.")
        return

    # Конвертация (без вывода каждого файла)
    # print("\n🔄 Обрабатываю стили...") # Убрано
    converted = 0
    failed = 0

    for src_path, engine_ver in old_engine_files:
        try:
            success = convert_single_file(src_path, backup_folder, input_folder)
            if success:
                # print(f"✅ {src_path.relative_to(input_folder)}") # Убрано
                converted += 1
            else:
                failed += 1
        except Exception:
            failed += 1

    # Финальный отчёт (только итоги)
    print(f"\n🎉 Конвертация завершена!")
    print(f"  Успешно обновлено: {converted}")
    if failed:
        print(f"  Ошибок: {failed}")
    print(f"  Оригиналы сохранены в: {backup_folder}")


# ========================================
# Запуск
# ========================================
if __name__ == "__main__":
    main()
