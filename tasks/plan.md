# План реализации Qadam

Статус: `IN PROGRESS — product UX correction`
Основание: `docs/qadam-spec.md`, `docs/qadam-ux-correction-spec.md`, `docs/api-coverage.md`
Дата: 2026-07-20

## Обзор

Создать с нуля двуязычную Next.js PWA с кабинетами `PATIENT`, `PRACTITIONER` и `ADMIN`, подключить все 52 операции live Swagger через same-origin BFF, покрыть критическую логику тестами, провести security/accessibility/code review, запушить в `kkhalmetov/med1` и развернуть на Vercel.

## Архитектурные решения

- Next.js 16 App Router и React 19; UI и BFF живут в одном Vercel-проекте.
- JWT остаются server-only в `HttpOnly` cookies. Client вызывает только `/api/*`.
- Один typed BFF transport поддерживает GET/POST/PATCH, JSON, multipart и binary downloads; allowlist ограничивает его 52 Swagger-операциями.
- Сохранённый OpenAPI snapshot генерирует TypeScript-типы и сравнивается с live схемой contract-check командой.
- TanStack Query управляет API state; формы используют React Hook Form + Zod.
- `next-intl` обеспечивает `/ru` и `/kk`; raw enum-коды не выводятся.
- Service Worker кэширует только static app shell. API, auth и protected media всегда `no-store`.
- Demo credentials приходят только через локальные/Vercel environment variables и никогда не записываются в Git.

## Dependency graph

```text
Repository + runtime scaffold
  ├─ Tooling/test harness
  ├─ OpenAPI snapshot → generated types/runtime schemas
  ├─ Design tokens + i18n
  └─ PWA shell
       ↓
BFF transport + cookie session + protected media
       ↓
Login/session/role guards
       ↓
Patient shell ─┬─ reports ─┬─ practitioner report workflow
               ├─ devices ─┼─ practitioner dispense workflow
               ├─ complaints ─ practitioner review workflow
               └─ chat ───── practitioner chat workflow
                              ↓
Admin registries and exports
       ↓
52-operation contract audit → E2E → review → GitHub → Vercel
```

## Фазы и задачи

### Фаза 1 — Foundation

- [x] T01 Repository hygiene and environment contract
- [x] T02 Next.js runtime scaffold
- [x] T03 Lint, format and typecheck toolchain
- [x] T04 Unit/component/E2E test harness
- [x] T05 OpenAPI snapshot and generated API types
- [x] T06 PWA manifest, icons and safe service worker

### Checkpoint A

- [x] Install, lint, typecheck, tests and production build succeed.
- [x] No secret value is tracked.
- [x] OpenAPI snapshot reports 41 paths, 52 operations and 30 schemas.

### Фаза 2 — Shared application platform

- [x] T07 Design tokens and accessible primitives
- [x] T08 Russian/Kazakh routing and translation contract
- [x] T09 Typed client, runtime validation and Query provider
- [x] T10 Allowlisted BFF transport and token refresh
- [x] T11 Protected media and binary downloads
- [ ] T12 Auth endpoints, login and password workflow
- [x] T13 Role guards and three application shells

### Checkpoint B

- [ ] All three roles can authenticate and reach only their shell.
- [ ] Refresh/logout/password flows pass integration tests.
- [x] JSON, multipart, media and downloads pass BFF tests.

### Фаза 3 — Patient vertical slices

- [x] T14 Patient dashboard and editable profile
- [x] T15 Daily reports and report history
- [x] T16 Patient devices and dispense details
- [x] T17 Complaint creation, compression and history
- [x] T18 Patient chat and unread polling

### Checkpoint C

- [ ] Patient live flow covers every patient-owned Swagger operation.
- [x] Mobile navigation works at 360 px in both locales.

### Фаза 4 — Practitioner vertical slices

- [x] T19 Practitioner dashboard and patient registry
- [x] T20 Practitioner profile and patient registration
- [x] T21 Patient detail and status history
- [x] T22 Report triage, check and PDF export
- [x] T23 Complaint triage, review and PDF export
- [x] T24 Practitioner chat and unread overview
- [x] T25 Device catalog creation and dispensing

### Checkpoint D

- [ ] Practitioner live flow covers every practitioner Swagger operation.
- [x] RED/YELLOW/GREEN prioritization and accessible status labels work.

### Фаза 5 — Admin vertical slices

- [x] T26 Admin dashboard and qualification registry
- [x] T27 Organization registry
- [x] T28 Practitioner registry, registration and CSV export
- [x] T29 Admin device catalog
- [x] T30 Patient CSV export and dispense lookup

### Checkpoint E

- [ ] Admin live flow covers every admin Swagger operation.
- [x] CSV downloads and multipart practitioner registration are contract-tested.

### Фаза 6 — Completion and release

- [x] T31 Full 52-operation contract coverage audit
- [x] T32 Translation, accessibility and responsive audit
- [x] T33 Patient E2E suite
- [x] T34 Practitioner E2E suite
- [x] T35 Admin E2E suite
- [x] T36 Security and code-quality review
- [x] T37 Documentation, CI and release configuration
- [x] T38 GitHub push and Vercel production deployment

### Checkpoint F

- [x] `pnpm verify` and all Playwright suites pass.
- [x] All 52 rows in `docs/api-coverage.md` are `✅`.
- [x] No high/critical security, accessibility or review findings remain.
- [x] GitHub `main` and Vercel production match the verified commit.

### Фаза 7 — Исправление продуктового UX

- [x] T39 Зафиксировать требования production-ревью и регрессионные тесты
- [x] T40 Исправить лендинг, вход, смену пароля и patient dashboard
- [x] T41 Заменить patient workbench на предметные сценарии
- [x] T42 Заменить practitioner workbench на реестры, карточки и рабочие очереди
- [x] T43 Заменить admin workbench на реестры, карточки и формы
- [x] T44 Повторно проверить 52/52, RU/KK, responsive и accessibility
- [ ] T45 Code review, push и Vercel production deployment

### Checkpoint G

- [x] На ролевых экранах нет `GET/POST/PATCH`, operationId, raw JSON и ручного запуска endpoint.
- [x] Все 52 backend-операции доступны через предметные пользовательские сценарии.
- [x] Все восемь пунктов production-ревью исправлены и покрыты тестами.
- [ ] GitHub `main` и Vercel production содержат один verified commit.

## Verification strategy

- After every task: focused unit/component/integration test plus typecheck for touched area.
- After every checkpoint: `pnpm verify` and production build.
- After role completion: live smoke with the corresponding synthetic account.
- Before release: all three Playwright role suites, Lighthouse/accessibility pass, secret scan, code review, clean Git status.

## Риски и меры

| Риск | Влияние | Мера |
|---|---|---|
| Live backend changes | High | Stored snapshot, generated types and drift check before release |
| Auth refresh loops | High | Exactly one refresh attempt, cookie clearing and dedicated tests |
| Generic proxy becomes too broad | High | Explicit method/path/query allowlist derived from Swagger |
| Large photo uploads | Medium | Type/size/count validation, resize/compression, preserved form on error |
| No pagination | Medium | Local filters for current API; no invented pagination contract |
| Polling overload | Medium | Active-screen polling only, hidden/offline pause and backoff |
| Credentials leak | High | Environment variables only, ignored local file, secret scan before commit |
| Three-role scope | High | Vertical role slices and mandatory endpoint matrix checkpoints |

## Open questions

Нет. Product decisions and test accounts are available; credential values remain outside version control.
