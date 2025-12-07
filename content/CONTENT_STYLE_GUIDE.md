# Content Style Guide - Otrar Portal

## Обязательный фреймворк для создания обучающего контента

Этот документ определяет стандарты и компоненты для всех MDX статей.

---

## Структура статьи

Каждая статья ДОЛЖНА содержать следующие секции в указанном порядке:

```mdx
---
# Frontmatter (обязательные поля)
title: "Название статьи"
description: "SEO описание (150-160 символов)"
category: "core" | "industry" | "functional"
subcategory: "путь/к/категории"
difficulty: "beginner" | "intermediate" | "advanced"
duration: 15  # минуты чтения
xp_reward: 25
published: true
author: "ТОО «Нейрошторм»"
---

## Цели обучения
<LearningObjectives items={[
  "Первая цель",
  "Вторая цель",
  "Третья цель"
]} />

---

## Основной контент

### Секция 1
Контент с использованием компонентов...

### Секция 2
...

---

## Практические упражнения

<Exercise number={1} title="Название">
**Задание:** Описание задания

<Solution>
Решение задачи...
</Solution>
</Exercise>

---

## Глоссарий

<Glossary terms={[
  { term: "Термин", definition: "Определение" }
]} />

---

## Контрольные вопросы

<Quiz questions={[
  { question: "Вопрос?", answer: "Ответ" }
]} />

---

## Следующие шаги

<NextSteps articles={[
  { slug: "next-article", title: "Название" }
]} />
```

---

## MDX Компоненты

### Визуализация данных

#### SegmentGrid - Сетка сегментов/категорий
```mdx
<SegmentGrid items={[
  {
    id: "M",
    title: "Meetings",
    subtitle: "Деловые встречи",
    icon: "users",
    color: "blue",
    items: ["Board meetings", "Training", "Workshops"],
    stats: { participants: "10-50", duration: "1-3 дня" }
  }
]} columns={2} />
```

#### ProcessFlow - Процесс/воронка
```mdx
<ProcessFlow
  title="Этапы организации мероприятия"
  steps={[
    { title: "Бриф", description: "Сбор требований", icon: "clipboard" },
    { title: "Планирование", description: "Разработка концепции", icon: "calendar" },
    { title: "Исполнение", description: "Проведение", icon: "play" },
    { title: "Отчёт", description: "Анализ результатов", icon: "chart" }
  ]}
  direction="horizontal"
/>
```

#### Checklist - Чек-лист
```mdx
<Checklist
  title="Подготовка к выставке"
  sections={[
    {
      title: "До выставки (3-6 месяцев)",
      items: [
        "Выбор выставки и бронирование стенда",
        "Разработка концепции стенда",
        "Производство материалов"
      ]
    },
    {
      title: "Во время выставки",
      items: [
        "Монтаж стенда",
        "Работа на стенде"
      ]
    }
  ]}
/>
```

#### ComparisonCard - Сравнительные карточки
```mdx
<ComparisonCards
  items={[
    {
      title: "Trade Show (B2B)",
      features: ["Только для бизнеса", "Закупки, контракты"],
      examples: ["KITF", "ITB Berlin"]
    },
    {
      title: "Consumer Show (B2C)",
      features: ["Открыто для публики", "Продажи потребителям"],
      examples: ["Авто-шоу", "Wedding Expo"]
    }
  ]}
/>
```

#### StatCard - Статистика
```mdx
<StatCards items={[
  { value: "$1.1T", label: "Глобальный рынок MICE", trend: "+7%" },
  { value: "100+", label: "Международных мероприятий/год в КЗ" }
]} />
```

### Информационные блоки

#### Callout - Выноска (уже есть)
```mdx
<Callout type="info" title="Заголовок">
Текст выноски
</Callout>

Типы: info, tip, warning, note
```

#### KeyConcept - Ключевая концепция
```mdx
<KeyConcept
  term="MICE"
  definition="Meetings, Incentives, Conferences, Exhibitions — четыре сегмента делового туризма"
/>
```

### Обучающие элементы

#### LearningObjectives - Цели обучения
```mdx
<LearningObjectives items={[
  "Расшифровать аббревиатуру MICE",
  "Понимать структуру рынка",
  "Различать типы мероприятий"
]} />
```

#### Exercise - Упражнение
```mdx
<Exercise number={1} title="Классификация">
**Задание:** Определите сегмент MICE...

<Solution>
1. **Ответ** — объяснение
</Solution>
</Exercise>
```

#### Glossary - Глоссарий
```mdx
<Glossary terms={[
  { term: "PCO", definition: "Professional Congress Organizer" },
  { term: "DMC", definition: "Destination Management Company" }
]} />
```

#### Quiz - Контрольные вопросы
```mdx
<Quiz questions={[
  { question: "Что означает MICE?", hint: "4 сегмента" }
]} />
```

