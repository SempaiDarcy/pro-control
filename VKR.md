# Pro-Control — инструкция для демонстрации ВКР

Файл содержит краткую инструкцию по запуску проекта перед защитой.
Используется для того, чтобы быстро поднять локальную базу, backend, frontend и войти под демонстрационными пользователями.

---

## 1. Структура проекта

Проект состоит из двух основных частей:

```text
pro-control/
├── backend/
└── frontend/
    └── Pro-Control/
```

Backend работает с MongoDB и предоставляет API для пользователей, проектов и задач.
Frontend запускается через Vite и открывается в браузере.

---

## 2. База данных

Для демонстрации используется локальная MongoDB:

```text
mongodb://127.0.0.1:27017/procontrol
```

База данных называется:

```text
procontrol
```

Если подключение идёт через `127.0.0.1:27017` или `localhost:27017`, интернет для работы базы не нужен.

MongoDB Atlas без интернета не работает, поэтому для защиты нужно использовать локальную MongoDB.

---

## 3. Проверка MongoDB перед запуском

Перед запуском проекта нужно открыть MongoDB Compass и проверить подключение:

```text
127.0.0.1:27017
```

В списке баз должна быть база:

```text
procontrol
```

Основные коллекции:

```text
users
projects
tasks
```

---

## 4. Пересоздание демонстрационных данных

Команда выполняется из папки backend:

```bash
cd D:\diplom\pro-control\backend
npm run db:reseed-demo
```

Команда очищает старые демонстрационные данные и создаёт новые:

```text
users: 20
projects: 1
tasks: 11
```

Порядок очистки:

```text
tasks → projects → users
```

Это сделано для того, чтобы сначала удалить задачи, потом проекты, потом пользователей, так как задачи ссылаются на проекты и пользователей.

---

## 5. Демонстрационный администратор

Основной вход для показа системы:

```text
Email: efimova.tb@pro-control.demo
Password: ProControl2025!
Role: admin
```

Пользователь:

```text
Ефимова Татьяна Борисовна
```

В демо она используется как администратор системы.

Администратор показывает управление пользователями, доступом и общую работу системы.

---

## 6. Демонстрационные пользователи

Остальные пользователи созданы как участники проекта:

```text
gabdualiev@pro-control.demo / MemberDemo2025!
zorin@pro-control.demo / MemberDemo2025!
tikhomirov@pro-control.demo / MemberDemo2025!
zaydullin@pro-control.demo / MemberDemo2025!
morozov@pro-control.demo / MemberDemo2025!
ovod@pro-control.demo / MemberDemo2025!
listratenko@pro-control.demo / MemberDemo2025!
ivanov@pro-control.demo / MemberDemo2025!
kupasev@pro-control.demo / MemberDemo2025!
proskurin@pro-control.demo / MemberDemo2025!
simonenko@pro-control.demo / MemberDemo2025!
kudryashov@pro-control.demo / MemberDemo2025!
kekin@pro-control.demo / MemberDemo2025!
miheev@pro-control.demo / MemberDemo2025!
haydarov@pro-control.demo / MemberDemo2025!
med@pro-control.demo / MemberDemo2025!
mochkov@pro-control.demo / MemberDemo2025!
krivov@pro-control.demo / MemberDemo2025!
karavaev@pro-control.demo / MemberDemo2025!
```

---

## 7. Запуск backend

Backend запускается из папки:

```bash
cd D:\diplom\pro-control\backend
npm run dev
```

Если используется другой скрипт запуска, проверить файл:

```text
backend/package.json
```

После запуска backend должен подключиться к базе `procontrol`.

---

## 8. Запуск frontend

Frontend запускается из папки:

```bash
cd D:\diplom\pro-control\frontend\Pro-Control
npm run dev
```

После запуска Vite выдаёт адрес:

```text
http://localhost:5173/
```

Открыть этот адрес в браузере.

---

## 9. Порядок запуска перед защитой

Рекомендуемый порядок:

```text
1. Запустить MongoDB локально.
2. Открыть MongoDB Compass и проверить 127.0.0.1:27017.
3. При необходимости выполнить npm run db:reseed-demo в backend.
4. Запустить backend.
5. Запустить frontend.
6. Открыть http://localhost:5173/.
7. Войти под администратором Ефимова Т.Б.
```

---

## 10. Что показать на защите

Основной сценарий демонстрации:

```text
1. Вход в систему под администратором.
2. Просмотр пользователей.
3. Просмотр демонстрационного проекта.
4. Просмотр задач проекта.
5. Показ исполнителей задач.
6. Показ сроков и статусов.
7. Показ смены статуса задачи, если доступно.
8. Показ фильтрации или поиска, если реализовано.
```

Демонстрационный проект:

```text
Разработка web-приложения управления проектами и задачами Pro-Control
```

Смысл демонстрации:

```text
заявка / проект → задачи → исполнители → сроки → статусы → контроль выполнения
```

---

## 11. Проверка работы без интернета

Перед защитой желательно один раз проверить проект без интернета.

Порядок проверки:

```text
1. Отключить Wi-Fi.
2. Убедиться, что MongoDB Compass подключается к 127.0.0.1:27017.
3. Запустить backend.
4. Запустить frontend.
5. Войти под efimova.tb@pro-control.demo.
6. Открыть проекты и задачи.
```

Если всё открывается, проект не зависит от интернета.

---

## 12. Частые проблемы

### Backend не подключается к базе

Проверить, что MongoDB запущена.

Проверить строку подключения в `.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/procontrol
```

Не использовать для защиты:

```env
mongodb+srv://...
```

`mongodb+srv://` — это MongoDB Atlas, ему нужен интернет.

---

### Frontend открылся, но данные не загружаются

Проверить, запущен ли backend.

Также проверить, что frontend обращается к правильному адресу API.

---

### Не получается войти

Сначала пересоздать демонстрационные данные:

```bash
cd D:\diplom\pro-control\backend
npm run db:reseed-demo
```

Потом войти снова:

```text
efimova.tb@pro-control.demo / ProControl2025!
```

---

## 13. Команды кратко

Backend:

```bash
cd D:\diplom\pro-control\backend
npm run dev
```

Frontend:

```bash
cd D:\diplom\pro-control\frontend\Pro-Control
npm run dev
```

Пересоздание демо-данных:

```bash
cd D:\diplom\pro-control\backend
npm run db:reseed-demo
```

Адрес приложения:

```text
http://localhost:5173/
```

Администратор:

```text
efimova.tb@pro-control.demo / ProControl2025!
```
