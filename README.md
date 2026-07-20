# Qadam

**Каждый шаг под контролем / Әр қадам бақылауда**

Qadam — двуязычная PWA для сопровождения пациента после выдачи протеза или ортеза. Приложение объединяет ежедневные отчёты, изделия, жалобы с фотографиями, чат и рабочие кабинеты пациента, медицинского специалиста и администратора.

## Документы

- [Спецификация](docs/qadam-spec.md)
- [Покрытие всех 52 API-операций](docs/api-coverage.md)
- [План реализации](tasks/plan.md)
- [Задачи](tasks/todo.md)

## Локальный запуск

Требования: Node.js 22 LTS и pnpm 10.

```bash
corepack enable
pnpm install --frozen-lockfile
Copy-Item .env.example .env.local
pnpm dev
```

Откройте `http://localhost:3000`. Значения demo-аккаунтов передаются участникам отдельно и никогда не хранятся в Git.

## Проверка

```bash
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test -- --run
pnpm build
pnpm verify
```

## Backend

Контракт проверен по локальному `swagger.md` и live OpenAPI. Frontend обращается к backend только через same-origin Next.js BFF; JWT остаются в `HttpOnly` cookies.

