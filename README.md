# agent-skills

Это мой личный проект для поддержки и разработки кастомных скиллов (agent skills).

Здесь я храню и развиваю собственные навыки для агента.

## Скиллы

Локальные скиллы находятся в директории `skills/`:

- **vue-review** — ревью кода Vue 3 (компоненты, composables, фронтенд) на баги и нарушения best practices.
- **vue-rureview** — то же ревью кода Vue 3, но с выводом на русском языке.

## Зависимые скиллы

`vue-review` и `vue-rureview` подключают другие скиллы, когда они применимы. Для полноценной работы установите релевантные скиллы из [skills.sh](https://www.skills.sh):

- `vue` — встроенные компоненты Vue 3, макросы `<script setup>`, реактивность (Transition/Teleport/Suspense/KeepAlive)
- `vue-best-practices` — Composition API, структура SFC, дизайн компонентов, поток данных
- `vueuse-functions` — использование composables из VueUse
- `vue-router-best-practices` — Vue Router 4, navigation guards, параметры маршрутов
- `pinia` — определение стора, паттерны state/getters/actions
- `vue-testing-best-practices` — Vitest, Vue Test Utils, паттерны тестирования компонентов
- `vitest` — корректность тестов, моки, покрытие
- `vite` — конфигурация Vite, плагины, сборка
- `typescript-advanced-types` — типобезопасность, дженерики, утилитные типы
- `web-design-guidelines` — доступность, UI best practices, семантический HTML

### Установка

Рекомендуемый способ — установить скиллы из этого репозитория через CLI [skills.sh](https://www.skills.sh):

```sh
npx skills add https://github.com/Ionnia/agent-skills
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

Найдите нужный скилл по имени на [skills.sh](https://www.skills.sh) и выполните предложенную команду `npx skills add ...`. После установки запустите новую сессию агента — скиллы подхватываются автоматически.
