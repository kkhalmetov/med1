# Qadam

**Каждый шаг под контролем / Әр қадам бақылауда**

Qadam — адаптивная двуязычная PWA для цифрового сопровождения пациента после выдачи протеза или ортеза. Один интерфейс объединяет ежедневные отчёты, изделия, жалобы с фотографиями, защищённый чат и рабочие кабинеты `PATIENT`, `PRACTITIONER` и `ADMIN`.

Frontend реализует весь опубликованный backend-контракт: **52 из 52 операций** и **30 из 30 схем**. Русский и казахский языки доступны во всех пользовательских сценариях.

Production: [qadamm-alpha.vercel.app](https://qadamm-alpha.vercel.app)

## Что реализовано

- отдельные защищённые кабинеты пациента, специалиста и администратора;
- авторизация, обновление сессии, выход и смена пароля через `HttpOnly` cookies;
- отчёты, жалобы, чат, изделия, справочники и CSV/PDF-файлы;
- безопасная подготовка изображений перед загрузкой;
- installable PWA без кеширования медицинских данных и API-ответов;
- same-origin Next.js BFF с allowlist, сформированным из OpenAPI;
- responsive UI от 360 px, WCAG AA и полная локализация RU/KK;
- контрактные, unit/integration, browser и accessibility-тесты.

## Быстрый старт

Требования: Node.js 24 и pnpm 11.

```powershell
corepack enable
pnpm install --frozen-lockfile
Copy-Item .env.example .env.local
pnpm dev
```

Откройте `http://localhost:3000`. Синтетические demo-аккаунты передаются команде вне Git и не должны попадать в файлы, логи или browser storage.

## Переменные окружения

| Имя                             | Где используется | Назначение                                                   |
| ------------------------------- | ---------------- | ------------------------------------------------------------ |
| `BACKEND_API_BASE_URL`          | Server only      | Базовый URL backend API для BFF                              |
| `E2E_BASE_URL`                  | Test only        | URL удалённого стенда; отключает локальный Playwright server |
| `E2E_*_EMAIL`, `E2E_*_PASSWORD` | Test only        | Опциональные синтетические live-аккаунты трёх ролей          |

Образец без секретов находится в `.env.example`. Для Vercel добавляйте только `BACKEND_API_BASE_URL`; live E2E-переменные не нужны приложению в runtime.

## Команды

| Команда                             | Назначение                                                         |
| ----------------------------------- | ------------------------------------------------------------------ |
| `pnpm dev`                          | локальный сервер разработки                                        |
| `pnpm verify`                       | lint, formatting, types, unit/integration tests и production build |
| `pnpm test:e2e`                     | Playwright для desktop/mobile и всех трёх ролей                    |
| `pnpm test:a11y`                    | accessibility-проверки axe                                         |
| `pnpm api:coverage`                 | доказательство покрытия 52 операций и 30 схем                      |
| `pnpm api:check`                    | сравнение сохранённого OpenAPI с live backend                      |
| `pnpm api:sync`                     | осознанное обновление snapshot и TypeScript-типов                  |
| `pnpm audit --audit-level=moderate` | аудит цепочки поставки                                             |

## Архитектура

```text
Browser (RU/KK PWA)
        │ same-origin /api/*
        ▼
Next.js BFF ── allowlist + HttpOnly session ──► Backend REST API
        │
        ├── generated OpenAPI types
        └── protected binary/media streaming
```

Основные каталоги:

- `src/app` — App Router, role shells и BFF routes;
- `src/features` — ролевые сценарии и API-каталог;
- `src/shared` — UI, типизированный клиент и локализация;
- `src/server` — серверная сессия, OpenAPI allowlist и proxy;
- `openapi` — зафиксированный backend-контракт;
- `tests` — unit/integration и Playwright;
- `messages` — словари русского и казахского языков.

Обоснование ключевых решений: [ADR-001](docs/decisions/0001-next-bff-http-only-pwa.md).

## Документация и выпуск

- [Продуктовая и техническая спецификация](docs/qadam-spec.md)
- [Матрица покрытия API](docs/api-coverage.md)
- [Security review](docs/security-review.md)
- [Code review](docs/code-review.md)
- [Deployment и rollback runbook](docs/deployment.md)
- [План реализации](tasks/plan.md)
- [Changelog](CHANGELOG.md)

CI запускается на каждом push и pull request: проверяет live drift OpenAPI с повторами, полный quality gate, coverage, dependency audit и Playwright. Production развёртывается на Vercel по инструкции из runbook.

## Правила изменений

1. Не добавлять секреты и реальные медицинские данные в Git.
2. При изменении backend сначала запустить `pnpm api:check`, затем осознанно обновить snapshot через `pnpm api:sync`.
3. Новая backend-операция считается завершённой только после UI, BFF, RU/KK-текстов и тестов.
4. Перед merge обязательны `pnpm verify`, `pnpm api:coverage`, `pnpm test:e2e` и audit.
5. Новые dependency build scripts требуют отдельного review и явного `true` в `allowBuilds`.
