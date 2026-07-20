
OpenAPI definition

 v0 

OAS 3.1

/disabled-support-service/api/v1/v3/api-docs
Servers
Отчёты пациентов
GET
/reports
Сводка отчётов всех прикреплённых пациентов

Требуется роль PRACTITIONER. Возвращает отчёты всех пациентов, закреплённых за вызывающим врачом. Сортировка по статусу пациента - сначала отчеты красных, затем желтых и зеленых
Parameters
Name	Description
is_unchecked
boolean
(query)
	

Фильтр: только непроверенные отчёты

Default value : false

Example : false
Responses
Code	Description	Links
200	

Успех
Media type
Controls Accept header.

[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "patientId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "patientFullName": "string",
    "statusColor": "GREEN",
    "deviceId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "deviceName": "string",
    "targetBodyPart": "ARM",
    "submittedAt": "2026-07-20T13:46:59.238Z",
    "painLevel": 0,
    "discomfortLevel": 0,
    "mobilityLevel": 0,
    "sleepQuality": 0,
    "comment": "string",
    "checkedByPractitionerId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "checkedByFullName": "string",
    "checkedAt": "2026-07-20T13:46:59.238Z"
  }
]

	No links
401	

Не авторизован
Media type

{
  "status": "401",
  "message": "Требуется авторизация"
}

	No links
403	

Нет доступа
Media type

{
  "status": "403",
  "message": "Недостаточно прав для выполнения операции"
}

	No links
POST
/reports
Подача отчёта о самочувствии

Требуется роль PATIENT. Отчёт всегда подаётся от имени вызывающего пациента
Parameters

No parameters
Request body

{
  "deviceId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "painLevel": 10,
  "discomfortLevel": 1,
  "mobilityLevel": 10,
  "sleepQuality": 10,
  "comment": "string"
}

Responses
Code	Description	Links
201	

CREATED
Media type
Controls Accept header.

{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "patientId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "patientFullName": "string",
  "statusColor": "GREEN",
  "deviceId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "deviceName": "string",
  "targetBodyPart": "ARM",
  "submittedAt": "2026-07-20T13:46:59.245Z",
  "painLevel": 0,
  "discomfortLevel": 0,
  "mobilityLevel": 0,
  "sleepQuality": 0,
  "comment": "string",
  "checkedByPractitionerId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "checkedByFullName": "string",
  "checkedAt": "2026-07-20T13:46:59.245Z"
}

	No links
401	

Не авторизован
Media type

{
  "status": "401",
  "message": "Требуется авторизация"
}

	No links
403	

Нет доступа
Media type

{
  "status": "403",
  "message": "Недостаточно прав для выполнения операции"
}

	No links
404	

Не найдено
Media type

{
  "status": "404",
  "message": "Изделие с таким id не найдено"
}

	No links
PATCH
/reports/{id}/check
Отметка отчёта как проверенного

Требуется роль PRACTITIONER. Проверить можно только отчёт своего пациента. В отчёте фиксируются checkedBy (вызывающий врач) и checkedAt
Parameters
Name	Description
id *
string($uuid)
(path)
	
Responses
Code	Description	Links
200	

Успех
Media type
Controls Accept header.

{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "patientId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "patientFullName": "string",
  "statusColor": "GREEN",
  "deviceId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "deviceName": "string",
  "targetBodyPart": "ARM",
  "submittedAt": "2026-07-20T13:46:59.249Z",
  "painLevel": 0,
  "discomfortLevel": 0,
  "mobilityLevel": 0,
  "sleepQuality": 0,
  "comment": "string",
  "checkedByPractitionerId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "checkedByFullName": "string",
  "checkedAt": "2026-07-20T13:46:59.249Z"
}

	No links
401	

Не авторизован
Media type

{
  "status": "401",
  "message": "Требуется авторизация"
}

	No links
403	

Отчёт пациента другого специалиста
Media type

{
  "status": "403",
  "message": "Отчёт принадлежит пациенту другого специалиста"
}

	No links
404	

Не найдено
Media type

{
  "status": "404",
  "message": "Отчёт с таким id не найден"
}

	No links
GET
/reports/my
Просмотр своих отчётов (пациентом)

Требуется роль PATIENT
Parameters

No parameters
Responses
Code	Description	Links
200	

Успех
Media type
Controls Accept header.

[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "patientId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "patientFullName": "string",
    "statusColor": "GREEN",
    "deviceId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "deviceName": "string",
    "targetBodyPart": "ARM",
    "submittedAt": "2026-07-20T13:46:59.252Z",
    "painLevel": 0,
    "discomfortLevel": 0,
    "mobilityLevel": 0,
    "sleepQuality": 0,
    "comment": "string",
    "checkedByPractitionerId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "checkedByFullName": "string",
    "checkedAt": "2026-07-20T13:46:59.252Z"
  }
]

	No links
401	

Не авторизован
Media type

{
  "status": "401",
  "message": "Требуется авторизация"
}

	No links
GET
/patients/{patientId}/reports
Сводка отчётов конкретного пациента

Требуется роль PRACTITIONER. Пациент должен быть закреплён за вызывающим врачом
Parameters
Name	Description
patientId *
string($uuid)
(path)
	
is_unchecked
boolean
(query)
	

Фильтр: только непроверенные отчёты

Default value : false

Example : false
Responses
Code	Description	Links
200	

Успех
Media type
Controls Accept header.

[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "patientId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "patientFullName": "string",
    "statusColor": "GREEN",
    "deviceId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "deviceName": "string",
    "targetBodyPart": "ARM",
    "submittedAt": "2026-07-20T13:46:59.255Z",
    "painLevel": 0,
    "discomfortLevel": 0,
    "mobilityLevel": 0,
    "sleepQuality": 0,
    "comment": "string",
    "checkedByPractitionerId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "checkedByFullName": "string",
    "checkedAt": "2026-07-20T13:46:59.255Z"
  }
]

	No links
401	

Не авторизован
Media type

{
  "status": "401",
  "message": "Требуется авторизация"
}

	No links
403	

Пациент закреплён за другим специалистом
Media type

{
  "status": "403",
  "message": "Пациент закреплён за другим специалистом"
}

	No links
404	

Не найдено
Media type

{
  "status": "404",
  "message": "Пациент с таким id не найден"
}

	No links
GET
/patients/{patientId}/reports/export-pdf
Экспорт всех отчётов пациента в PDF

Требуется роль PRACTITIONER. Пациент должен быть закреплён за вызывающим врачом. PDF содержит уровни боли, дискомфорта, подвижности, сна и комментарии по дням
Parameters
Name	Description
patientId *
string($uuid)
(path)
	
Responses
Code	Description	Links
200	

Успех (application/pdf)
Media type
Controls Accept header.

string

	No links
401	

Не авторизован
Media type

{
  "status": "401",
  "message": "Требуется авторизация"
}

	No links
403	

Пациент закреплён за другим специалистом
Media type

{
  "status": "403",
  "message": "Пациент закреплён за другим специалистом"
}

	No links
404	

Не найдено
Media type

{
  "status": "404",
  "message": "Пациент с таким id не найден"
}

	No links
Квалификации
GET
/qualifications
Поиск всех квалификаций
Parameters

No parameters
Responses
Code	Description	Links
200	

Успех
Media type
Controls Accept header.

