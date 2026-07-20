# Changelog

Все заметные изменения Qadam фиксируются в этом файле.

## [0.1.1] - 2026-07-20

### Исправлено

- технический Swagger-workbench заменён предметными кабинетами пациента, специалиста и администратора;
- все 52 backend-операции привязаны к контекстным спискам, карточкам, формам, чатам и выгрузкам;
- исправлены лендинг, экран входа, форма пароля и главная пациента по production-ревью;
- диапазон `discomfortLevel` синхронизирован с live OpenAPI: `0–10`;
- добавлены RU/KK product copy, mobile checks и browser mutation tests для трёх ролей.

## [0.1.0] - 2026-07-20

### Добавлено

- двуязычная RU/KK installable PWA с кабинетами `PATIENT`, `PRACTITIONER` и `ADMIN`;
- полный UI и BFF для 52 операций и 30 схем backend OpenAPI;
- ежедневные отчёты, жалобы с фото, чат, изделия, справочники и CSV/PDF;
- HttpOnly-сессии, OpenAPI allowlist и безопасная обработка media/download;
- адаптивная дизайн-система, keyboard navigation и axe-проверки;
- unit/integration, role-based Playwright и live smoke suites;
- CI quality gates, security/code reviews и Vercel runbook.
