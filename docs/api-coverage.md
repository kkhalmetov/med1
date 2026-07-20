# Qadam — полная матрица покрытия backend API

Статус: `VERIFIED — 52/52 operations, 30/30 schemas, live login 3/3 roles`
Проверено: 2026-07-20  
Backend: `http://45.141.100.245:8080/disabled-support-service/api/v1`

## Результат сверки

- Live OpenAPI: `3.1.0`, HTTP `200`.
- Live Swagger: **41 path, 52 операции, 30 схем, 11 групп**.
- Локальный `swagger.md`: **52 операции**.
- Разница множеств `METHOD + PATH`: **0** в обе стороны.
- Frontend action registry: **52/52**; проверяется командой `pnpm api:coverage`.
- Runtime/form schema coverage: **30/30**; поля, required, enum и диапазоны строятся из OpenAPI snapshot.
- Публичные операции: только `POST /auth/make-auth` и `POST /auth/refresh-access-token`.
- Остальные 50 операций требуют Bearer JWT.

Обозначения статуса:

- `⬜` — обязательно, но ещё не реализовано.
- `✅` — UI подключён, mock/contract tests и разрешённый live smoke пройдены.
- Строка может стать `✅` только после проверки success path, документированных ошибок и ролевого доступа.

## 1. Аутентификация — 4/52

| Статус | Метод и путь | Роль | Frontend-интеграция | Проверка |
|---|---|---|---|---|
| ✅ | `POST /auth/make-auth` | Public | Страница входа; определение `PATIENT/PRACTITIONER/ADMIN`; HttpOnly-сессия | Успех, `400`, `401`, role redirect |
| ✅ | `POST /auth/refresh-access-token` | Public/BFF | Автоматическое обновление токенов и один повтор исходного запроса | Refresh success/failure, cookies rotated/cleared |
| ✅ | `POST /auth/logout` | Все авторизованные | Выход из меню каждой роли, очистка cookies/cache query | `200`, `401`, повторный logout безопасен |
| ✅ | `PATCH /auth/password/update` | Все авторизованные | Форма смены пароля в настройках каждой роли | `200`, `400`, `401`, очистка полей |

## 2. Отчёты пациентов — 6/52

| Статус | Метод и путь | Роль | Frontend-интеграция | Проверка |
|---|---|---|---|---|
| ✅ | `GET /reports?is_unchecked=` | Practitioner | Общая очередь отчётов; переключатель «только непроверенные» | `false/true`, сортировка статусов, `401/403` |
| ✅ | `POST /reports` | Patient | Форма ежедневного самочувствия по выбранному изделию | `201`, диапазоны, `401/403/404` |
| ✅ | `PATCH /reports/{id}/check` | Practitioner | Действие «Проверено» в отчёте и карточке пациента | `200`, optimistic guard, `401/403/404` |
| ✅ | `GET /reports/my` | Patient | История собственных отчётов | `200`, empty/error, checked state |
| ✅ | `GET /patients/{patientId}/reports?is_unchecked=` | Practitioner | Вкладка отчётов пациента с фильтром | `false/true`, `401/403/404` |
| ✅ | `GET /patients/{patientId}/reports/export-pdf` | Practitioner | Скачивание PDF из карточки пациента | PDF filename/content-type, `401/403/404` |

## 3. Квалификации — 3/52

| Статус | Метод и путь | Роль | Frontend-интеграция | Проверка |
|---|---|---|---|---|
| ✅ | `GET /qualifications` | Авторизованные | Admin-таблица; selector регистрации специалиста | `200`, empty, `401` |
| ✅ | `POST /qualifications` | Admin | Форма/диалог создания квалификации | `201`, `401/403/409` |
| ✅ | `GET /qualifications/{id}` | Авторизованные | Страница/панель деталей квалификации | `200`, `401/404` |

## 4. Медицинские специалисты — 6/52

| Статус | Метод и путь | Роль | Frontend-интеграция | Проверка |
|---|---|---|---|---|
| ✅ | `GET /practitioners` | Admin | Реестр специалистов, локальный поиск/фильтры | `200`, `401/403`, empty |
| ✅ | `POST /practitioners` | Admin | Multipart-регистрация специалиста с фото и квалификациями | `201`, `401/403/404/409` |
| ✅ | `GET /practitioners/me` | Practitioner | Профиль специалиста | `200`, `401/403/404` |
| ✅ | `PATCH /practitioners/me` | Practitioner | Изменение телефона | `200`, `401/403/404` |
| ✅ | `GET /practitioners/{id}` | Авторизованные | Детали специалиста в разрешённом контексте | `200`, `401/404` |
| ✅ | `GET /practitioners/export` | Admin | Экспорт реестра специалистов в CSV | CSV filename/content-type, `401/403/500` |

## 5. Пациенты — 7/52