[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "string",
    "code": "string"
  }
]

	No links
401	

Не авторизован
Media type

{
  "status": "401",
  "message": "Требуется авторизация"
}

	No links
POST
/qualifications
Добавление квалификации

Требуется роль ADMIN
Parameters

No parameters
Request body

{
  "name": "string",
  "code": "string"
}

Responses
Code	Description	Links
201	

CREATED
Media type
Controls Accept header.

{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "string",
  "code": "string"
}

	No links
401	

Не авторизован
Media type

{
  "status": "401",
  "message": "Требуется авторизация"
}

	No links
403	

Доступ запрещен
Media type

{
  "status": "403",
  "message": "Недостаточно прав для выполнения операции"
}

	No links
409	

Уже существует
Media type

{
  "status": "409",
  "message": "Квалификация с таким названием уже существует"
}

	No links
GET
/qualifications/{id}
Поиск квалификации по id
Parameters
Name	Description
id *
string($uuid)
(path)
	
Responses
Code	Description	Links
200	

Успех
Media type
Controls Accept header.

{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "string",
  "code": "string"
}

	No links
401	

Не авторизован
Media type

{
  "status": "401",
  "message": "Требуется авторизация"
}

	No links
404	

Не найдено
Media type

{
  "status": "404",
  "message": "Квалификации с таким id не существует"
}

	No links
Мед. специалисты
GET
/practitioners
Поиск всех специалистов

Требуется роль ADMIN
Parameters

No parameters
Responses
Code	Description	Links
200	

Успех
Media type
Controls Accept header.

[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "firstName": "string",
    "lastName": "string",
    "middleName": "string",
    "phone": "string",
    "email": "string",
    "licenseNumber": "string",
    "organizationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "organizationName": "string",
    "imagePath": "string",
    "createdAt": "2026-07-20T13:46:59.272Z",
    "updatedAt": "2026-07-20T13:46:59.272Z",
    "iin": "string",
    "qualifications": [
      {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "name": "string",
        "code": "string"
      }
    ]
  }
]

	No links
401	

Не авторизован
Media type

{
  "status": "401",
  "message": "Требуется авторизация"
}

	No links
403	

Нет доступа
Media type

{
  "status": "403",
  "message": "Недостаточно прав для выполнения операции"
}

	No links
POST
/practitioners
Регистрация специалиста

Требуется роль ADMIN
Parameters

No parameters
Request body
firstName *
string
	
lastName *
string
	
middleName
string
	
iin *
string
	
email *
string($email)
	
phone *
string
	
organizationId *
string($uuid)
	
licenseNumber *
string
	
qualificationsId *
array<string>
	
photo
string($binary)
	
Responses
Code	Description	Links
201	

CREATED
Media type
Controls Accept header.

{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "firstName": "string",
  "lastName": "string",
  "middleName": "string",
  "phone": "string",
  "email": "string",
  "licenseNumber": "string",
  "organizationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "organizationName": "string",
  "imagePath": "string",
  "createdAt": "2026-07-20T13:46:59.280Z",
  "updatedAt": "2026-07-20T13:46:59.280Z",
  "iin": "string",
  "qualifications": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "name": "string",
      "code": "string"
    }
  ]
}

	No links
401	

Не авторизован
Media type

{
  "status": "401",
  "message": "Требуется авторизация"
}

	No links
403	

Нет доступа
Media type

{
  "status": "403",
  "message": "Недостаточно прав для выполнения операции"
}

	No links
404	

Не найдено
Media type

{
  "status": "404",
  "message": "Организация с таким id не найдена"
}

	No links
409	

Специалист с таким ИИН уже зарегистрирован
Media type

{
  "status": "409",
  "message": "Специалист с таким ИИН уже зарегистрирован"
}

	No links
GET
/practitioners/me
Получение информации о себе (мед. специалистом)

Требуется роль PRACTITIONER
Parameters

No parameters
Responses
Code	Description	Links
200	

Успех
Media type
Controls Accept header.

{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "firstName": "string",
  "lastName": "string",
  "middleName": "string",
  "phone": "string",
  "email": "string",
  "licenseNumber": "string",
  "organizationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "organizationName": "string",
  "imagePath": "string",
  "createdAt": "2026-07-20T13:46:59.284Z",
  "updatedAt": "2026-07-20T13:46:59.284Z",
  "iin": "string",
  "qualifications": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "name": "string",
      "code": "string"
    }
  ]
}

	No links
401	

Не авторизован
Media type

{
  "status": "401",
  "message": "Требуется авторизация"
}

	No links
403	

Нет доступа
Media type

{
  "status": "403",
  "message": "Нет доступа"
}

	No links
404	

Не найдено
Media type

{
  "status": "404",
  "message": "Специалист с таким id не найден"
}

	No links
PATCH
/practitioners/me
Обновление информации о специалисте

Требуется роль PRACTITIONER
Parameters

No parameters
Request body

{
  "phone": "string"
}

Responses
Code	Description	Links
200	

Успех
Media type
Controls Accept header.

{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "firstName": "string",
  "lastName": "string",
  "middleName": "string",
  "phone": "string",
  "email": "string",
  "licenseNumber": "string",
  "organizationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "organizationName": "string",
  "imagePath": "string",
  "createdAt": "2026-07-20T13:46:59.289Z",
  "updatedAt": "2026-07-20T13:46:59.289Z",
  "iin": "string",
  "qualifications": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "name": "string",
      "code": "string"
    }
  ]
}

	No links
401	

Не авторизован
Media type

{
  "status": "401",
  "message": "Требуется авторизация"
}

	No links
403	

Нет доступа
Media type

{
  "status": "403",
  "message": "Недостаточно прав для выполнения операции"
}

	No links
404	

Не найдено
Media type

{
  "status": "404",
  "message": "Специалист с таким id не найден"
}

	No links
GET
/practitioners/{id}
Поиск специалиста по id
Parameters
Name	Description
id *
string($uuid)
(path)
	
Responses
Code	Description	Links
200	

Успех
Media type
Controls Accept header.

{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "firstName": "string",
  "lastName": "string",
  "middleName": "string",
  "phone": "string",
  "email": "string",
  "licenseNumber": "string",
  "organizationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "organizationName": "string",
  "imagePath": "string",
  "createdAt": "2026-07-20T13:46:59.294Z",
  "updatedAt": "2026-07-20T13:46:59.294Z",
  "iin": "string",
  "qualifications": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "name": "string",
      "code": "string"
    }
  ]
}

	No links
401	

Не авторизован
Media type

{
  "status": "401",
  "message": "Требуется авторизация"
}

	No links
404	

Не найдено
Media type

{
  "status": "404",
  "message": "Специалист с таким id не найден"
}

	No links
GET
/practitioners/export
Экспорт информации о специалистах в CSV

Требуется роль ADMIN
Parameters

No parameters
Responses
Code	Description	Links
200	

Успех
Media type
Controls Accept header.

string

	No links
401	

Не авторизован
Media type

{
  "status": "401",
  "message": "Требуется авторизация"
}

	No links
403	

Нет доступа
Media type

{
  "status": "403",
  "message": "Недостаточно прав для выполнения операции"
}

	No links
500	

Ошибка на сервере
Media type

{
  "status": "500",
  "message": "Ошибка на сервере"
}

	No links
