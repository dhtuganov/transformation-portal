# Clean Imported Content

Очистка и категоризация импортированного контента для Otrar Portal.

## Что делает этот скрипт

1. **Удаляет MindTools ссылки и копирайты**
   - URL-адреса mindtools.com
   - Markdown ссылки на MindTools
   - Copyright уведомления

2. **Удаляет Notion метаданные**
   - `Tags:`, `URL:`, `Property:`, `Описание:`
   - Маркеры `Annotate`

3. **Исправляет форматирование**
   - Двойные пробелы
   - Лишние переносы строк
   - Trailing whitespace

4. **Обновляет категории**
   - `business` - бизнес навыки (project-management, leadership, negotiation, team-management, operations, marketing, sales, finance)
   - `personal` - личное развитие (psychology, mbti, time-management, career-development, communication, digital-skills)
   - `industry` - отраслевые знания (travel/aviation, travel/mice, travel/tourism, travel/concierge)

5. **Генерирует теги** на основе контента

## Использование

### Анализ (dry-run)
```bash
cd /Users/david/Projects/otrar-portal
npx tsx scripts/clean-imported-content.ts
```

### Применить изменения
```bash
cd /Users/david/Projects/otrar-portal
npx tsx scripts/clean-imported-content.ts --apply
```

## После очистки

1. Проверить статьи с "пустыми" ссылками (`**текст**` без URL)
2. Добавить внутренние ссылки на релевантные статьи
3. Добавить картинки если нужны (в `/public/images/`)
4. Запустить `npm run build` для проверки

## Связанные файлы

- `scripts/clean-imported-content.ts` - скрипт очистки
- `content/CONTENT_STYLE_GUIDE.md` - гайд по контенту
- `src/components/learning/ContentComponents.tsx` - MDX компоненты
