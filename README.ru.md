# Pro-Control

> **English:** [README.en.md](./README.en.md)

**Веб-приложение для управления проектами, задачами и мониторинга выполнения работ в организации.**
Дипломный проект (ВКР), группа **ИСТб-21**.

| | |
|---|---|
| **Автор** | Габдуалиев Акбар Нуржанович |
| **Тема** | Разработка web-приложения управления проектами и задачами Pro-Control |
| **Статус** | Защищён, готов к локальному развёртыванию и демонстрации |

---

## О проекте

Pro-Control — fullstack-система для постановки и контроля задач в рамках проектов. Приложение объединяет REST API на Node.js и клиентский интерфейс на React.

**Основные возможности:**

- регистрация и вход по JWT, роли **admin** и **member**;
- админ-панель: KPI, диаграммы распределения задач и приоритетов, график динамики;
- управление пользователями, проектами и задачами;
- канбан и табличный вид задач, фильтрация по статусу и исполнителю;
- чеклисты, лента активности, смена статуса и приоритета;
- раздел «Дедлайны» для контроля сроков;
- экспорт отчётов в Excel;
- загрузка аватара пользователя.

Сценарий «проект → задачи → исполнители → сроки → статусы» реализован end-to-end и покрыт демонстрационными данными.

> Подробная инструкция для быстрого запуска перед показом — в файле [VKR.md](./VKR.md).

---

## Технологический стек

### Backend

| Технология | Назначение |
|---|---|
| **Node.js** + **Express** | HTTP API |
| **MongoDB** + **Mongoose** | Хранение данных |
| **JWT** | Аутентификация |
| **bcryptjs** | Хеширование паролей |
| **Multer** | Загрузка файлов |
| **ExcelJS** | Excel-отчёты |
| **dotenv** | Переменные окружения |
| **CORS** | Доступ с фронтенда |

### Frontend

| Технология | Назначение |
|---|---|
| **React 19** + **Vite 6** | SPA |
| **React Router 7** | Маршрутизация, layout-роуты |
| **Tailwind CSS 4** | Стили и UI |
| **Axios** | HTTP-клиент |
| **Recharts** | Графики на дашборде |
| **react-hot-toast** | Уведомления |
| **moment** | Форматирование дат |

---

## Структура репозитория

```text
pro-control/
├── backend/                 # Node.js API
│   ├── config/              # Подключение к MongoDB
│   ├── controllers/         # Бизнес-логика
│   ├── middlewares/         # JWT, загрузка файлов
│   ├── models/              # User, Project, Task
│   ├── routes/              # auth, users, tasks, projects, reports
│   ├── scripts/
│   │   └── reseed-demo.js   # Демо-данные для показа
│   ├── uploads/             # Загруженные изображения
│   └── server.js
├── frontend/
│   └── Pro-Control/         # React-приложение (Vite)
│       └── src/
│           ├── pages/       # admin, user, auth, projects, deadlines
│           ├── components/  # UI, графики, layout
│           └── utils/       # API-пути, axios
├── VKR.md                   # Краткая инструкция для демонстрации (RU)
├── README.md                # Указатель языков (GitHub)
├── README.ru.md             # Документация (RU)
└── README.en.md             # Documentation (EN)
```

### Модели данных (MongoDB)

| Коллекция | Сущность | Ключевые поля |
|---|---|---|
| `users` | Пользователь | name, email, password, role, profileImageUrl |
| `projects` | Проект | title, description, status, members, startDate, dueDate |
| `tasks` | Задача | title, status, priority, dueDate, assignedTo, todoChecklist, activity |

**Роли:** `admin` — полный доступ; `member` — свои задачи и участие в проектах.

**Статусы задач:** `Pending`, `In Progress`, `Completed`.

**Статусы проектов:** `Planning`, `Active`, `Completed`, `On Hold`.

---

## Требования

- **Node.js** 18+ (рекомендуется LTS)
- **npm** 9+
- **MongoDB** 6+ локально (`127.0.0.1:27017`) или MongoDB Compass для проверки
- Браузер с поддержкой ES-модулей

Для офлайн-демонстрации используйте **локальную MongoDB**, а не Atlas (`mongodb+srv://` требует интернет).

---

## Быстрый старт