Пациенты
GET
/patients
Поиск своих пациентов

Требуется роль PRACTITIONER. Возвращает пациентов, закреплённых за вызывающим врачом, вместе с информацией о выдачах изделий и остаточных сроках наблюдения
Parameters
Name	Description
only_observable
boolean
(query)
	

Фильтр: включить информацию только о текущих протезах/ортезах или о всех

Default value : false

Example : false
Responses
Code	Description	Links
200	

Успех
Media type
Controls Accept header.

[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "iin": "string",
    "firstName": "string",
    "lastName": "string",
    "middleName": "string",
    "username": "string",
    "birthDate": "2026-07-20",
    "gender": "MALE",
    "email": "string",
    "phone": "string",
    "city": "string",
    "address": "string",
    "disabledGroup": "FIRST",
    "status": "GREEN",
    "imagePath": "string",
    "practitionerId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "practitionerFullName": "string",
    "currentDevices": [
      {
        "deviceId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "deviceName": "string",
        "deviceType": "PROSTHESIS",
        "issuedAt": "2026-07-20T13:46:59.301Z",
        "observationEndsAt": "2026-07-20T13:46:59.301Z",
        "remainingObservationDays": 0
      }
    ],
    "createdAt": "2026-07-20T13:46:59.301Z",
    "updatedAt": "2026-07-20T13:46:59.301Z"
  }
]

	No links
401	

Не авторизован
Media type

{
  "status": "401",
  "message": "Требуется авторизация"
}

	No links
403	

Нет доступа
Media type

{
  "status": "403",
  "message": "Недостаточно прав для выполнения операции"
}

	No links
POST
/patients
Регистрация пациента

Требуется роль PRACTITIONER. Пациент автоматически привязывается к вызывающему врачу
Parameters

No parameters
Request body
iin *
string
	
firstName *
string
	
lastName *
string
	
middleName
string
	
birthDate *
string($date)
	
gender *
string
	
email *
string($email)
	
phone *
string
	
city *
string
	
address *
string
	
disabledGroup
string
	
photo
string($binary)
	
Responses
Code	Description	Links
201	

CREATED
Media type
Controls Accept header.

{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "iin": "string",
  "firstName": "string",
  "lastName": "string",
  "middleName": "string",
  "username": "string",
  "birthDate": "2026-07-20",
  "gender": "MALE",
  "email": "string",
  "phone": "string",
  "city": "string",
  "address": "string",
  "disabledGroup": "FIRST",
  "status": "GREEN",
  "imagePath": "string",
  "practitionerId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "practitionerFullName": "string",
  "currentDevices": [
    {
      "deviceId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "deviceName": "string",
      "deviceType": "PROSTHESIS",
      "issuedAt": "2026-07-20T13:46:59.314Z",
      "observationEndsAt": "2026-07-20T13:46:59.314Z",
      "remainingObservationDays": 0
    }
  ],
  "createdAt": "2026-07-20T13:46:59.314Z",
  "updatedAt": "2026-07-20T13:46:59.314Z"
}

	No links
401	

Не авторизован
Media type

{
  "status": "401",
  "message": "Требуется авторизация"
}

	No links
403	

Нет доступа
Media type

{
  "status": "403",
  "message": "Недостаточно прав для выполнения операции"
}

	No links
409	

Пациент с таким ИИН уже зарегистрирован
Media type

{
  "status": "409",
  "message": "Пациент с таким ИИН уже зарегистрирован"
}

	No links
500	

Ошибка на сервере
Media type

{
  "status": "500",
  "message": "Ошибка на сервере"
}

	No links
PATCH
/patients/{id}/status
Изменение статуса пациента

Требуется роль PRACTITIONER
Parameters
Name	Description
id *
string($uuid)
(path)
	
Request body

{
  "status": "GREEN",
  "comment": "string"
}

Responses
Code	Description	Links
200	

Успех
Media type
Controls Accept header.

{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "patientId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "status": "GREEN",
  "changedByPractitionerId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "changedByFullName": "string",
  "changedAt": "2026-07-20T13:46:59.320Z",
  "comment": "string"
}

	No links
401	

Не авторизован
Media type

{
  "status": "401",
  "message": "Требуется авторизация"
}

	No links
403	

Нет доступа
Media type

{
  "status": "403",
  "message": "Недостаточно прав для выполнения операции"
}

	No links
404	

Не найдено
Media type

{
  "status": "404",
  "message": "Пациент с таким id не найден"
}

	No links
GET
/patients/me
Получение информации о себе (пациентом).

Требуется роль PATIENT. Возвращает информацию о пациенте, включая информацию о выдачах изделий
Parameters
Name	Description
only_observable
boolean
(query)
	

Фильтр: включить информацию только о текущих протезах/ортезах или о всех

Default value : false

Example : false
Responses
Code	Description	Links
200	

Успех
Media type
Controls Accept header.

{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "iin": "string",
  "firstName": "string",
  "lastName": "string",
  "middleName": "string",
  "username": "string",
  "birthDate": "2026-07-20",
  "gender": "MALE",
  "email": "string",
  "phone": "string",
  "city": "string",
  "address": "string",
  "disabledGroup": "FIRST",
  "status": "GREEN",
  "imagePath": "string",
  "practitionerId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "practitionerFullName": "string",
  "currentDevices": [
    {
      "deviceId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "deviceName": "string",
      "deviceType": "PROSTHESIS",
      "issuedAt": "2026-07-20T13:46:59.324Z",
      "observationEndsAt": "2026-07-20T13:46:59.324Z",
      "remainingObservationDays": 0
    }
  ],
  "createdAt": "2026-07-20T13:46:59.324Z",
  "updatedAt": "2026-07-20T13:46:59.324Z"
}

	No links
401	

Не авторизован
Media type

{
  "status": "401",
  "message": "Требуется авторизация"
}

	No links
403	

Нет доступа
Media type

{
  "status": "403",
  "message": "Недостаточно прав для выполнения операции"
}

	No links
PATCH
/patients/me
Обновление информации о себе (пациентом)

Требуется роль PATIENT. Доступно изменение телефона и адреса
Parameters

No parameters
Request body

{
  "phone": "string",
  "address": "string"
}

Responses
Code	Description	Links
200	

Успех
Media type
Controls Accept header.

{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "iin": "string",
  "firstName": "string",
  "lastName": "string",
  "middleName": "string",
  "username": "string",
  "birthDate": "2026-07-20",
  "gender": "MALE",
  "email": "string",
  "phone": "string",
  "city": "string",
  "address": "string",
  "disabledGroup": "FIRST",
  "status": "GREEN",
  "imagePath": "string",
  "practitionerId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "practitionerFullName": "string",
  "currentDevices": [
    {
      "deviceId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "deviceName": "string",
      "deviceType": "PROSTHESIS",
      "issuedAt": "2026-07-20T13:46:59.332Z",
      "observationEndsAt": "2026-07-20T13:46:59.332Z",
      "remainingObservationDays": 0
    }
  ],
  "createdAt": "2026-07-20T13:46:59.332Z",
  "updatedAt": "2026-07-20T13:46:59.332Z"
}

	No links
401	

Не авторизован
Media type

{
  "status": "401",
  "message": "Требуется авторизация"
}

	No links
403	

Нет доступа
Media type

