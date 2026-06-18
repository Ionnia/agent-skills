# agent-skills

Это мой личный проект, где я храню и развиваю собственные скиллы для агентов

## Скиллы

Локальные скиллы находятся в директории `skills/` и сгруппированы по категориям:

### Development (`skills/development/`)

- **general-review** — ревью кода на любом языке/фреймворке на баги и нарушения лучших практик; применяется, когда нет специализированного ревью-скилла (для Vue лучше использовать `vue-review`).
- **vue-review** — ревью кода Vue 3 (компоненты, composables, фронтенд) на баги и нарушения лучших практик.
- **vue-rureview** — то же ревью кода Vue 3, но с выводом на русском языке.

### Productivity (`skills/productivity/`)

- **calendar-management** — планирование, перенос, отмена и аудит встреч; поиск свободных слотов и защита времени для фокусной работы. Подключается, когда доступен календарный инструмент или соответствующая интеграция.

### Studying (`skills/studying/`)

- **anki-flash-cards** — создание карточек Anki с упором на прочное понимание материала, а не дословный пересказ.

  Зависимости для добавления карточек в Anki (одно из двух):
  - [AnkiConnect](https://ankiweb.net/shared/info/2055492159) ([GitHub](https://github.com/FooSoft/anki-connect)) — аддон для Anki, открывает HTTP-API на `http://127.0.0.1:8765`. Anki должен быть запущен.
  - [anki-mcp-server](https://github.com/ankimcp/anki-mcp-server) (`@ankimcp/anki-mcp-server`, [ankimcp.ai](https://ankimcp.ai)) — MCP-сервер поверх AnkiConnect; предпочтительный способ, если подключён как MCP-инструмент.

- **write-conspect** — написание конспекта (study notes) по теме или материалам пользователя: планирует структуру, пишет объяснения уровня преподавателя и формирует итоговый отдельный HTML-файл.

## Зависимые скиллы

`vue-review` и `vue-rureview` подключают другие скиллы, когда они применимы. Для полноценной работы установите релевантные скиллы из [skills.sh](https://www.skills.sh):

- `vue` — встроенные компоненты Vue 3, макросы `<script setup>`, реактивность (Transition/Teleport/Suspense/KeepAlive)
- `vue-best-practices` — Composition API, структура SFC, дизайн компонентов, поток данных
- `vueuse-functions` — использование composables из VueUse
- `vue-router-best-practices` — Vue Router 4, навигационные гарды, параметры маршрутов
- `pinia` — определение стора, паттерны state/getters/actions
- `vue-testing-best-practices` — Vitest, Vue Test Utils, паттерны тестирования компонентов
- `vitest` — корректность тестов, моки, покрытие
- `vite` — конфигурация Vite, плагины, сборка
- `typescript-advanced-types` — типобезопасность, дженерики, утилитные типы

### Установка

Рекомендуемый способ — установить скиллы из этого репозитория через CLI [skills.sh](https://www.skills.sh):

```sh
npx skills add Ionnia/agent-skills
```

После установки запустите новую сессию агента — скиллы подхватываются автоматически.

Либо скопируйте нужные директории из `skills/` в `~/.claude/skills` вручную. Из корня проекта:

```sh
mkdir -p ~/.claude/skills
cp -R skills/* ~/.claude/skills/
```

Команда копирует директории из `skills/` в `~/.claude/skills`, перезаписывая уже установленные версии.

Внешние зависимые скиллы устанавливаются через CLI [skills.sh](https://www.skills.sh):

```sh
npx skills add <owner>/<repo>
```

Найдите нужный скилл по имени на [skills.sh](https://www.skills.sh) и выполните предложенную команду `npx skills add ...`. После установки запустите новую сессию агента — и они подхватятся автоматически.