| Статус | Метод и путь | Роль | Frontend-интеграция | Проверка |
|---|---|---|---|---|
| ✅ | `GET /patients?only_observable=` | Practitioner | Список закреплённых пациентов; фильтр действующего наблюдения | `false/true`, `401/403` |
| ✅ | `POST /patients` | Practitioner | Multipart-регистрация пациента с фото | `201`, `401/403/409/500` |
| ✅ | `PATCH /patients/{id}/status` | Practitioner | Смена `GREEN/YELLOW/RED` с комментарием | `200`, `401/403/404` |
| ✅ | `GET /patients/me?only_observable=` | Patient | Профиль/главная пациента; toggle актуальных изделий | `false/true`, `401/403` |
| ✅ | `PATCH /patients/me` | Patient | Изменение телефона и/или адреса | `200`, `401/403/404` |
| ✅ | `GET /patients/{id}/status-history` | Авторизованные в разрешённом контексте | Timeline статусов в карточке пациента | `200`, `401/404` |
| ✅ | `GET /patients/export` | Admin | Экспорт пациентов в CSV | CSV filename/content-type, `401/403/500` |

## 6. Чат — 8/52

| Статус | Метод и путь | Роль | Frontend-интеграция | Проверка |
|---|---|---|---|---|
| ✅ | `GET /patients/{patientId}/chat/messages` | Practitioner | История чата выбранного пациента; mark-as-read семантика | `200`, `401/403/404` |
| ✅ | `POST /patients/{patientId}/chat/messages` | Practitioner | Отправка текста пациенту | `201`, `401/403/404` |
| ✅ | `POST /patients/{patientId}/chat/messages/photo` | Practitioner | Одно JPEG/PNG/WebP-фото после client resize/compression, необязательная подпись | Policy validation, `201`, `400/403/404` |
| ✅ | `GET /chat/messages` | Patient | История чата со своим специалистом; mark-as-read семантика | `200`, `401/403` |
| ✅ | `POST /chat/messages` | Patient | Отправка текста специалисту | `201`, `400/401/403` |
| ✅ | `POST /chat/messages/photo` | Patient | Одно JPEG/PNG/WebP-фото после client resize/compression, необязательная подпись | Policy validation, `201`, `400/401/403` |
| ✅ | `GET /chat/unread` | Practitioner | Сводные unread-бейджи по пациентам | `200`, polling, `401/403` |
| ✅ | `GET /chat/messages/unread` | Patient | Unread-бейдж сообщений специалиста | `200`, polling, `401/403` |

## 7. Медицинские организации — 3/52

| Статус | Метод и путь | Роль | Frontend-интеграция | Проверка |
|---|---|---|---|---|
| ✅ | `GET /organizations` | Авторизованные | Admin-реестр; selectors специалиста/изделия | `200`, empty, `401` |
| ✅ | `POST /organizations` | Admin | Форма создания организации | `201`, `401/403/409` |
| ✅ | `GET /organizations/{id}` | Авторизованные | Детальная страница/панель организации | `200`, `401/404` |

## 8. Изделия — 3/52

| Статус | Метод и путь | Роль | Frontend-интеграция | Проверка |
|---|---|---|---|---|
| ✅ | `GET /devices` | Авторизованные | Каталог изделий и selectors выдачи/отчёта | `200`, empty, `401` |
| ✅ | `POST /devices` | Admin, Practitioner | Форма создания протеза/ортеза | `201`, `401/403/404` |
| ✅ | `GET /devices/{id}` | Авторизованные | Детальная карточка изделия | `200`, `401/404` |

## 9. Акты выдачи изделий — 4/52

| Статус | Метод и путь | Роль | Frontend-интеграция | Проверка |
|---|---|---|---|---|
| ✅ | `POST /device-dispenses` | Practitioner | Форма выдачи изделия пациенту | `201`, `401/403/404` |
| ✅ | `GET /patients/{patientId}/device-dispenses?only_observable=` | Practitioner, Admin | Вкладка выдач пациента; фильтр действующего наблюдения | `false/true`, `401/404` |
| ✅ | `GET /device-dispenses/{id}` | Авторизованные | Детали акта выдачи из доступных списков | `200`, `401/404` |
| ✅ | `GET /device-dispenses/me?only_observable=` | Patient | Мои акты выдачи; фильтр действующего наблюдения | `false/true`, `401/403/404` |

## 10. Жалобы на изделия — 7/52