{
  "status": "403",
  "message": "Недостаточно прав для выполнения операции"
}

	No links
404	

Не найдено
Media type

{
  "status": "404",
  "message": "Пациент с таким id не найден"
}

	No links
GET
/patients/{id}/status-history
История изменений статуса пациента
Parameters
Name	Description
id *
string($uuid)
(path)
	
Responses
Code	Description	Links
200	

Успех
Media type
Controls Accept header.

[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "patientId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "status": "GREEN",
    "changedByPractitionerId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "changedByFullName": "string",
    "changedAt": "2026-07-20T13:46:59.337Z",
    "comment": "string"
  }
]

	No links
401	

Не авторизован
Media type

{
  "status": "401",
  "message": "Требуется авторизация"
}

	No links
404	

Не найдено
Media type

{
  "status": "404",
  "message": "Пациент с таким id не найден"
}

	No links
GET
/patients/export
Экспорт информации о пациентах в CSV

Требуется роль ADMIN
Parameters

No parameters
Responses
Code	Description	Links
200	

Успех
Media type
Controls Accept header.

string

	No links
401	

Не авторизован
Media type

{
  "status": "401",
  "message": "Требуется авторизация"
}

	No links
403	

Нет доступа
Media type

{
  "status": "403",
  "message": "Недостаточно прав для выполнения операции"
}

	No links
500	

Ошибка на сервере
Media type

{
  "status": "500",
  "message": "Ошибка на сервере"
}

	No links
Чат
GET
/patients/{patientId}/chat/messages
Получение всей переписки с пациентом (врачом)

Требуется роль PRACTITIONER. Непрочитанные сообщения от пациента при этом помечаются прочитанными
Parameters
Name	Description
patientId *
string($uuid)
(path)
	
Responses
Code	Description	Links
200	

Успех
Media type
Controls Accept header.

[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "patientId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "patientFullName": "string",
    "practitionerId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "practitionerFullName": "string",
    "senderType": "PATIENT",
    "content": "string",
    "imageUrl": "string",
    "sentAt": "2026-07-20T13:46:59.342Z",
    "readAt": "2026-07-20T13:46:59.342Z"
  }
]

	No links
401	

Не авторизован
Media type

{
  "status": "401",
  "message": "Требуется авторизация"
}

	No links
403	

Пациент закреплён за другим специалистом
Media type

{
  "status": "403",
  "message": "Пациент закреплён за другим специалистом"
}

	No links
404	

Не найдено
Media type

{
  "status": "404",
  "message": "Пациент с таким id не найден"
}

	No links
POST
/patients/{patientId}/chat/messages
Отправка текстового сообщения пациенту (врачом)

Требуется роль PRACTITIONER. Пациент должен быть закреплён за вызывающим врачом
Parameters
Name	Description
patientId *
string($uuid)
(path)
	
Request body

{
  "content": "string"
}

Responses
Code	Description	Links
201	

CREATED
Media type
Controls Accept header.

{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "patientId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "patientFullName": "string",
  "practitionerId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "practitionerFullName": "string",
  "senderType": "PATIENT",
  "content": "string",
  "imageUrl": "string",
  "sentAt": "2026-07-20T13:46:59.348Z",
  "readAt": "2026-07-20T13:46:59.348Z"
}

	No links
401	

Не авторизован
Media type

{
  "status": "401",
  "message": "Требуется авторизация"
}

	No links
403	

Пациент закреплён за другим специалистом
Media type

{
  "status": "403",
  "message": "Пациент закреплён за другим специалистом"
}

	No links
404	

Не найдено
Media type

{
  "status": "404",
  "message": "Пациент с таким id не найден"
}

	No links
POST
/patients/{patientId}/chat/messages/photo
Отправка сообщения с фото пациенту (врачом)

Требуется роль PRACTITIONER. multipart/form-data: photo — файл изображения, content — необязательная подпись
Parameters
Name	Description
patientId *
string($uuid)
(path)
	
Request body
content
string
	
photo
string($binary)
	
Responses
Code	Description	Links
201	

CREATED
Media type
Controls Accept header.

{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "patientId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "patientFullName": "string",
  "practitionerId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "practitionerFullName": "string",
  "senderType": "PATIENT",
  "content": "string",
  "imageUrl": "string",
  "sentAt": "2026-07-20T13:46:59.355Z",
  "readAt": "2026-07-20T13:46:59.355Z"
}

	No links
400	

Пустое сообщение или недопустимый тип файла
Media type

{
  "status": "400",
  "message": "Сообщение должно содержать текст или фото"
}

	No links
403	

Пациент закреплён за другим специалистом
Media type

{
  "status": "403",
  "message": "Пациент закреплён за другим специалистом"
}

	No links
404	

Не найдено
Media type

{
  "status": "404",
  "message": "Пациент с таким id не найден"
}

	No links
GET
/chat/messages
Получение всей переписки со своим врачом (пациентом)

Требуется роль PATIENT. Непрочитанные сообщения от врача при этом помечаются прочитанными
Parameters

No parameters
Responses
Code	Description	Links
200	

Успех
Media type
Controls Accept header.

[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "patientId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "patientFullName": "string",
    "practitionerId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "practitionerFullName": "string",
    "senderType": "PATIENT",
    "content": "string",
    "imageUrl": "string",
    "sentAt": "2026-07-20T13:46:59.360Z",
    "readAt": "2026-07-20T13:46:59.360Z"
  }
]

	No links
401	

Не авторизован
Media type

{
  "status": "401",
  "message": "Требуется авторизация"
}

	No links
403	

Нет доступа
Media type

{
  "status": "403",
  "message": "Недостаточно прав для выполнения операции"
}

	No links
POST
/chat/messages
Отправка текстового сообщения своему врачу (пациентом)

Требуется роль PATIENT. Получатель — врач, закреплённый за пациентом
Parameters

No parameters
Request body

{
  "content": "string"
}

Responses
Code	Description	Links
201	

CREATED
Media type
Controls Accept header.

{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "patientId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "patientFullName": "string",
  "practitionerId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "practitionerFullName": "string",
  "senderType": "PATIENT",
  "content": "string",
  "imageUrl": "string",
  "sentAt": "2026-07-20T13:46:59.363Z",
  "readAt": "2026-07-20T13:46:59.363Z"
}

	No links
400	

У пациента нет закреплённого врача
Media type

{
  "status": "400",
  "message": "Вам ещё не назначен лечащий специалист — отправка сообщений недоступна"
}

	No links
401	

Не авторизован
Media type

{
  "status": "401",
  "message": "Требуется авторизация"
}

	No links
403	

Нет доступа
Media type

{
  "status": "403",
  "message": "Недостаточно прав для выполнения операции"
}

	No links
POST
/chat/messages/photo
Отправка сообщения с фото своему врачу (пациентом)

Требуется роль PATIENT. multipart/form-data: photo — файл изображения, content — необязательная подпись
Parameters

No parameters
Request body
content
string
	
photo
string($binary)
	
Responses
Code	Description	Links
201	

CREATED
Media type
Controls Accept header.

{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "patientId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "patientFullName": "string",
  "practitionerId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "practitionerFullName": "string",
  "senderType": "PATIENT",
  "content": "string",
  "imageUrl": "string",
  "sentAt": "2026-07-20T13:46:59.370Z",
  "readAt": "2026-07-20T13:46:59.370Z"
}

	No links
