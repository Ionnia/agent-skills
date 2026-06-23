<div align="center">

# 🛠️ agent-skills

**Моя личная коллекция скиллов для AI-агентов** — ревью кода, продуктивность и учёба.

[![skills](https://img.shields.io/badge/скиллов-7-6E56CF?style=flat-square)](#-скиллы)
[![categories](https://img.shields.io/badge/категории-3-3B82F6?style=flat-square)](#-скиллы)
[![skills.sh](https://img.shields.io/badge/skills.sh-Ionnia%2Fagent--skills-111111?style=flat-square)](https://www.skills.sh)

</div>

```sh
npx skills add Ionnia/agent-skills
```

> [!TIP]
> После установки запустите новую сессию агента — скиллы подхватываются автоматически.
> Подробности и альтернативные способы — в разделе [Установка](#-установка).

---

## 📦 Скиллы

Локальные скиллы лежат в `skills/` и сгруппированы по категориям.

### 💻 Development · `skills/development/`

| Скилл | Что делает |
| --- | --- |
| **`general-review`** | Ревью кода на любом языке или фреймворке — баги и нарушения best practices. Применяется, когда нет специализированного ревью-скилла (для Vue предпочтите `vue-review`). |
| **`vue-review`** | Ревью кода Vue 3 — компоненты, composables, фронтенд — на баги и нарушения лучших практик. |
| **`vue-rureview`** | То же ревью кода Vue 3, что и `vue-review`, но с выводом на русском языке. |

### 🗓️ Productivity · `skills/productivity/`

| Скилл | Что делает |
| --- | --- |
| **`calendar-management`** | Планирование, перенос, отмена и аудит встреч; поиск свободных слотов и защита времени для фокусной работы. Подключается, когда доступен календарный инструмент или интеграция. |

### 📚 Studying · `skills/studying/`

| Скилл | Что делает |
| --- | --- |
| **`anki-flash-cards`** | Создание карточек Anki с упором на прочное понимание материала, а не дословный пересказ. |
| **`paper-brief`** | Понятный самодостаточный разбор одной научной статьи (PDF, ссылка/ID arXiv или текст): перестраивает её в педагогическую логику, объясняет интуитивно, использует рисунки из самой статьи и собирает отдельный HTML-файл. |
| **`write-conspect`** | Конспект (study notes) по теме или вашим материалам: планирует структуру, фактчекает по источникам, пишет объяснения уровня преподавателя и собирает отдельный HTML-файл. |

<details>
<summary><b>Зависимости <code>anki-flash-cards</code></b> — для добавления карточек в Anki (нужно одно из двух)</summary>

<br>

- **[AnkiConnect](https://ankiweb.net/shared/info/2055492159)** ([GitHub](https://github.com/FooSoft/anki-connect)) — аддон для Anki, открывает HTTP-API на `http://127.0.0.1:8765`. Anki должен быть запущен.
- **[anki-mcp-server](https://github.com/ankimcp/anki-mcp-server)** (`@ankimcp/anki-mcp-server`, [ankimcp.ai](https://ankimcp.ai)) — MCP-сервер поверх AnkiConnect; предпочтительный способ, если подключён как MCP-инструмент.

</details>

## 🧩 Зависимые скиллы (Vue-экосистема)

`vue-review` и `vue-rureview` подключают другие скиллы, когда они применимы. Для полноценной работы установите релевантные скиллы из [skills.sh](https://www.skills.sh).

<details>
<summary>Показать список скиллов Vue-экосистемы</summary>

<br>

| Скилл | Назначение |
| --- | --- |
| **`vue`** | Встроенные компоненты Vue 3, макросы `<script setup>`, реактивность (Transition / Teleport / Suspense / KeepAlive). |
| **`vue-best-practices`** | Composition API, структура SFC, дизайн компонентов, поток данных. |
| **`vueuse-functions`** | Использование composables из VueUse. |
| **`vue-router-best-practices`** | Vue Router 4, навигационные гарды, параметры маршрутов. |
| **`pinia`** | Определение стора, паттерны state / getters / actions. |
| **`vue-testing-best-practices`** | Vitest, Vue Test Utils, паттерны тестирования компонентов. |
| **`vitest`** | Корректность тестов, моки, покрытие. |
| **`vite`** | Конфигурация Vite, плагины, сборка. |
| **`typescript-advanced-types`** | Типобезопасность, дженерики, утилитные типы. |

</details>

## 🚀 Установка

**Рекомендуемый способ** — установить скиллы из этого репозитория через CLI [skills.sh](https://www.skills.sh):

```sh
npx skills add Ionnia/agent-skills
```

После установки запустите новую сессию агента — скиллы подхватываются автоматически.

<details>
<summary>Альтернатива: скопировать вручную</summary>

<br>

Скопируйте нужные директории из `skills/` в `~/.claude/skills`. Из корня проекта:

```sh
mkdir -p ~/.claude/skills
cp -R skills/* ~/.claude/skills/
```

Команда копирует директории из `skills/` в `~/.claude/skills`, перезаписывая уже установленные версии.

</details>

<details>
<summary>Внешние зависимые скиллы</summary>

<br>

Устанавливаются через CLI [skills.sh](https://www.skills.sh):

```sh
npx skills add <owner>/<repo>
```

Найдите нужный скилл по имени на [skills.sh](https://www.skills.sh) и выполните предложенную команду `npx skills add ...`. После установки запустите новую сессию агента — и они подхватятся автоматически.

</details>