| Статус | Метод и путь | Роль | Frontend-интеграция | Проверка |
|---|---|---|---|---|
| ✅ | `GET /device-complains?not_reviewed=` | Practitioner | Общая очередь жалоб; фильтр нерассмотренных | `false/true`, сортировка статусов, `401/403` |
| ✅ | `POST /device-complains` | Patient | Multipart-жалоба: до пяти JPEG/PNG/WebP после client resize/compression | Policy validation, сохранение формы при `400`, `201/400/401/403` |
| ✅ | `PATCH /device-complains/{id}/review` | Practitioner | Статус и обязательное решение по жалобе | `200`, `401/403/404` |
| ✅ | `GET /patients/{patientId}/device-complains?not_reviewed=` | Practitioner | Жалобы пациента с фильтром | `false/true`, `401/403/404` |
| ✅ | `GET /patients/{patientId}/device-complains/export-pdf` | Practitioner | Скачивание PDF жалоб пациента | PDF filename/content-type, `401/403/404` |
| ✅ | `GET /device-complains/{id}` | Авторизованные в разрешённом контексте | Детальная карточка жалобы и фото | `200`, `401/404` |
| ✅ | `GET /device-complains/my?reviewed=` | Patient | Мои жалобы; переключатель reviewed | `false/true`, `401/403` |

## 11. Защищённые файлы — 1/52

| Статус | Метод и путь | Роль | Frontend-интеграция | Проверка |
|---|---|---|---|---|
| ✅ | `GET /files?path=` | Авторизованные | Same-origin media proxy для аватаров, фото чата и жалоб | `200`, content-type, placeholder, `401/404`, path allowlist |

## Покрытие 30 схем

| Группа | Схемы | Потребитель на фронтенде |
|---|---|---|
| Отчёты | `QuestionnaireResponseCreateRequest`, `QuestionnaireResponseResponse` | Форма, очередь, история, графики, проверка |
| Квалификации | `QualificationCreateRequest`, `QualificationResponse` | Admin create/list/detail, practitioner selector |
| Специалисты | `PractitionerRegisterRequest`, `PractitionerResponse`, `PractitionerSelfUpdateRequest` | Admin registration/detail/export, профиль |
| Пациенты | `PatientRegisterRequest`, `PatientDeviceSummaryResponse`, `PatientResponse`, `PatientSelfUpdateRequest` | Регистрация, профиль, список и карточка |
| Статусы пациентов | `PatientStatusChangeRequest`, `PatientStatusChangeResponse` | Смена статуса и timeline |
| Чат | `ChatMessageCreateRequest`, `ChatMessageWithPhotoCreateRequest`, `ChatMessageResponse` | Обе стороны чата, фото, unread |
| Организации | `OrganizationCreateRequest`, `OrganizationResponse` | Admin create/list/detail и selectors |
| Изделия | `DeviceCreateRequest`, `DeviceResponse` | Каталог, create/detail, selectors |
| Выдачи | `DeviceDispenseCreateRequest`, `DeviceDispenseResponse` | Выдача и списки/детали актов |
| Жалобы | `DeviceComplainCreateRequest`, `DeviceComplainPhotoResponse`, `DeviceComplainResponse`, `DeviceComplainReviewRequest` | Создание, фото, очереди, review/detail |
| Auth | `AuthRequestDto`, `AuthResponseDto`, `RefreshAccessTokenRequestDto`, `UpdatePasswordRequest` | Login, HttpOnly session, refresh, password |

Итого в таблице: **30 уникальных схем**.

## Покрытие enum

| Enum | Значения | UI |
|---|---|---|
| Role | `PATIENT`, `PRACTITIONER`, `ADMIN` | Ролевой shell и защита маршрутов |
| Patient/report status | `GREEN`, `YELLOW`, `RED` | Перевод, цвет, текст и иконка |
| Gender | `MALE`, `FEMALE`, `OTHER` | Поле регистрации пациента |
| Disability group | `FIRST`, `SECOND`, `THIRD` | Поле и карточка пациента |
| Device type | `PROSTHESIS`, `ORTHOSIS` | Каталог и формы изделия |
| Body part | `ARM`, `LEG`, `BACK`, `NECK` | Каталог, отчёты и карточки |
| Complaint reason | `BREAKAGE`, `WEAR_AND_TEAR`, `DISCOMFORT`, `OTHER` | Форма/фильтры/детали жалобы |
| Complaint status | `PENDING`, `IN_REVIEW`, `APPROVED`, `REJECTED`, `COMPLETED` | Review workflow и timeline |
| Message sender | `PATIENT`, `PRACTITIONER` | Выравнивание и подпись сообщений |

Все enum-значения должны иметь русский и казахский перевод; raw-коды в UI запрещены.

## Definition of Done для полного API

Полное подключение backend считается выполненным, только если:

1. Все 52 строки имеют статус `✅`.
2. Все 30 схем представлены сгенерированными TypeScript-типами и runtime-валидацией входных форм/критичных ответов.
3. Все query/path parameters доступны из нужного UI и проверены в обоих состояниях, где есть boolean-фильтр.
4. Все JSON и multipart body формируются по OpenAPI; файлы и экспорты проходят через BFF без повреждения content type/body.
5. Для всех трёх ролей проверены разрешённые действия и ожидаемые `403` на запрещённых.
6. Documented error codes имеют локализованные состояния и retry/back navigation там, где это уместно.
7. Contract-check сравнивает сохранённый OpenAPI snapshot с live Swagger и падает при удалении/изменении используемой операции.