400	

Пустое сообщение или недопустимый тип файла
Media type

{
  "status": "400",
  "message": "Сообщение должно содержать текст или фото"
}

	No links
401	

Не авторизован
Media type

{
  "status": "401",
  "message": "Требуется авторизация"
}

	No links
403	

Нет доступа
Media type

{
  "status": "403",
  "message": "Недостаточно прав для выполнения операции"
}

	No links
GET
/chat/unread
Получение непрочитанных сообщений от всех пациентов (врачом)

Требуется роль PRACTITIONER. Сводно по всем закреплённым пациентам; сообщения прочитанными НЕ помечаются (для счётчика/бейджа)
Parameters

No parameters
Responses
Code	Description	Links
200	

Успех
Media type
Controls Accept header.

[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "patientId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "patientFullName": "string",
    "practitionerId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "practitionerFullName": "string",
    "senderType": "PATIENT",
    "content": "string",
    "imageUrl": "string",
    "sentAt": "2026-07-20T13:46:59.373Z",
    "readAt": "2026-07-20T13:46:59.373Z"
  }
]

	No links
401	

Не авторизован
Media type

{
  "status": "401",
  "message": "Требуется авторизация"
}

	No links
403	

Пациент закреплён за другим специалистом
Media type

{
  "status": "403",
  "message": "Пациент закреплён за другим специалистом"
}

	No links
GET
/chat/messages/unread
Получение непрочитанных сообщений от врача (пациентом)

Требуется роль PATIENT. Сообщения прочитанными НЕ помечаются (для счётчика/бейджа)
Parameters

No parameters
Responses
Code	Description	Links
200	

Успех
Media type
Controls Accept header.

[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "patientId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "patientFullName": "string",
    "practitionerId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "practitionerFullName": "string",
    "senderType": "PATIENT",
    "content": "string",
    "imageUrl": "string",
    "sentAt": "2026-07-20T13:46:59.376Z",
    "readAt": "2026-07-20T13:46:59.376Z"
  }
]

	No links
401	

Не авторизован
Media type

{
  "status": "401",
  "message": "Требуется авторизация"
}

	No links
403	

Нет доступа
Media type

{
  "status": "403",
  "message": "Недостаточно прав для выполнения операции"
}

	No links
Мед. организации
GET
/organizations
Поиск всех мед. организаций
Parameters

No parameters
Responses
Code	Description	Links
200	

Успех
Media type
Controls Accept header.

[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "string",
    "type": "string",
    "code": "string",
    "description": "string",
    "city": "string",
    "address": "string",
    "createdAt": "2026-07-20T13:46:59.379Z",
    "updatedAt": "2026-07-20T13:46:59.379Z"
  }
]

	No links
401	

Не авторизован
Media type

{
  "status": "401",
  "message": "Требуется авторизация"
}

	No links
POST
/organizations
Добавление мед. организации

Требуется роль ADMIN
Parameters

No parameters
Request body

{
  "name": "string",
  "type": "string",
  "code": "string",
  "description": "string",
  "city": "string",
  "address": "string"
}

Responses
Code	Description	Links
201	

CREATED
Media type
Controls Accept header.

{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "string",
  "type": "string",
  "code": "string",
  "description": "string",
  "city": "string",
  "address": "string",
  "createdAt": "2026-07-20T13:46:59.382Z",
  "updatedAt": "2026-07-20T13:46:59.382Z"
}

	No links
401	

Не авторизован
Media type

{
  "status": "401",
  "message": "Требуется авторизация"
}

	No links
403	

Доступ запрещен
Media type

{
  "status": "403",
  "message": "Недостаточно прав для выполнения операции"
}

	No links
409	

Уже существует
Media type

{
  "status": "409",
  "message": "Организация с таким названием уже существует"
}

	No links
GET
/organizations/{id}
Поиск мед. организации по id
Parameters
Name	Description
id *
string($uuid)
(path)
	
Responses
Code	Description	Links
200	

Успех
Media type
Controls Accept header.

{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "string",
  "type": "string",
  "code": "string",
  "description": "string",
  "city": "string",
  "address": "string",
  "createdAt": "2026-07-20T13:46:59.388Z",
  "updatedAt": "2026-07-20T13:46:59.388Z"
}

	No links
401	

Не авторизован
Media type

{
  "status": "401",
  "message": "Требуется авторизация"
}

	No links
404	

Не найдено
Media type

{
  "status": "404",
  "message": "Организации с таким id не существует"
}

	No links
Изделия (протезы/ортезы)
GET
/devices
Поиск всех изделий
Parameters

No parameters
Responses
Code	Description	Links
200	

Успех
Media type
Controls Accept header.

[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "type": "PROSTHESIS",
    "name": "string",
    "code": "string",
    "targetBodyPart": "ARM",
    "expectedYears": 0,
    "expectedMonths": 0,
    "expectedDays": 0,
    "description": "string",
    "manufacturer": "string",
    "organizationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "organizationName": "string",
    "createdAt": "2026-07-20T13:46:59.390Z",
    "updatedAt": "2026-07-20T13:46:59.390Z"
  }
]

	No links
401	

Не авторизован
Media type

{
  "status": "401",
  "message": "Требуется авторизация"
}

	No links
POST
/devices
Добавление изделия

Требуется роль ADMIN или PRACTITIONER
Parameters

No parameters
Request body