#### NextSteps - Следующие шаги
```mdx
<NextSteps articles={[
  { slug: "event-planning", title: "Планирование мероприятий" }
]} />
```

### Таблицы

Использовать стандартные Markdown таблицы (GFM поддерживается):

```markdown
| Тип | Участники | Длительность |
|-----|-----------|--------------|
| Board Meeting | 5-20 | 1-2 дня |
| Workshop | 15-40 | 0.5-2 дня |
```

---

## Критические правила MDX синтаксиса

### 1. Пустые строки вокруг блоков

**ОБЯЗАТЕЛЬНО** добавлять пустую строку:
- До и после каждого компонента `<Component />`
- До и после таблиц
- До и после блоков кода

```mdx
<!-- ПРАВИЛЬНО -->
Текст перед компонентом.

<SegmentGrid items={[...]} />

Текст после компонента.

<!-- НЕПРАВИЛЬНО -->
Текст перед компонентом.
<SegmentGrid items={[...]} />
Текст после компонента.
```

### 2. JSX атрибуты через `=`, не `:`

```mdx
<!-- ПРАВИЛЬНО -->
<Checklist title="Название" sections={[...]} />

<!-- НЕПРАВИЛЬНО -->
<Checklist title: "Название" sections={[...]} />
```

### 3. Кавычки в атрибутах

Использовать **двойные кавычки** для строковых атрибутов:

```mdx
<!-- ПРАВИЛЬНО -->
<KeyConcept term="MICE" definition="Описание" />

<!-- НЕПРАВИЛЬНО -->
<KeyConcept term='MICE' definition='Описание' />
```

### 4. Массивы и объекты в `{}`

```mdx
<!-- ПРАВИЛЬНО -->
<SegmentGrid items={[
  { id: "M", title: "Meetings" }
]} />

<!-- НЕПРАВИЛЬНО -->
<SegmentGrid items="[...]" />
```

### 5. Многострочные компоненты

Закрывающая скобка на отдельной строке:

```mdx
<!-- ПРАВИЛЬНО -->
<SegmentGrid
  columns={2}
  items={[
    { id: "M", title: "Meetings" },
    { id: "I", title: "Incentives" }
  ]}
/>

<!-- НЕПРАВИЛЬНО (сложно читать) -->
<SegmentGrid columns={2} items={[{ id: "M", title: "Meetings" }, { id: "I", title: "Incentives" }]} />
```

### 6. Экранирование специальных символов

В JSX-атрибутах нужно экранировать:
- `{` → `{'{'}`
- `}` → `{'}'}`
- `<` → `{'<'}` или `&lt;`
- `>` → `{'>'}` или `&gt;`

```mdx
<!-- Если нужен символ { в тексте -->
<KeyConcept definition="Формат: {'{'} data {'}'}" />
```

### 7. Комментарии в MDX

```mdx
{/* Это комментарий в MDX */}

<!-- Это тоже работает, но не рекомендуется -->
```

---

## Правила форматирования

### Заголовки
- `## H2` — Основные секции
- `### H3` — Подсекции
- `#### H4` — Мини-секции (редко)

### Выделение
- **Жирный** — ключевые термины при первом упоминании
- `код` — команды, коды, технические термины
- *курсив* — иностранные слова, цитаты

### Списки
- Маркированные для перечислений
- Нумерованные для последовательностей

### Emoji
Использовать умеренно, только для визуальных маркеров:
- Не использовать в заголовках
- Можно в Callout и списках где уместно

---

## Запрещено

1. **ASCII-диаграммы** — не рендерятся корректно
2. **Inline HTML** — кроме `<details>/<summary>`
3. **Внешние изображения** — только из `/public/`
4. **Длинные блоки кода** без объяснения
5. **Контент без практических упражнений**

---

## Frontmatter Schema

```yaml
# Обязательные
title: string
description: string (150-160 chars)
category: "core" | "industry" | "functional"
difficulty: "beginner" | "intermediate" | "advanced"
duration: number (минуты)
xp_reward: number
published: boolean
author: string

# Рекомендуемые
subcategory: string
tags: string[]
prerequisites: string[] (slugs)
next_articles: string[] (slugs)
competency_level: 1-5

# Опциональные
featured: boolean
sort_order: number
tenant_scope: string
industry_tags: string[]
department_tags: string[]
role_tags: string[]
mbti_types: string[]
```

---

## Чек-лист перед публикацией

- [ ] Frontmatter заполнен полностью
- [ ] Есть секция "Цели обучения"
- [ ] Минимум 2 практических упражнения
- [ ] Есть глоссарий (если есть термины)
- [ ] Есть контрольные вопросы
- [ ] Есть "Следующие шаги"
- [ ] Нет ASCII-диаграмм
- [ ] Все компоненты из списка разрешённых
- [ ] Проверена орфография
- [ ] Протестировано в dev режиме

---

*Версия: 1.0 | Декабрь 2025*
