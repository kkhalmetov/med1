# Qadam: deployment и rollback runbook

## Цель

Этот runbook воспроизводимо публикует проверенный commit `main` в Vercel Production. Frontend не содержит demo-credentials; backend URL задаётся как server-only environment variable.

## Предварительные условия

- доступ к `kkhalmetov/med1` и Vercel team/project;
- Node.js 24, pnpm 11 и актуальный Vercel CLI;
- backend отвечает на сохранённый OpenAPI contract;
- Git working tree чистый, нужный commit находится в `origin/main`.

## Release gate

В корне репозитория:

```powershell
pnpm install --frozen-lockfile
pnpm api:check
pnpm api:coverage
pnpm verify
pnpm test:e2e
pnpm audit --audit-level=moderate
```

Ожидаемый результат: 52/52 operations, 30/30 schemas, все обязательные тесты зелёные, live-тесты проходят при переданных синтетических `E2E_*` переменных.

## Первая привязка Vercel

1. Авторизоваться: `vercel login`.
2. Из корня выполнить `vercel link` и выбрать/создать проект `qadamm`.
3. В Vercel Project Settings → Environment Variables добавить для Production, Preview и Development:

   ```text
   BACKEND_API_BASE_URL=<backend API base URL>
   ```

4. Не добавлять `E2E_*` в runtime без отдельной необходимости: это только test credentials.

Файл `.vercel/` содержит локальную связь с team/project, не является конфигурацией приложения и исключён из Git.

## Production deployment

```powershell
vercel deploy --prod
```

CLI должен вернуть production deployment URL. Vercel автоматически определяет Next.js; `vercel.json` фиксирует framework, region и build/install commands.

Текущий production alias: `https://qadamm-alpha.vercel.app`.

## Проверка после деплоя

В первые 15 минут:

1. Открыть `/ru` и `/kk`; проверить 200, переключение языка, manifest и service worker.
2. Проверить отсутствие console errors и horizontal overflow на 360 px.
3. Выполнить login/logout для каждого синтетического аккаунта и убедиться, что роль попадает только в свой shell.
4. Для каждой роли выполнить один write-flow и один download/media-flow.
5. Проверить Vercel Functions logs: нет новых 5xx, токенов или credentials в записях.
6. Запустить remote smoke:

   ```powershell
   $env:E2E_BASE_URL='https://<production-domain>'
   pnpm test:e2e
   ```

При заданном `E2E_BASE_URL` Playwright не запускает локальный server. Live backend suite читает секреты только из process environment и отключает trace, video и screenshot.

## Наблюдаемость

- availability: Vercel deployment status и ручной 200-check `/ru`/`/kk`;
- frontend: browser console и Playwright smoke;
- BFF: Vercel Functions logs по status/path без request body и cookies;
- contract: обязательный `api:check` в GitHub Actions;
- accessibility: axe-suite в Playwright.

Backend outage должен возвращать контролируемый `503` без stack trace. Диагностика backend выполняется владельцем backend по его логам.

## Rollback

Триггеры: security-инцидент, повреждение данных, новые 5xx, невозможность войти или выполнить критичный role-flow.

1. Немедленно определить последний рабочий deployment в Vercel.
2. Выполнить `vercel rollback <deployment-url-or-id>` или выбрать **Promote to Production** у рабочего deployment в Dashboard.
3. Проверить `/ru`, `/kk`, login и один критичный flow.
4. Если дефект в коде — сделать обычный `git revert <commit>`, прогнать release gate и push; не переписывать историю `main`.
5. Зафиксировать причину и последующее исправление в changelog/review.

Rollback не требует миграции данных: Qadam frontend не владеет базой данных и не выполняет schema migrations.

## Управление конфигурацией

- изменение `BACKEND_API_BASE_URL` требует redeploy;
- demo-credentials ротируются вне Git и Vercel runtime;
- snapshot `openapi/qadam.json` обновляется только через `pnpm api:sync` после review backend drift;
- production и `origin/main` должны указывать на один проверенный commit.