{
  "type": "PROSTHESIS",
  "name": "string",
  "code": "string",
  "targetBodyPart": "ARM",
  "expectedYears": 0,
  "expectedMonths": 0,
  "expectedDays": 0,
  "description": "string",
  "manufacturer": "string",
  "organizationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}

Responses
Code	Description	Links
201	

CREATED
Media type
Controls Accept header.

{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "type": "PROSTHESIS",
  "name": "string",
  "code": "string",
  "targetBodyPart": "ARM",
  "expectedYears": 0,
  "expectedMonths": 0,
  "expectedDays": 0,
  "description": "string",
  "manufacturer": "string",
  "organizationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "organizationName": "string",
  "createdAt": "2026-07-20T13:46:59.395Z",
  "updatedAt": "2026-07-20T13:46:59.395Z"
}

	No links
401	

Не авторизован
Media type

{
  "status": "401",
  "message": "Требуется авторизация"
}

	No links
403	

Доступ запрещен
Media type

{
  "status": "403",
  "message": "Недостаточно прав для выполнения операции"
}

	No links
404	

Не найдено
Media type

{
  "status": "401",
  "message": "Организация с таким id не найдена"
}

	No links
GET
/devices/{id}
Поиск изделия по id
Parameters
Name	Description
id *
string($uuid)
(path)
	
Responses
Code	Description	Links
200	

Успех
Media type
Controls Accept header.

{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "type": "PROSTHESIS",
  "name": "string",
  "code": "string",
  "targetBodyPart": "ARM",
  "expectedYears": 0,
  "expectedMonths": 0,
  "expectedDays": 0,
  "description": "string",
  "manufacturer": "string",
  "organizationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "organizationName": "string",
  "createdAt": "2026-07-20T13:46:59.399Z",
  "updatedAt": "2026-07-20T13:46:59.399Z"
}

	No links
401	

Не авторизован
Media type

{
  "status": "401",
  "message": "Требуется авторизация"
}

	No links
404	

Не найдено
Media type

{
  "status": "404",
  "message": "Изделия с таким id не существует"
}

	No links
Акты выдачи изделий
POST
/device-dispenses
Добавление информации об акте выдаче изделия

Требуется роль PRACTITIONER
Parameters

No parameters
Request body

{
  "patientId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "deviceId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "issuedAt": "2026-07-20T13:46:59.403Z",
  "observeYears": 0,
  "observeMonths": 0,
  "observeDays": 0,
  "notes": "string"
}

Responses
Code	Description	Links
201	

CREATED
Media type
Controls Accept header.

{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "patientId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "patientFullName": "string",
  "deviceId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "deviceName": "string",
  "practitionerId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "practitionerFullName": "string",
  "issuedAt": "2026-07-20T13:46:59.404Z",
  "observeYears": 0,
  "observeMonths": 0,
  "observeDays": 0,
  "notes": "string",
  "createdAt": "2026-07-20T13:46:59.404Z"
}

	No links
401	

Не авторизован
Media type

{
  "status": "401",
  "message": "Требуется авторизация"
}

	No links
403	

Доступ запрещен
Media type

{
  "status": "403",
  "message": "Недостаточно прав для выполнения операции"
}

	No links
404	

Уже существует
Media type

{
  "status": "404",
  "message": "Пациент не найден"
}

	No links
GET
/patients/{patientId}/device-dispenses
Поиск всех актов выдачи изделий конкретному пациенту

Требуется роль PRACTITIONER или ADMIN
Parameters
Name	Description
patientId *
string($uuid)
(path)
	
only_observable
boolean
(query)
	

Фильтр: включить информацию только об актах выдачи изделий, все еще находящихся под наблюдением

Default value : false

Example : false
Responses
Code	Description	Links
200	

Успех
Media type
Controls Accept header.

[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "patientId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "patientFullName": "string",
    "deviceId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "deviceName": "string",
    "practitionerId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "practitionerFullName": "string",
    "issuedAt": "2026-07-20T13:46:59.411Z",
    "observeYears": 0,
    "observeMonths": 0,
    "observeDays": 0,
    "notes": "string",
    "createdAt": "2026-07-20T13:46:59.411Z"
  }
]

	No links
401	

Не авторизован
Media type

{
  "status": "401",
  "message": "Требуется авторизация"
}

	No links
404	

Не найдено
Media type

{
  "status": "404",
  "message": "Не найдено"
}

	No links
GET
/device-dispenses/{id}
Поиск акта выдачи по id
Parameters
Name	Description
id *
string($uuid)
(path)
	
Responses
Code	Description	Links
200	

Успех
Media type
Controls Accept header.

{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "patientId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "patientFullName": "string",
  "deviceId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "deviceName": "string",
  "practitionerId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "practitionerFullName": "string",
  "issuedAt": "2026-07-20T13:46:59.414Z",
  "observeYears": 0,
  "observeMonths": 0,
  "observeDays": 0,
  "notes": "string",
  "createdAt": "2026-07-20T13:46:59.414Z"
}

	No links
401	

Не авторизован
Media type

{
  "status": "401",
  "message": "Требуется авторизация"
}

	No links
404	

Не найдено
Media type

{
  "status": "404",
  "message": "Не найдено"
}

	No links
GET
/device-dispenses/me
Поиск всех актов выдачи (собственных - для запрашиваемого пациента)

Требуется роль PATIENT
Parameters
Name	Description
only_observable
boolean
(query)
	

Фильтр: включить информацию только об актах выдачи изделий, все еще находящихся под наблюдением

Default value : false

Example : false
Responses
Code	Description	Links
200	

Успех
Media type
Controls Accept header.

[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "patientId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "patientFullName": "string",
    "deviceId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "deviceName": "string",
    "practitionerId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "practitionerFullName": "string",
    "issuedAt": "2026-07-20T13:46:59.419Z",
    "observeYears": 0,
    "observeMonths": 0,
    "observeDays": 0,
    "notes": "string",
    "createdAt": "2026-07-20T13:46:59.419Z"
  }
]

	No links
401	

Не авторизован
Media type

{
  "status": "401",
  "message": "Требуется авторизация"
}

	No links
403	

Доступ запрещен
Media type

{
  "status": "403",
  "message": "Недостаточно прав для выполнения операции"
}

	No links
404	

Не найдено
Media type

{
  "status": "404",
  "message": "Пациент с таким id не существует"
}

	No links
Жалобы на изделия
GET
/device-complains
Жалобы всех прикреплённых пациентов

Требуется роль PRACTITIONER. Сортировка по статусу пациента — сначала жалобы красных, затем жёлтых и зелёных
Parameters
Name	Description
not_reviewed
boolean
(query)
	

Фильтр: только нерассмотренные жалобы

Default value : false

Example : false
Responses
Code	Description	Links
200	

Успех
Media type
Controls Accept header.

[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "patientId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "patientFullName": "string",
    "deviceDispenseId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "deviceId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "deviceName": "string",
    "reason": "BREAKAGE",
    "comment": "string",
    "status": "PENDING",
    "reviewedByPractitionerId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "reviewedByFullName": "string",
    "reviewedAt": "2026-07-20T13:46:59.424Z",
    "reviewDecision": "string",
    "photos": [
      {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "imagePath": "string"
      }
    ],
    "createdAt": "2026-07-20T13:46:59.424Z"
  }
]

	No links
401	

Не авторизован
Media type

{
  "status": "401",
  "message": "Требуется авторизация"
}

	No links
403	

Нет доступа
Media type

{
  "status": "403",
  "message": "Недостаточно прав для выполнения операции"
}

	No links
POST
/device-complains
Подача жалобы на изделие (пациентом)

Требуется роль PATIENT. multipart/form-data: reason — причина, comment — комментарий, deviceDispenseId — акт выдачи изделия, photos — фото проблемных мест. Лечащий врач пациента получает уведомление на почту
Parameters

No parameters
Request body
reason *
string
	
comment
string
	
deviceDispenseId *
string($uuid)
	
photos
array<string>
	
Responses
Code	Description	Links
201	

CREATED
Media type
Controls Accept header.

{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "patientId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "patientFullName": "string",
  "deviceDispenseId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "deviceId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "deviceName": "string",
  "reason": "BREAKAGE",
  "comment": "string",
  "status": "PENDING",
  "reviewedByPractitionerId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "reviewedByFullName": "string",
  "reviewedAt": "2026-07-20T13:46:59.429Z",
  "reviewDecision": "string",
  "photos": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "imagePath": "string"
    }
  ],
  "createdAt": "2026-07-20T13:46:59.429Z"
}

	No links
400	

Некорректный запрос (например, чужая выдача изделия или недопустимый тип файла)
Media type

{
  "status": "400",
  "message": "Указанная выдача изделия не относится к вам"
}

	No links
401	

Не авторизован
Media type

{
  "status": "401",
  "message": "Требуется авторизация"
}

	No links
403	

Нет доступа
Media type

{
  "status": "403",
  "message": "Недостаточно прав для выполнения операции"
}

	No links
PATCH
/device-complains/{id}/review
Рассмотрение жалобы

Требуется роль PRACTITIONER. Рассмотреть можно только жалобу своего пациента. Фиксируются статус, решение (reviewDecision), проверяющий и время; пациент получает уведомление на почту
Parameters
Name	Description
id *
string($uuid)
(path)
	
