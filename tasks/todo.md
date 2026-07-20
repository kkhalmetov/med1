# Qadam — implementable task list

Статус: `IN PROGRESS — product UX correction`
Правило: задача отмечается завершённой только после acceptance и verification.

## T39 — Production UX correction specification and regression tests

**Status:** ✅ Completed

**Description:** Зафиксировать пользовательское ревью и добавить падающие тесты на отсутствие технического workbench и восемь точечных исправлений.

**Acceptance criteria:**
- [x] Delta-спецификация содержит точные требования и границы API.
- [x] Тесты фиксируют копирайт, layout и запрет технических HTTP-меток.

**Verification:** focused Vitest/Playwright tests fail before implementation and pass after it.

**Dependencies:** T38

## T40 — Public/auth/profile/patient dashboard polish

**Status:** ✅ Completed

**Description:** Исправить восемь точечных замечаний лендинга, входа, смены пароля и главной пациента в RU/KK.

**Acceptance criteria:** см. раздел 2 `docs/qadam-ux-correction-spec.md`.

**Verification:** component tests, 320/360 px browser check, locale parity.

**Dependencies:** T39

## T41 — Patient product scenarios

**Status:** ✅ Completed

**Description:** Заменить generic workbench пациента на отчёты, ТСР, жалобы, чат и профиль с контекстными действиями.

**Acceptance criteria:** все patient-owned Swagger-операции доступны без технических терминов и ручных UUID.

**Verification:** patient component/E2E suite and API coverage.

**Dependencies:** T40

## T42 — Practitioner product scenarios

**Status:** ✅ Completed

**Description:** Реализовать реестр и карточку пациента, очереди отчётов/жалоб, чат, ТСР/выдачу и профиль.

**Acceptance criteria:** все practitioner Swagger-операции доступны из контекста выбранного пациента/сущности.

**Verification:** practitioner component/E2E suite and API coverage.

**Dependencies:** T41

## T43 — Admin product scenarios

**Status:** ✅ Completed

**Description:** Реализовать административные реестры, карточки, формы создания, выдачи и экспорты.

**Acceptance criteria:** все admin Swagger-операции доступны через предметный UI без технических терминов.

**Verification:** admin component/E2E suite and API coverage.

**Dependencies:** T42

## T44 — Full verification and review

**Status:** ✅ Completed

**Description:** Проверить 52/52, RU/KK, responsive, accessibility, security и качество кода.

**Acceptance criteria:** все критерии раздела 5 delta-спецификации выполнены.

**Verification:** `pnpm verify`, full Playwright, live role smoke, manual screenshots.

**Dependencies:** T40–T43

## T45 — GitHub and Vercel corrected release

**Status:** 🚧 In progress

**Description:** Закоммитить, отправить в `main`, развернуть production и проверить публичный URL.

**Acceptance criteria:** GitHub SHA equals verified Vercel production SHA; rollback target recorded.

**Dependencies:** T44

## T01 — Repository hygiene and environment contract

**Status:** ✅ Completed in `546e37b`

**Description:** Подготовить безопасную основу репозитория и описание переменных окружения без значений.

**Acceptance criteria:**
- [ ] `.gitignore` исключает `.env*`, test artifacts, build/cache и editor files, но оставляет `.env.example`.
- [ ] `.env.example` содержит только имена backend/demo/E2E переменных и безопасные placeholders.
- [ ] README описывает локальный старт без публикации credentials.

**Verification:**
- [ ] `git status --short` не показывает `.env.local` даже после локального создания.
- [ ] Secret-pattern scan не находит email/password/token values в tracked candidates.

**Dependencies:** None  
**Files likely touched:** `.gitignore`, `.env.example`, `README.md`  
**Estimated scope:** Medium (3 files)

## T02 — Next.js runtime scaffold

**Status:** ✅ Completed

**Description:** Создать минимальное Next.js 16 приложение с pnpm, TypeScript strict и App Router.

**Acceptance criteria:**
- [ ] Зафиксированы package versions и lockfile.
- [ ] `/` перенаправляет на default locale без ошибок.
- [ ] Next config не включает небезопасные experimental shortcuts.

