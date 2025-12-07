# Import Content from Notion

Импорт и конвертация контента из Notion в MDX формат для Otrar Portal.

## Workflow импорта

### 1. Экспорт из Notion
```
Notion -> Export -> Markdown & CSV
- Include subpages: Yes
- Export format: Markdown
```

### 2. Положить файлы
Скопировать экспортированные .md файлы в:
```
/Users/david/Projects/otrar-portal/content/import/
```

### 3. Конвертация в MDX

Для каждого файла:
1. Переименовать `.md` -> `.mdx`
2. Добавить frontmatter:
```yaml
---
title: "Название статьи"
description: "Описание для SEO (150-160 символов)"
category: "business" | "personal" | "industry"
subcategory: "конкретная подкатегория"
difficulty: "beginner" | "intermediate" | "advanced"
duration: 15  # минуты чтения
xp_reward: 25
published: true
author: "ТОО «Нейрошторм»"
---
```

3. Конвертировать Notion-специфичный синтаксис:
   - `> [!NOTE]` -> `<Callout type="info">`
   - `> [!WARNING]` -> `<Callout type="warning">`
   - `> [!TIP]` -> `<Callout type="tip">`
   - `{{embed}}` -> удалить или заменить на `<Video>`

### 4. Очистка
После конвертации запустить очистку:
```bash
npx tsx scripts/clean-imported-content.ts --apply
```

### 5. Проверка
```bash
npm run build
npm run dev
# Проверить статьи в браузере
```

## Категории

| Категория | Подкатегории |
|-----------|-------------|
| `business` | project-management, leadership, negotiation, team-management, operations, marketing, sales, finance, strategy |
| `personal` | psychology, psychology/mbti, time-management, career-development, communication, digital-skills, change-management, presentations, problem-solving |
| `industry` | travel/aviation, travel/mice, travel/tourism, travel/concierge |

## MDX Компоненты

Доступные компоненты для обогащения контента:
- `<LearningObjectives items={[...]} />` - цели обучения
- `<Callout type="info|tip|warning">` - выноски
- `<KeyConcept term="..." definition="..." />` - ключевые концепции
- `<Exercise number={1} title="...">` - упражнения
- `<Glossary terms={[...]} />` - глоссарий
- `<Quiz questions={[...]} />` - контрольные вопросы
- `<ProcessFlow steps={[...]} />` - процессы
- `<Checklist sections={[...]} />` - чек-листы
- `<ComparisonCards items={[...]} />` - сравнения
- `<StatCards items={[...]} />` - статистика

## Связанные файлы

- `content/CONTENT_STYLE_GUIDE.md` - полный гайд по контенту
- `scripts/clean-imported-content.ts` - скрипт очистки
- `src/components/learning/ContentComponents.tsx` - MDX компоненты
