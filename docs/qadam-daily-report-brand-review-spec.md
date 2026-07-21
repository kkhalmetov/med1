# Qadam: дневной отчёт, Q-брендинг и проверка отчёта

Статус: `APPROVED — подтверждено командой /build-auto`

Дата: 2026-07-21

Основание: пользовательское production-ревью от 2026-07-21 и `docs/qadam-spec.md`.

## Цель

Убрать повторную отправку ежедневного отчёта из интерфейса пациента, обновить знак продукта на узнаваемую букву `Q` и восстановить документированную Swagger-операцию проверки отчёта специалистом.

## Tech stack и структура

- Next.js 16, React 19, TypeScript, TanStack Query, next-intl.
- UI: `src/features/**`, `src/shared/ui`, `src/app/globals.css`.
- BFF: `src/server/backend`, контракт `openapi/qadam.json`.
- RU/KK: `messages/*.json`; браузерные тесты: `tests/e2e`; unit/integration: `tests`.

## Команды

```bash
pnpm test -- --run
pnpm exec playwright test --project=patient --project=practitioner --project=chromium
pnpm verify
```

## Поведение

1. После загрузки `GET /reports/my` пациент может открыть форму только тогда, когда среди отчётов нет записи с `submittedAt` за текущий локальный календарный день.
2. После успешного `POST /reports` форма закрывается, история обновляется, а вместо повторной кнопки показывается подтверждение и переход к истории.
3. Главная пациента использует то же правило: до отправки предлагает заполнить отчёт, после — сообщает, что сегодняшний отчёт отправлен.
4. Ограничение относится к UX данного frontend. Swagger не документирует server-side запрет дублей; полноценная защита между разными клиентами остаётся обязанностью backend.
5. `PATCH /reports/{id}/check` отправляется без тела согласно Swagger. BFF принимает реально пустой request stream и не ошибочно отвечает `415`.
6. На публичной главной удаляется блок со щитом и текстом слогана. Остальные тексты продукта не меняются.
7. Логотип, favicon и maskable PWA icon используют один новый знак с буквой `Q`; cache version обновляется, чтобы установленная PWA не сохраняла старый знак.

## Code style

Логика календарного дня оформляется чистой типизированной функцией, а UI-текст берётся только из RU/KK словарей. API не получает недокументированное тело:

```ts
const submittedToday = reports.some((report) => isSameLocalDay(report.submittedAt, now))
```

## Testing strategy

- Unit: совпадение и несовпадение локального календарного дня.
- BFF integration: bodyless `PATCH` с пустым stream проходит allowlist и уходит в backend без тела.
- Patient E2E: сегодняшний отчёт скрывает кнопку повторной отправки; после создания форма закрывается.
- Practitioner E2E: проверка отчёта получает `200`, обновляет карточку и не показывает общую ошибку.
- Public E2E: блок со щитом отсутствует, а brand image и metadata ссылаются на новый Q-icon.

## Boundaries

- Always: RU/KK parity, OpenAPI method/path preservation, regression tests, browser smoke.
- Ask first: изменение backend endpoint/schema или добавление server-side медицинского правила.
- Never: отправлять недокументированное JSON-тело, коммитить demo credentials, скрывать backend-ошибку без диагностики.

## Success criteria

- Повторная форма отчёта недоступна в тот же локальный день и снова доступна на следующий.
- Production-проверка отчёта специалистом возвращает `200`, а не BFF `415`.
- На главной нет блока «Каждый шаг под контролем» со щитом.
- Header/footer/app shell/favicon/PWA показывают новый `Q`-знак.
- `pnpm verify`, role E2E и production browser smoke проходят без ошибок консоли.

## Open questions

Нет. Текущий объём не изменяет Swagger и реализуется в существующем frontend/BFF.