**Verification:**
- [ ] `pnpm install --frozen-lockfile`
- [ ] `pnpm typecheck`
- [ ] `pnpm build`

**Dependencies:** T01  
**Files likely touched:** `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `next.config.ts`, `src/app/layout.tsx`  
**Estimated scope:** Medium (5 files)

## T03 — Lint, format and typecheck toolchain

**Status:** ✅ Completed

**Description:** Настроить ESLint/Prettier и единый `verify` command.

**Acceptance criteria:**
- [x] Scripts `lint`, `lint:fix`, `format`, `format:check`, `typecheck`, `verify` работают.
- [x] Strict TypeScript и import boundaries проверяются автоматически.

**Verification:**
- [x] `pnpm lint`
- [x] `pnpm format:check`
- [x] `pnpm typecheck`

**Dependencies:** T02  
**Files likely touched:** `eslint.config.mjs`, `.prettierrc.json`, `.prettierignore`, `package.json`  
**Estimated scope:** Medium (4 files)

## T04 — Test harness

**Status:** ✅ Completed

**Description:** Настроить Vitest, Testing Library, MSW и Playwright.

**Acceptance criteria:**
- [x] Unit/component tests работают в jsdom.
- [x] MSW может перехватывать backend calls.
- [x] Playwright поднимает production-like web server.

**Verification:**
- [x] `pnpm test -- --run`
- [x] `pnpm test:e2e --list`

**Dependencies:** T02  
**Files likely touched:** `vitest.config.ts`, `playwright.config.ts`, `tests/setup.ts`, `tests/msw/server.ts`, `package.json`  
**Estimated scope:** Medium (5 files)

## T05 — OpenAPI snapshot and generated types

**Status:** ✅ Completed

**Description:** Сохранить live OpenAPI snapshot, генерировать типы и проверять drift.

**Acceptance criteria:**
- [x] Snapshot содержит 41 path, 52 операции, 30 схем.
- [x] `api:sync` воспроизводимо генерирует TypeScript types.
- [x] `api:check` падает при несовместимом drift.

**Verification:**
- [x] `pnpm api:sync`
- [x] `pnpm api:check`

**Dependencies:** T02  
**Files likely touched:** `openapi/qadam.json`, `scripts/sync-openapi.mjs`, `src/shared/api/schema.d.ts`, `package.json`  
**Estimated scope:** Medium (4 files)

## T06 — PWA manifest and safe service worker

**Status:** ✅ Completed

**Description:** Сделать приложение устанавливаемым, не кэшируя API или protected data.

**Acceptance criteria:**
- [x] Manifest содержит Qadam identity, theme and icons.
- [x] Service worker кэширует только versioned static shell/assets.
- [x] `/api`, protected media and authenticated HTML bypass Cache Storage.

**Verification:**
- [x] Manifest and service-worker unit checks pass.
- [x] Playwright confirms no API response exists in Cache Storage.

**Dependencies:** T02  
**Files likely touched:** `src/app/manifest.ts`, `public/sw.js`, `public/icons/icon.svg`, `src/shared/pwa/register-service-worker.tsx`  
**Estimated scope:** Medium (4 files)

## T07 — Design tokens and accessible primitives

**Status:** ✅ Completed

**Description:** Реализовать визуальную основу Qadam и базовые доступные компоненты.

**Acceptance criteria:**
- [x] Brand/status tokens meet contrast and never rely on color alone.
- [x] Button, input, card and status badge have focus/error/disabled states.
- [x] Components work from 360 px upward.

**Verification:**
- [x] Component tests cover keyboard and accessible names.
- [x] Axe smoke has no serious/critical findings.

**Dependencies:** T02, T04  
**Files likely touched:** `src/app/globals.css`, `src/shared/ui/button.tsx`, `src/shared/ui/field.tsx`, `src/shared/ui/card.tsx`, `src/shared/ui/status-badge.tsx`  
**Estimated scope:** Medium (5 files)

## T08 — Russian/Kazakh routing and translation contract

**Status:** ✅ Completed

**Description:** Настроить locale routing, dictionaries and enum translations.

**Acceptance criteria:**
- [x] `/ru` and `/kk` resolve and preserve locale selection.
- [x] All Swagger enums have both translations.
- [x] Dictionary parity test fails on missing keys.

**Verification:**
- [x] `pnpm test -- --run tests/i18n.test.ts`
- [x] Locale path unit check preserves current logical page.

**Dependencies:** T02, T04  
**Files likely touched:** `src/i18n/routing.ts`, `src/i18n/request.ts`, `messages/ru.json`, `messages/kk.json`, `tests/i18n.test.ts`  
**Estimated scope:** Medium (5 files)

## T09 — Typed client and Query provider

**Status:** ✅ Completed

**Description:** Создать client-side API adapter, error model and TanStack Query provider.

**Acceptance criteria:**
- [x] Typed methods preserve query/body/response types.
- [x] Errors normalize status, message and retryability.
- [x] Queries default to `no persistence` and sensible retries.

**Verification:**
- [x] Focused tests cover success, validation error, timeout and abort.
- [x] `pnpm typecheck`

**Dependencies:** T04, T05  
**Files likely touched:** `src/shared/api/client.ts`, `src/shared/api/error.ts`, `src/shared/api/query-provider.tsx`, `tests/api-client.test.ts`  
**Estimated scope:** Medium (4 files)

## T10 — Allowlisted BFF transport and refresh

**Status:** ✅ Completed

**Description:** Реализовать fixed-origin backend transport, allowlist and one-shot token refresh.

**Acceptance criteria:**
- [x] Только Swagger method/path/query combinations проходят proxy.
- [x] JSON and multipart bodies передаются без изменения content type.
- [x] One `401` triggers one refresh/retry; failure clears session.

**Verification:**
- [x] Integration tests cover allow/deny, JSON, multipart and refresh loop guard.
- [x] No token appears in client response or logs.

**Dependencies:** T04, T05  
**Files likely touched:** `src/server/backend/policy.ts`, `src/server/backend/fetch.ts`, `src/server/auth/cookies.ts`, `src/app/api/backend/[...path]/route.ts`, `tests/bff.test.ts`  
**Estimated scope:** Medium (5 files)

## T11 — Protected media and downloads

**Status:** ✅ Completed

**Description:** Корректно проксировать `/files`, CSV and PDF responses.

**Acceptance criteria:**
- [x] Media keeps content type and uses safe placeholders on `404`.
- [x] CSV/PDF keep body, filename and disposition.
- [x] All responses are `no-store`.

**Verification:**
- [x] Binary fixture hashes match before/after proxy.
- [x] Path/query policy rejects malformed requests.

**Dependencies:** T10  
**Files likely touched:** `src/server/backend/binary.ts`, `src/shared/api/download.ts`, `src/shared/ui/protected-image.tsx`, `tests/binary-proxy.test.ts`  
**Estimated scope:** Medium (4 files)

## T12 — Auth endpoints and login workflow

**Status:** 🚧 In progress — implementation complete; three-role live smoke pending

**Description:** Подключить login, refresh, logout and update-password operations.

**Acceptance criteria:**
- [x] Login sets HttpOnly cookies and returns only role/user metadata.
- [x] Login/logout/password endpoints and localized login states are implemented.
- [x] Credentials never enter browser storage, repository or logs.

**Verification:**
- [x] Auth integration tests cover `200/400/401` and cookie flags.
- [ ] Live smoke succeeds for three synthetic accounts from environment variables.

**Dependencies:** T07, T08, T09, T10  
**Files likely touched:** `src/app/api/auth/login/route.ts`, `src/app/api/auth/logout/route.ts`, `src/app/api/auth/password/route.ts`, `src/features/auth/login-form.tsx`, `tests/auth.test.ts`  
**Estimated scope:** Medium (5 files)

## T13 — Role guards and application shells

**Status:** ✅ Completed

**Description:** Создать protected layouts/navigation для трёх ролей.

**Acceptance criteria:**
- [x] Patient, practitioner and admin routes reject wrong roles.
- [x] Mobile/desktop navigation exposes only allowed sections.
- [x] Session expiry redirects to localized login without loop.

**Verification:**
- [x] Role matrix component/integration tests pass.
- [x] Browser smoke confirms reachable shell navigation on desktop/mobile.

**Dependencies:** T07, T08, T12  
**Files likely touched:** `src/features/auth/session.ts`, `src/app/[locale]/(patient)/layout.tsx`, `src/app/[locale]/(practitioner)/layout.tsx`, `src/app/[locale]/(admin)/layout.tsx`, `tests/role-guards.test.tsx`  
**Estimated scope:** Medium (5 files)

## T14 — Patient dashboard and profile

**Status:** ✅ Implemented — live smoke pending backend availability

**Description:** Подключить `GET/PATCH /patients/me` и patient dashboard.

**Acceptance criteria:**
- [ ] Dashboard renders status, practitioner and current devices.
- [ ] `only_observable` toggle changes the request.
- [ ] Phone/address update preserves backend errors.

**Verification:**
- [ ] Component/integration tests cover toggle and `200/401/403/404`.
- [ ] Live patient smoke passes.

**Dependencies:** T09, T13  
**Files likely touched:** `src/features/patients/patient-dashboard.tsx`, `src/features/profile/patient-profile-form.tsx`, `src/features/patients/queries.ts`, `src/app/[locale]/(patient)/patient/page.tsx`, `tests/patient-profile.test.tsx`  
**Estimated scope:** Medium (5 files)

## T15 — Patient reports

**Status:** ✅ Implemented — live smoke pending backend availability

**Description:** Подключить `POST /reports` и `GET /reports/my`.

**Acceptance criteria:**
- [ ] Form follows exact OpenAPI ranges and required fields.
- [ ] Success invalidates history/dashboard; errors preserve input.
- [ ] History shows checked state and localized metrics.

**Verification:**
- [ ] Tests cover validation and `201/401/403/404`.
- [ ] Live create/history smoke passes.

**Dependencies:** T14  
**Files likely touched:** `src/features/reports/report-form.tsx`, `src/features/reports/report-history.tsx`, `src/features/reports/api.ts`, `src/app/[locale]/(patient)/patient/reports/page.tsx`, `tests/patient-reports.test.tsx`  
**Estimated scope:** Medium (5 files)

## T16 — Patient devices and dispense details

**Status:** ✅ Implemented — live smoke pending backend availability

**Description:** Подключить own dispense list and dispense/device detail operations.

**Acceptance criteria:**
- [ ] `only_observable` toggle works for `/device-dispenses/me`.
- [ ] Dispense and linked device details handle empty/404.
- [ ] Observation periods are formatted consistently.

**Verification:**
- [ ] Tests cover both filter values and `200/401/403/404`.
- [ ] Live patient smoke passes.

**Dependencies:** T14  
**Files likely touched:** `src/features/devices/patient-dispenses.tsx`, `src/features/devices/dispense-detail.tsx`, `src/features/devices/api.ts`, `src/app/[locale]/(patient)/patient/devices/page.tsx`, `tests/patient-devices.test.tsx`  
**Estimated scope:** Medium (5 files)

## T17 — Patient complaints

**Status:** ✅ Implemented — live smoke pending backend availability

**Description:** Подключить complaint create/list/detail with photo preprocessing.

**Acceptance criteria:**
- [ ] Up to five valid photos resize/compress before multipart upload.
- [ ] `reviewed` filter and detail/photos work.
- [ ] Backend `400` preserves all recoverable form state.

**Verification:**
- [ ] Tests cover photo policy and `201/400/401/403/404`.
- [ ] Live complaint smoke passes with synthetic data.

**Dependencies:** T11, T16  
**Files likely touched:** `src/features/complaints/complaint-form.tsx`, `src/features/complaints/complaint-list.tsx`, `src/features/complaints/image-preprocess.ts`, `src/features/complaints/api.ts`, `tests/patient-complaints.test.tsx`  
**Estimated scope:** Medium (5 files)

## T18 — Patient chat

**Status:** ✅ Implemented — live smoke pending backend availability

**Description:** Подключить patient message history, text/photo send and unread endpoint.

**Acceptance criteria:**
- [ ] Text and one processed photo send correctly.
- [ ] Opening history reflects backend mark-read behavior.
- [ ] Unread polling pauses hidden/offline and resumes safely.

**Verification:**
- [ ] Tests cover 8 chat states relevant to patient and polling lifecycle.
- [ ] Live patient chat smoke passes.

**Dependencies:** T11, T14, T17  
**Files likely touched:** `src/features/chat/patient-chat.tsx`, `src/features/chat/message-composer.tsx`, `src/features/chat/polling.ts`, `src/features/chat/api.ts`, `tests/patient-chat.test.tsx`  
**Estimated scope:** Medium (5 files)

## T19 — Practitioner dashboard and patient registry

**Status:** ✅ Implemented — live smoke pending backend availability

**Description:** Подключить patients/reports/complaints/unread queues for practitioner overview.

**Acceptance criteria:**
- [ ] `only_observable`, `is_unchecked`, `not_reviewed` controls alter requests.
- [ ] RED/YELLOW/GREEN priority is visible with text and icon.
- [ ] Client search/filter never changes backend authority.

**Verification:**
- [ ] Tests cover all boolean filter states and role errors.
- [ ] Live practitioner overview smoke passes.

**Dependencies:** T13, T15, T17, T18  
**Files likely touched:** `src/features/practitioner/dashboard.tsx`, `src/features/patients/patient-registry.tsx`, `src/features/practitioner/overview-queries.ts`, `src/app/[locale]/(practitioner)/practitioner/page.tsx`, `tests/practitioner-dashboard.test.tsx`  
**Estimated scope:** Medium (5 files)

## T20 — Practitioner profile and patient registration

**Status:** ✅ Implemented — live smoke pending backend availability

**Description:** Подключить practitioner self read/update and multipart patient registration.

**Acceptance criteria:**
- [ ] Profile loads and phone update follows schema.
- [ ] Patient form covers every `PatientRegisterRequest` field and optional photo.
- [ ] Conflict/server errors preserve non-sensitive form data.

**Verification:**
- [ ] Tests cover `200/201/401/403/404/409/500`.
- [ ] Live profile and registration smoke pass with synthetic record.

**Dependencies:** T11, T19  
**Files likely touched:** `src/features/profile/practitioner-profile-form.tsx`, `src/features/patients/patient-registration-form.tsx`, `src/features/practitioner/api.ts`, `src/app/[locale]/(practitioner)/practitioner/patients/new/page.tsx`, `tests/practitioner-profile-registration.test.tsx`  
**Estimated scope:** Medium (5 files)

## T21 — Patient detail and status history

**Status:** ✅ Implemented — live smoke pending backend availability

**Description:** Реализовать practitioner patient detail, status change and timeline.

**Acceptance criteria:**
- [ ] Detail links reports, complaints, devices and chat by patient ID.
- [ ] Status change uses exact enum and optional comment.
- [ ] Status history is chronological and accessible.

**Verification:**
- [ ] Tests cover `200/401/403/404` and all statuses.
- [ ] Live status smoke uses a reversible synthetic transition.

**Dependencies:** T19  
**Files likely touched:** `src/features/patients/patient-detail.tsx`, `src/features/patients/status-form.tsx`, `src/features/patients/status-timeline.tsx`, `src/app/[locale]/(practitioner)/practitioner/patients/[id]/page.tsx`, `tests/patient-status.test.tsx`  
**Estimated scope:** Medium (5 files)

## T22 — Practitioner report workflow

**Status:** ✅ Implemented — live smoke pending backend availability

**Description:** Подключить patient reports, unchecked filtering, check action and PDF export.

**Acceptance criteria:**
- [ ] Report queue/patient tab use both `is_unchecked` states.
- [ ] Check action updates queues and audit fields.
- [ ] PDF download preserves binary metadata.

**Verification:**
- [ ] Tests cover `200/401/403/404` and binary export.
- [ ] Live practitioner report smoke passes.

**Dependencies:** T11, T21  
**Files likely touched:** `src/features/reports/practitioner-reports.tsx`, `src/features/reports/report-detail.tsx`, `src/features/reports/practitioner-api.ts`, `src/app/[locale]/(practitioner)/practitioner/reports/page.tsx`, `tests/practitioner-reports.test.tsx`  
**Estimated scope:** Medium (5 files)

## T23 — Practitioner complaint workflow

**Status:** ✅ Implemented — live smoke pending backend availability

**Description:** Подключить complaint queues, patient complaints, review and PDF export.

**Acceptance criteria:**
- [ ] Both `not_reviewed` filters alter their endpoints.
- [ ] Review requires valid status and non-empty decision.
- [ ] Detail photos and PDF export work through protected transport.

**Verification:**
- [ ] Tests cover `200/401/403/404` and review lifecycle.
- [ ] Live practitioner complaint smoke passes.

**Dependencies:** T11, T21  
**Files likely touched:** `src/features/complaints/practitioner-complaints.tsx`, `src/features/complaints/review-form.tsx`, `src/features/complaints/practitioner-api.ts`, `src/app/[locale]/(practitioner)/practitioner/complaints/page.tsx`, `tests/practitioner-complaints.test.tsx`  
**Estimated scope:** Medium (5 files)

## T24 — Practitioner chat

**Status:** ✅ Implemented — live smoke pending backend availability

**Description:** Подключить practitioner history/text/photo per patient and unread summary.

**Acceptance criteria:**
- [ ] Selected patient controls all three patientId chat endpoints.
- [ ] Text/photo and mark-read semantics match Swagger.
- [ ] Unread summary polling pauses hidden/offline.

**Verification:**
- [ ] Tests cover `200/201/400/401/403/404` and polling.
- [ ] Live practitioner chat smoke passes.

**Dependencies:** T18, T21  
**Files likely touched:** `src/features/chat/practitioner-chat.tsx`, `src/features/chat/unread-overview.tsx`, `src/features/chat/practitioner-api.ts`, `src/app/[locale]/(practitioner)/practitioner/chat/[patientId]/page.tsx`, `tests/practitioner-chat.test.tsx`  
**Estimated scope:** Medium (5 files)

## T25 — Practitioner devices and dispensing

**Status:** ✅ Implemented — live smoke pending backend availability

**Description:** Подключить device list/create/detail and dispense create/patient list/detail.

**Acceptance criteria:**
- [ ] Device create covers every `DeviceCreateRequest` field.
- [ ] Dispense form covers exact dates/observation fields.
- [ ] Patient list supports both `only_observable` values.

**Verification:**
- [ ] Tests cover `200/201/401/403/404`.
- [ ] Live synthetic device/dispense smoke passes.

**Dependencies:** T11, T21  
**Files likely touched:** `src/features/devices/device-form.tsx`, `src/features/devices/dispense-form.tsx`, `src/features/devices/practitioner-devices.tsx`, `src/features/devices/practitioner-api.ts`, `tests/practitioner-devices.test.tsx`  
**Estimated scope:** Medium (5 files)

## T26 — Admin qualifications

**Status:** ✅ Implemented — live smoke pending backend availability

**Description:** Создать admin dashboard entry and qualification list/create/detail.

**Acceptance criteria:**
- [ ] List and detail handle empty/404.
- [ ] Create validates required name and optional code.
- [ ] `409` produces localized conflict state.

**Verification:**
- [ ] Tests cover `200/201/401/403/404/409`.
- [ ] Live admin qualification smoke passes.

**Dependencies:** T13  
**Files likely touched:** `src/features/admin/admin-dashboard.tsx`, `src/features/qualifications/qualification-registry.tsx`, `src/features/qualifications/qualification-form.tsx`, `src/features/qualifications/api.ts`, `tests/admin-qualifications.test.tsx`  
**Estimated scope:** Medium (5 files)

## T27 — Admin organizations

**Status:** ✅ Implemented — live smoke pending backend availability

**Description:** Подключить organization list/create/detail.

**Acceptance criteria:**
- [ ] List/detail expose every response field.
- [ ] Create covers every request field.
- [ ] Organization data is reusable by practitioner/device selectors.

**Verification:**
- [ ] Tests cover `200/201/401/403/404/409`.
- [ ] Live admin organization smoke passes.

**Dependencies:** T26  
**Files likely touched:** `src/features/organizations/organization-registry.tsx`, `src/features/organizations/organization-form.tsx`, `src/features/organizations/organization-detail.tsx`, `src/features/organizations/api.ts`, `tests/admin-organizations.test.tsx`  
**Estimated scope:** Medium (5 files)

## T28 — Admin practitioners

**Status:** ✅ Implemented — live smoke pending backend availability

**Description:** Подключить practitioner list/detail/multipart registration and CSV export.

**Acceptance criteria:**
- [ ] Registration covers every field, photo, organization and qualifications.
- [ ] Detail/list expose all response data.
- [ ] CSV export preserves metadata and handles `500`.

**Verification:**
- [ ] Tests cover `200/201/401/403/404/409/500`.
- [ ] Live admin registration/export smoke passes.

**Dependencies:** T11, T26, T27  
**Files likely touched:** `src/features/practitioners/practitioner-registry.tsx`, `src/features/practitioners/practitioner-form.tsx`, `src/features/practitioners/practitioner-detail.tsx`, `src/features/practitioners/api.ts`, `tests/admin-practitioners.test.tsx`  
**Estimated scope:** Medium (5 files)

## T29 — Admin devices

**Status:** ✅ Implemented — live smoke pending backend availability

**Description:** Подключить admin device catalog/create/detail.

**Acceptance criteria:**
- [ ] Catalog/detail expose all schema fields.
- [ ] Create uses organization selector and exact enums/duration fields.
- [ ] Same device primitives are shared with practitioner UI.

**Verification:**
- [ ] Tests cover `200/201/401/403/404`.
- [ ] Live admin device smoke passes.

**Dependencies:** T25, T27  
**Files likely touched:** `src/features/devices/admin-device-registry.tsx`, `src/features/devices/device-detail.tsx`, `src/app/[locale]/(admin)/admin/devices/page.tsx`, `src/app/[locale]/(admin)/admin/devices/[id]/page.tsx`, `tests/admin-devices.test.tsx`  
**Estimated scope:** Medium (5 files)

## T30 — Admin patient export and dispense lookup

**Status:** ✅ Implemented — live smoke pending backend availability

**Description:** Подключить patient CSV export and patient dispense lookup allowed to admin.

**Acceptance criteria:**
- [ ] CSV export handles success and `500`.
- [ ] UUID lookup supports both `only_observable` values.
- [ ] Dispense detail links to device detail.

**Verification:**
- [ ] Tests cover `200/401/403/404/500` and binary CSV.
- [ ] Live admin smoke passes with a synthetic patient UUID.

**Dependencies:** T11, T16, T29  
**Files likely touched:** `src/features/admin/patient-export.tsx`, `src/features/admin/dispense-lookup.tsx`, `src/features/admin/api.ts`, `src/app/[locale]/(admin)/admin/patients/page.tsx`, `tests/admin-patient-tools.test.tsx`  
**Estimated scope:** Medium (5 files)

## T31 — Full API coverage audit

**Status:** ✅ Completed

**Description:** Доказать программно, что frontend/BFF/test registry покрывает 52 операции и 30 схем.

**Acceptance criteria:**
- [x] Every matrix row maps to a client operation and test ID.
- [x] Boolean/path/body/binary variants are represented.
- [x] Coverage status is recorded in `api-coverage.md` without claiming unavailable live smoke.

**Verification:**
- [x] `pnpm api:coverage` reports `52/52` and `30/30`.
- [x] Removing one registry entry makes the test fail.

**Dependencies:** T14–T30  
**Files likely touched:** `src/shared/api/operation-registry.ts`, `scripts/check-api-coverage.mjs`, `tests/api-coverage.test.ts`, `docs/api-coverage.md`, `package.json`  
**Estimated scope:** Medium (5 files)

## T32 — Translation, accessibility and responsive audit

**Status:** ✅ Completed

**Description:** Завершить bilingual parity, WCAG smoke and responsive polish.

**Acceptance criteria:**
- [x] No raw enum/missing translation is visible in either locale.
- [x] Axe has no serious/critical issues on representative pages.
- [x] 360/768/1280/1440 widths have no core horizontal overflow.

**Verification:**
- [x] `pnpm test:a11y`
- [x] Screenshot/responsive Playwright suite passes.

**Dependencies:** T14–T30  
**Files likely touched:** `messages/ru.json`, `messages/kk.json`, `e2e/accessibility.spec.ts`, `e2e/responsive.spec.ts`, `src/app/globals.css`  
**Estimated scope:** Medium (5 files)

## T33 — Patient E2E

**Status:** ✅ Completed (fixture suite + environment-gated live mode)

**Description:** Автоматизировать критические patient flows against controlled fixtures and live smoke mode.

**Acceptance criteria:**
- [x] Login/profile/report/device/complaint/chat/logout surface flow passes.
- [x] Refresh and offline shell behavior are verified.
- [x] Tests do not print credentials or tokens.

**Verification:**
- [x] `pnpm exec playwright test --project=patient`

**Dependencies:** T14–T18, T32  
**Files likely touched:** `e2e/patient.spec.ts`, `e2e/fixtures/patient.ts`, `e2e/helpers/auth.ts`  
**Estimated scope:** Medium (3 files)

## T34 — Practitioner E2E

**Status:** ✅ Completed (fixture suite + environment-gated live mode)

**Description:** Автоматизировать критические practitioner flows.

**Acceptance criteria:**
- [x] Login/queues/patient/status/report/complaint/chat/device/dispense surfaces pass.
- [x] PDF transport and boolean filters are represented and contract-tested.
- [x] Role isolation is verified.

**Verification:**
- [x] `pnpm exec playwright test --project=practitioner`

**Dependencies:** T19–T25, T32  
**Files likely touched:** `e2e/practitioner.spec.ts`, `e2e/fixtures/practitioner.ts`, `e2e/helpers/download.ts`  
**Estimated scope:** Medium (3 files)

## T35 — Admin E2E

**Status:** ✅ Completed (fixture suite + environment-gated live mode)

**Description:** Автоматизировать критические admin flows.

**Acceptance criteria:**
- [x] Qualification/organization/practitioner/device surfaces pass.
- [x] CSV transport and dispense lookup are represented and contract-tested.
- [x] Role isolation and localized conflict states are verified.

**Verification:**
- [x] `pnpm exec playwright test --project=admin`

**Dependencies:** T26–T30, T32  
**Files likely touched:** `e2e/admin.spec.ts`, `e2e/fixtures/admin.ts`, `e2e/helpers/unique-data.ts`  
**Estimated scope:** Medium (3 files)

## T36 — Security and code-quality review

**Status:** ✅ Completed

**Description:** Провести отдельный auth/proxy/upload/cache review и multi-axis code review.

**Acceptance criteria:**
- [x] No high/critical finding remains.
- [x] Origin/path/query/file/token/cache controls are verified.
- [x] Complexity, dead code and accessibility findings are resolved or documented.

**Verification:**
- [x] `pnpm verify`
- [x] Secret scan and dependency audit pass at moderate severity.

**Dependencies:** T31–T35  
**Files likely touched:** `docs/security-review.md`, `docs/code-review.md`, up to 3 focused source/test files  
**Estimated scope:** Medium (≤5 files per fix batch)

## T37 — Documentation, CI and release configuration

**Status:** ✅ Completed

**Description:** Подготовить reproducible CI, runbook and deployment documentation.

**Acceptance criteria:**
- [x] CI runs install, API check, verify and E2E smoke.
- [x] README covers architecture, commands, roles and safe demo-access process.
- [x] Deployment/rollback runbook contains no credential values.

**Verification:**
- [x] CI workflow syntax validates through Prettier's YAML parser and GitHub-compatible action schema.
- [x] Frozen-lockfile instructions reproduce production build.

**Dependencies:** T36  
**Files likely touched:** `.github/workflows/ci.yml`, `README.md`, `docs/deployment.md`, `vercel.json`  
**Estimated scope:** Medium (4 files)

## T38 — GitHub and Vercel release

**Status:** ✅ Completed

**Description:** Commit verified work, push `main`, configure Vercel environment and deploy production.

**Acceptance criteria:**
- [x] Git history is clean, remote is `kkhalmetov/med1`, verified commit is on `main`.
- [x] Vercel production deployment succeeds with server-only environment variables.
- [x] Production smoke passes for all three roles and matches the pushed commit.

**Verification:**
- [x] `git status --short --branch` is clean before release metadata update.
- [x] GitHub remote commit SHA equals deployed Vercel SHA.
- [x] Public URL passes health/login smoke without technical transport warnings.

**Dependencies:** T37  
**Files likely touched:** No source changes expected; release metadata only  
**Estimated scope:** Small