Request body

{
  "status": "PENDING",
  "reviewDecision": "string"
}

Responses
Code	Description	Links
200	

Успех
Media type
Controls Accept header.

{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "patientId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "patientFullName": "string",
  "deviceDispenseId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "deviceId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "deviceName": "string",
  "reason": "BREAKAGE",
  "comment": "string",
  "status": "PENDING",
  "reviewedByPractitionerId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "reviewedByFullName": "string",
  "reviewedAt": "2026-07-20T13:46:59.436Z",
  "reviewDecision": "string",
  "photos": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "imagePath": "string"
    }
  ],
  "createdAt": "2026-07-20T13:46:59.436Z"
}

	No links
401	

Не авторизован
Media type

{
  "status": "401",
  "message": "Требуется авторизация"
}

	No links
403	

Жалоба пациента другого специалиста
Media type

{
  "status": "403",
  "message": "Жалоба принадлежит пациенту другого специалиста"
}

	No links
404	

Не найдено
Media type

{
  "status": "404",
  "message": "Жалоба с таким id не найдена"
}

	No links
GET
/patients/{patientId}/device-complains
Жалобы конкретного пациента

Требуется роль PRACTITIONER. Пациент должен быть закреплён за вызывающим врачом
Parameters
Name	Description
patientId *
string($uuid)
(path)
	
not_reviewed
boolean
(query)
	

Фильтр: только нерассмотренные жалобы

Default value : false

Example : false
Responses
Code	Description	Links
200	

Успех
Media type
Controls Accept header.

[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "patientId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "patientFullName": "string",
    "deviceDispenseId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "deviceId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "deviceName": "string",
    "reason": "BREAKAGE",
    "comment": "string",
    "status": "PENDING",
    "reviewedByPractitionerId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "reviewedByFullName": "string",
    "reviewedAt": "2026-07-20T13:46:59.442Z",
    "reviewDecision": "string",
    "photos": [
      {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "imagePath": "string"
      }
    ],
    "createdAt": "2026-07-20T13:46:59.442Z"
  }
]

	No links
401	

Не авторизован
Media type

{
  "status": "401",
  "message": "Требуется авторизация"
}

	No links
403	

Пациент закреплён за другим специалистом
Media type

{
  "status": "403",
  "message": "Пациент закреплён за другим специалистом"
}

	No links
404	

Не найдено
Media type

{
  "status": "404",
  "message": "Пациент с таким id не найден"
}

	No links
GET
/patients/{patientId}/device-complains/export-pdf
Экспорт жалоб пациента в PDF

Требуется роль PRACTITIONER. Пациент должен быть закреплён за вызывающим врачом. PDF содержит все жалобы пациента: дата, изделие, причина, комментарий, статус, решение
Parameters
Name	Description
patientId *
string($uuid)
(path)
	
Responses
Code	Description	Links
200	

Успех (application/pdf)
Media type
Controls Accept header.

string

	No links
401	

Не авторизован
Media type

{
  "status": "401",
  "message": "Требуется авторизация"
}

	No links
403	

Пациент закреплён за другим специалистом
Media type

{
  "status": "403",
  "message": "Пациент закреплён за другим специалистом"
}

	No links
404	

Не найдено
Media type

{
  "status": "404",
  "message": "Пациент с таким id не найден"
}

	No links
GET
/device-complains/{id}
Поиск жалобы по id
Parameters
Name	Description
id *
string($uuid)
(path)
	
Responses
Code	Description	Links
200	

Успех
Media type
Controls Accept header.

{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "patientId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "patientFullName": "string",
  "deviceDispenseId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "deviceId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "deviceName": "string",
  "reason": "BREAKAGE",
  "comment": "string",
  "status": "PENDING",
  "reviewedByPractitionerId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "reviewedByFullName": "string",
  "reviewedAt": "2026-07-20T13:46:59.451Z",
  "reviewDecision": "string",
  "photos": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "imagePath": "string"
    }
  ],
  "createdAt": "2026-07-20T13:46:59.451Z"
}

	No links
401	

Не авторизован
Media type

{
  "status": "401",
  "message": "Требуется авторизация"
}

	No links
404	

Не найдено
Media type

{
  "status": "404",
  "message": "Жалоба не найдена"
}

	No links
GET
/device-complains/my
Просмотр своих жалоб (пациентом)

Требуется роль PATIENT
Parameters
Name	Description
reviewed
boolean
(query)
	

Фильтр: только рассмотренные жалобы

Default value : false

Example : false
Responses
Code	Description	Links
200	

Успех
Media type
Controls Accept header.

[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "patientId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "patientFullName": "string",
    "deviceDispenseId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "deviceId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "deviceName": "string",
    "reason": "BREAKAGE",
    "comment": "string",
    "status": "PENDING",
    "reviewedByPractitionerId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "reviewedByFullName": "string",
    "reviewedAt": "2026-07-20T13:46:59.455Z",
    "reviewDecision": "string",
    "photos": [
      {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "imagePath": "string"
      }
    ],
    "createdAt": "2026-07-20T13:46:59.455Z"
  }
]

	No links
401	

Не авторизован
Media type

{
  "status": "401",
  "message": "Требуется авторизация"
}

	No links
403	

Нет доступа
Media type

{
  "status": "403",
  "message": "Недостаточно прав для выполнения операции"
}

	No links
Аутентификация. Управление токенами, сессиями
POST
/auth/refresh-access-token
Обновление токена доступа

Токен доступа можно обновить по refresh токену
Parameters

No parameters
Request body

{
  "refresh_token": "string"
}

Responses
Code	Description	Links
200	

Успешное обновление токена доступа
Media type
Controls Accept header.

{
  "role": "PATIENT",
  "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "access_token": "string",
  "refresh_token": "string"
}

	No links
400	

Некорректный запрос (например, неправильно сконфигурирован токен/токен истек/токен отсутствует)
Media type

{
  "status": "400",
  "message": "Refresh токен истек или неправильно сконфигурирован"
}

	No links
404	

Пользователь, которому принадлежит токен, не найден
Media type

{
  "status": "404",
  "message": "Пользователь не найден"
}

	No links
POST
/auth/make-auth
Аутентификация пользователя
Parameters

No parameters
Request body

{
  "email": "string",
  "password": "string"
}

Responses
Code	Description	Links
200	

Успешная аутентификация
Media type
Controls Accept header.

{
  "role": "PATIENT",
  "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "access_token": "string",
  "refresh_token": "string"
}

	No links
400	

Некорректный запрос (например, неверные данные или данные отсутствуют)
Media type

{
  "status": "400",
  "message": "Поле email не может быть пустым"
}

	No links
401	

Неуспешная аутентификация (введены неверные данные/аккаунт не активирован/аккаунт заблокирован)
Media type

{
  "status": "401",
  "message": "Ошибка аутентификации. Введеные неправильные данные"
}

	No links
POST
/auth/logout
Завершение сессии

Инвалидация access и refresh токенов пользователя
Parameters

No parameters
Responses
Code	Description	Links
200	

Успешное завершение сессии
Media type
Controls Accept header.

{}

	No links
401	

Пользователь не аутентифицирован
Media type

{}

	No links
PATCH
/auth/password/update
Обновление пароля
Parameters

