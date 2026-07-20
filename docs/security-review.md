# Qadam security review

Дата: 2026-07-20
Вердикт: **PASS — high/critical findings отсутствуют**

## Threat model

Защищаемые данные: access/refresh tokens, synthetic patient records, фотографии, сообщения, PDF/CSV exports. Границы доверия: браузер → same-origin Next.js BFF → фиксированный backend origin. Ввод пользователя, backend responses, filenames и OpenAPI data рассматриваются как недоверенные.

## Проверенные controls

- JWT доступны только серверу в `HttpOnly`, `SameSite=Lax`, production `Secure` cookies; browser получает только `role` и `userId`.
- Mutating route handlers требуют точного same-origin `Origin`; login, password, logout и общий proxy используют один origin policy. За reverse proxy public origin восстанавливается из platform-owned `X-Forwarded-Host`/`X-Forwarded-Proto`, foreign и missing origins отклоняются тестами.
- Proxy разрешает только 52 пары `method + path` из сохранённого OpenAPI, только документированные query keys/content types и отклоняет traversal/небезопасные file paths.
- Token refresh имеет один повтор; неуспех очищает session. Backend/network failure преобразуется в no-store `503` без stack/token output.
- API, auth, protected media и authenticated HTML не попадают в Service Worker Cache Storage; browser E2E это подтверждает.
- Binary proxy не меняет bytes/content type/disposition и не копирует потенциально неверный `Content-Length`.
- Upload policy: JPEG/PNG/WebP, source до 10 MB, complaint до 5 файлов/chat до 1, max dimension 1600 px, WebP compression и общий target до 4 MB.
- React экранирует backend/user text; `dangerouslySetInnerHTML`, browser token storage и analytics отсутствуют.
- Supply chain: exact versions, lockfile, lifecycle scripts disabled during install, minimum release age и `postcss >=8.5.10` override. `pnpm audit --audit-level=moderate` — 0 findings.
- Secret scan по значениям трёх demo accounts — clean; credentials доступны только через ignored local/Vercel environment variables.

## Исправления по итогам review

1. Добавлен безопасный `503` для backend connection failure.
2. Удалено forwarding `Content-Length` для streamed/decompressed binary responses.
3. UUID format из OpenAPI преобразуется в browser validation pattern.
4. Chat polling защищён от overlap и приостанавливается hidden/offline.
5. Исправлен moderate PostCSS advisory через workspace override `8.5.10`.
6. Origin validation адаптирован к public host за Vercel/Next proxy без ослабления foreign-origin deny policy.
7. Live E2E переведён на in-page request без заполнения DOM, чтобы Playwright error context не мог сохранить credentials.

## Остаточные ограничения

- Backend доступен по HTTP. Соединение выполняется только server-to-server; решение использовать synthetic data и не добавлять пользовательское предупреждение подтверждено владельцем проекта.
- Backend остаётся окончательным источником ролевой авторизации. UI guards и BFF route allowlist уменьшают поверхность, но не заменяют backend `403`.
- API не предоставляет pagination; frontend не изобретает несовместимый контракт.
- Environment-gated Playwright project `live` не сохраняет trace/video/screenshots и не заполняет credential values в DOM. Live login трёх ролей прошёл после восстановления backend.

## Verification

```text
pnpm audit --audit-level=moderate  -> 0 vulnerabilities
pnpm verify                        -> pass
pnpm api:coverage                   -> 52/52 operations, 30/30 schemas
playwright fixture + live suites   -> pass (PATIENT/PRACTITIONER/ADMIN)
specific demo-secret scan          -> clean
```