### 1. Клонирование и зависимости

```bash
git clone <url-репозитория>
cd pro-control

cd backend
npm install

cd ../frontend/Pro-Control
npm install
```

### 2. Настройка backend

Создайте файл `backend/.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/procontrol
JWT_SECRET=your_jwt_secret_min_32_chars
ADMIN_INVITE_TOKEN=your_admin_registration_token
PORT=8000
CLIENT_URL=http://localhost:5173
```

| Переменная | Описание |
|---|---|
| `MONGO_URI` | Строка подключения к MongoDB |
| `JWT_SECRET` | Секрет для подписи JWT-токенов |
| `ADMIN_INVITE_TOKEN` | Токен при регистрации для назначения роли admin |
| `PORT` | Порт API (**8000** — совпадает с `BASE_URL` во frontend) |
| `CLIENT_URL` | Origin фронтенда для CORS |

### 3. Демонстрационные данные (рекомендуется)

Из каталога `backend/`:

```bash
npm run db:reseed-demo
```

Скрипт очищает коллекции `tasks` → `projects` → `users` и создаёт:

- **20** пользователей (1 admin + 19 member);
- **1** демо-проект;
- **11** задач с разными статусами, исполнителями и сроками.

### 4. Запуск

**Терминал 1 — backend:**

```bash
cd backend
npm run dev
```

Ожидаемый вывод: `MongoDB connected`, `Server running on port 8000`.

**Терминал 2 — frontend:**

```bash
cd frontend/Pro-Control
npm run dev
```

Откройте в браузере: **http://localhost:5173**

---

## Демонстрационные учётные записи

После `npm run db:reseed-demo`:

| Роль | Email | Пароль |
|---|---|---|
| **Администратор** | `efimova.tb@pro-control.demo` | `ProControl2025!` |
| **Участник** | `zorin@pro-control.demo` | `MemberDemo2025!` |

Полный список логинов — в [VKR.md](./VKR.md), раздел 6.

**Демо-проект:** «Разработка web-приложения управления проектами и задачами Pro-Control».

---

## API (кратко)

Базовый URL: `http://localhost:8000`

| Префикс | Назначение |
|---|---|
| `/api/auth` | Регистрация, вход, профиль, загрузка аватара |
| `/api/users` | CRUD пользователей (admin) |
| `/api/projects` | CRUD проектов |
| `/api/tasks` | CRUD задач, статус, чеклист, dashboard-data |
| `/api/reports` | Экспорт задач и пользователей в Excel |
| `/uploads` | Статические файлы (аватары) |

Защищённые маршруты требуют заголовок `Authorization: Bearer <token>`.

---

## Разделы интерфейса

### Администратор

- Панель управления — KPI, диаграммы, динамика задач
- Проекты — список и создание
- Дедлайны — контроль сроков
- Управление задачами — таблица / канбан
- Создание задачи
- Участники команды — пользователи и отчёты

### Участник (member)

- Личный дашборд
- Проекты и дедлайны (в рамках доступа)
- Мои задачи — фильтры, канбан, детали задачи

---

## Сборка для production

```bash
# Frontend
cd frontend/Pro-Control
npm run build
npm run preview

# Backend
cd backend
npm start
```

Перед production задайте надёжные `JWT_SECRET` и `ADMIN_INVITE_TOKEN`, настройте `CLIENT_URL` и reverse proxy для API.

---

## Проверка без интернета

1. Убедитесь, что `MONGO_URI` указывает на `127.0.0.1:27017`.
2. Запустите MongoDB, backend и frontend.
3. Войдите под демо-администратором и откройте проекты и задачи.

Подробный чеклист — в [VKR.md](./VKR.md), раздел 11.

---

## Устранение неполадок

| Проблема | Решение |
|---|---|
| Backend не подключается к БД | Проверьте, что MongoDB запущена; сверьте `MONGO_URI` в `.env` |
| Frontend без данных | Убедитесь, что backend запущен на порту **8000** |
| Ошибка входа | Выполните `npm run db:reseed-demo` и используйте логины из таблицы выше |
| CORS | Задайте `CLIENT_URL=http://localhost:5173` |

---

## Лицензия и назначение

Проект разработан в рамках выпускной квалификационной работы и предназначен для учебных и демонстрационных целей.