No parameters
Request body

{
  "old_password": "string",
  "new_password": "string"
}

Responses
Code	Description	Links
200	

Успех
Media type
Controls Accept header.

{}

	No links
400	

Неправильно введен старый пароль
Media type

{
  "status": "400",
  "message": "Неправильно введен старый пароль"
}

	No links
401	

Пользователь не аутентифицирован
Media type

{}

	No links
Управление файлами
GET
/files
Получение файла по path (путь)
Parameters
Name	Description
path *
string
(query)
	
Responses
Code	Description	Links
200	

Успех
Media type
Controls Accept header.

string

	No links
401	

Не авторизован
Media type

{
  "status": "401",
  "message": "Требуется авторизация"
}

	No links
404	

Не найдено
Media type

{
  "status": "404",
  "message": "Файл не найден по пути"
}

	No links
Schemas
object

    deviceId
    stringuuid
    painLevel
    integer[0, 10]int32
    discomfortLevel
    integer[1, 10]int32
    mobilityLevel
    integer[0, 10]int32
    sleepQuality
    integer[0, 10]int32
    comment
    string

object

    id
    stringuuid
    patientId
    stringuuid
    patientFullName
    string

string
deviceId
stringuuid
deviceName
string

    string
    submittedAt
    stringdate-time
    painLevel
    integerint32
    discomfortLevel
    integerint32
    mobilityLevel
    integerint32
    sleepQuality
    integerint32
    comment
    string
    checkedByPractitionerId
    stringuuid
    checkedByFullName
    string
    checkedAt
    stringdate-time

object

    name
    string≥ 1 characters
    code
    string

object

    id
    stringuuid
    name
    string
    code
    string

object

    firstName
    string≥ 1 characters
    lastName
    string≥ 1 characters
    middleName
    string
    iin
    string≥ 1 characters
    email
    stringemail≥ 1 characters
    phone
    string≥ 1 characters
    organizationId
    stringuuid
    licenseNumber
    string≥ 1 characters

    array<string>≥ 1 items
    Items
    stringuuid
    photo
    stringbinary

object

    id
    stringuuid
    firstName
    string
    lastName
    string
    middleName
    string
    phone
    string
    email
    string
    licenseNumber
    string
    organizationId
    stringuuid
    organizationName
    string
    imagePath
    string
    createdAt
    stringdate-time
    updatedAt
    stringdate-time
    iin
    string

array<object>

    object
        id
        stringuuid
        name
        string
        code
        string

object

    iin
    string≥ 1 charactersmatches \d{12}
    firstName
    string≥ 1 characters
    lastName
    string≥ 1 characters
    middleName
    string
    birthDate
    stringdate

string
array

    #0"MALE"
    #1"FEMALE"
    #2"OTHER"

email
stringemail≥ 1 characters
phone
string≥ 1 characters
city
string≥ 1 characters
address
string≥ 1 characters
string

    array
        #0"FIRST"
        #1"SECOND"
        #2"THIRD"
    photo
    stringbinary

object
object

    id
    stringuuid
    iin
    string
    firstName
    string
    lastName
    string
    middleName
    string
    username
    string
    birthDate
    stringdate

string
array

    #0"MALE"
    #1"FEMALE"
    #2"OTHER"

email
string
phone
string
city
string
address
string
string
array

    #0"FIRST"
    #1"SECOND"
    #2"THIRD"

string
array

    #0"GREEN"
    #1"YELLOW"
    #2"RED"

imagePath
string
practitionerId
stringuuid
practitionerFullName
string
array<object>
object

    deviceId
    stringuuid
    deviceName
    string

string

        array
            #0"PROSTHESIS"
            #1"ORTHOSIS"
        issuedAt
        stringdate-time
        observationEndsAt
        stringdate-time
        remainingObservationDays
        integerint64
    createdAt
    stringdate-time
    updatedAt
    stringdate-time

object

    content
    string≥ 1 characters

object

    id
    stringuuid
    patientId
    stringuuid
    patientFullName
    string
    practitionerId
    stringuuid
    practitionerFullName
    string

string

    array
        #0"PATIENT"
        #1"PRACTITIONER"
    content
    string
    imageUrl
    string
    sentAt
    stringdate-time
    readAt
    stringdate-time

object

    content
    string
    photo
    stringbinary

object
object

    id
    stringuuid
    name
    string
    type
    string
    code
    string
    description
    string
    city
    string
    address
    string
    createdAt
    stringdate-time
    updatedAt
    stringdate-time

object

string
array

    #0"PROSTHESIS"
    #1"ORTHOSIS"

name
string≥ 1 characters
code
string
string

    array
        #0"ARM"
        #1"LEG"
        #2"BACK"
        #3"NECK"
    expectedYears
    integerint32
    expectedMonths
    integerint32
    expectedDays
    integerint32
    description
    string
    manufacturer
    string≥ 1 characters
    organizationId
    stringuuid

object

    id
    stringuuid

string
array

    #0"PROSTHESIS"
    #1"ORTHOSIS"

name
string
code
string
string

    array
        #0"ARM"
        #1"LEG"
        #2"BACK"
        #3"NECK"
    expectedYears
    integerint32
    expectedMonths
    integerint32
    expectedDays
    integerint32
    description
    string
    manufacturer
    string
    organizationId
    stringuuid
    organizationName
    string
    createdAt
    stringdate-time
    updatedAt
    stringdate-time

object

    patientId
    stringuuid
    deviceId
    stringuuid
    issuedAt
    stringdate-time
    observeYears
    integerint32
    observeMonths
    integerint32
    observeDays
    integerint32
    notes
    string

object

    id
    stringuuid
    patientId
    stringuuid
    patientFullName
    string
    deviceId
    stringuuid
    deviceName
    string
    practitionerId
    stringuuid
    practitionerFullName
    string
    issuedAt
    stringdate-time
    observeYears
    integerint32
    observeMonths
    integerint32
    observeDays
    integerint32
    notes
    string
    createdAt
    stringdate-time

object

string
array

    #0"BREAKAGE"
    #1"WEAR_AND_TEAR"
    #2"DISCOMFORT"
    #3"OTHER"

comment
string
deviceDispenseId
stringuuid

    array<string>
    Items
    stringbinary

object
object
object

    refresh_token
    string≥ 1 characters

object

string

    array
        #0"PATIENT"
        #1"PRACTITIONER"
        #2"ADMIN"
    user_id
    stringuuid
    access_token
    string
    refresh_token
    string

object

    email
    string≥ 1 characters
    password
    string≥ 1 characters

object

    phone
    string≥ 1 characters

object

string

    array
        #0"GREEN"
        #1"YELLOW"
        #2"RED"
    comment
    string

object

    id
    stringuuid
    patientId
    stringuuid

string

    array
        #0"GREEN"
        #1"YELLOW"
        #2"RED"
    changedByPractitionerId
    stringuuid
    changedByFullName
    string
    changedAt
    stringdate-time
    comment
    string

object

    phone
    string
    address
    string

object

string

    array
        #0"PENDING"
        #1"IN_REVIEW"
        #2"APPROVED"
        #3"REJECTED"
        #4"COMPLETED"
    reviewDecision
    string≥ 1 characters

object

    old_password
    string≥ 1 characters
    new_password
    string≥ 1 characters

