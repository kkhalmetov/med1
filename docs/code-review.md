# QadamAI multi-axis code review

Дата: 2026-07-21
Объём: frontend, BFF/auth, OpenAPI contract, PWA, tests и release configuration.
Вердикт: **APPROVE для release**.

## Correctness

- Contract snapshot содержит 42 path, 53 операции и 31 схему; frontend registry покрывает 53/53 и намеренно падает при пропуске.
- Unit/integration suite покрывает allow/deny proxy policy, JSON/multipart, refresh loop guard, binary hashes, auth token boundary, translation parity, exact report ranges, upload policy и polling lifecycle.
- Controlled-browser suites покрывают обе локали, mobile/desktop shell, три роли, report/practitioner/admin mutations, role isolation и offline cache policy.
- Финальный live drift выявил и синхронизировал расширение `discomfortLevel` с `1–10` до `0–10`; после этого contract-check и регрессионный тест прошли.
- Настоящие synthetic-account login flows прошли для `PATIENT`, `PRACTITIONER` и `ADMIN` через browser → BFF → backend.

## Readability and architecture

- Browser вызывает только same-origin API; auth/session/server transport изолированы в `src/server`.
- OpenAPI form-contract остаётся источником contract-тестов required/type/enum/range, а пользовательские payload builders сгруппированы по предметным сценариям трёх ролей.
- `operation-workbench.tsx` и `workspace-page.tsx` удалены: HTTP-методы, operationId, raw JSON и ручной запуск endpoint больше не входят в user-facing bundle.
- Patient, practitioner и admin workspaces используют generated schema types, один Query adapter и общие доступные product primitives; mutations/downloads вызываются только из контекстных действий.
- Независимая `product-operation-map.ts` сопоставляет все 53 operationId с ролевым экраном/действием и проверяется против OpenAPI в CI.
- `schema.d.ts` большой, но generated и исключён из lint/format review. Role workspace files крупные из-за полного Swagger-scope; дальнейшее разбиение по bounded feature modules — optional follow-up, не release blocker.

## Security and privacy

Подробности: [`security-review.md`](./security-review.md). High/critical findings отсутствуют; audit и secret scan clean. Tokens, demo credentials и protected responses не логируются и не сохраняются в browser storage/cache.

## Performance

- TanStack Query deduplicates dashboard calls, uses 30s stale time and bounded retry only for retryable errors.
- Chat polling: 10s history / 30s unread, active only for expanded action, visible document and online browser; overlap blocked.
- Static shell is cached; medical API responses are always network-only/no-store.
- Image preprocessing caps dimensions/output before BFF buffering. Lists remain unpaginated because backend has no pagination contract.

## Accessibility and responsive behavior

- Native labels/controls, 44–48px targets, keyboard navigation, visible focus, textual+icon status semantics.
- Axe: no serious/critical findings on landing and representative patient/practitioner/admin pages.
- Horizontal-overflow suite проходит на 320, 360, 768, 1024 и 1440 px; отдельно проверены все patient routes и representative practitioner/admin registries на 360 px.
- Secondary text contrast was raised after axe found 4.08:1; current token passes WCAG AA checks.

## Deferred/non-blocking items

- Optional: split `globals.css` into cascade layers when the visual system grows.
- Optional: add server pagination once backend exposes parameters.
- Live contract и role login следует повторять перед каждым production release; CI contract gate делает drift блокирующим.

## UX correction release review

- Восемь пунктов production-ревью закреплены тестами: copy, отсутствие подчёркивания, 320 px login button, back link, пароль, ошибка входа, удаление patient toggle и заголовок ТСР.
- Все ролевые маршруты проверяют отсутствие пользовательски видимых `GET/POST/PATCH` и universal run controls.
- Report mutation E2E подтверждает payload с `discomfortLevel: 0`; live OpenAPI и snapshot задают диапазон `0–10`.
- Practitioner report check и admin qualification create выполняют реальные BFF requests в browser fixture suite.

## Short-review release review

- **Correctness:** `shortReview` подключён по live-контракту `GET /patients/{id}/short-review` для `PRACTITIONER` и `ADMIN`; success, empty, invalid payload, error/retry, refresh и 360 px покрыты browser-тестами.
- **Readability/architecture:** один feature-компонент используется в двух ролевых контекстах; generated `ShortPatientReview` остаётся типовой границей, а runtime parser отклоняет неизвестные поля типов и enum.
- **Security:** LLM-ответ рассматривается как недоверенный plain text, React-экранирование не обходится, сырые backend errors не выводятся, автоматические retry отключены.
- **Performance:** один запрос выполняется при открытии контекста пациента, повторная генерация запускается только явным действием; live latency составила менее 2 секунд.
- **Verification:** `pnpm verify` — 82/82 tests и production build; fixture Playwright — 43 passed, 4 expected skipped; live `PRACTITIONER` и `ADMIN` — `200 application/json` с полями `statusColor,review`.
- **Verdict:** APPROVE. Critical/required findings отсутствуют после добавления runtime-валидации и точечного security override.

## QadamAI brand release review

- **Correctness:** видимый бренд, metadata, manifest, SVG title, вход, ролевые кабинеты и футер согласованно используют `QadamAI`; внутренние URL, cookie и API identifiers не изменены.
- **Readability/architecture:** AI-коммуникация локализована в `landing`, UI использует существующие tokens и Lucide icons; новые зависимости и runtime-запросы не добавлены.
- **Security:** публичный текст описывает только фактические источники backend-выжимки, не выводит недоверенные данные и явно исключает диагноз и автоматическое клиническое решение.
- **Performance:** раздел серверный и статический, не добавляет JavaScript state, сетевых запросов или raster assets; responsive layout проверен на 320–1440 px.
- **Accessibility:** один именованный `section`, последовательный `ol`, декоративные иконки скрыты от accessibility tree; axe не выявил serious/critical нарушений.
- **Verification:** RED/GREEN Playwright для RU/KK; `pnpm verify` — 82/82; production Playwright — 45 passed и 4 expected skipped; desktop/mobile screenshots проверены визуально; `pnpm audit --audit-level high` — 0 findings.
- **Verdict:** APPROVE. Critical/required findings отсутствуют.
