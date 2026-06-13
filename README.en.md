# Pro-Control

> **Русский:** [README.ru.md](README.ru.md) · Demo runbook (RU): [VKR.md](./VKR.md)

**Web application for project and task management with progress monitoring.**

Graduation thesis project (Bachelor's), group **ISTb-21**.

| | |
|---|---|
| **Author** | Akbar Gabdualiev |
| **Topic** | Development of the Pro-Control web application for project and task management |
| **Status** | Defended — ready for local deployment and demo |

---

## Overview

Pro-Control is a fullstack system for assigning and tracking tasks within projects. It combines a Node.js REST API with a React single-page application.

**Features:**

- JWT authentication with **admin** and **member** roles
- Admin dashboard: KPIs, task distribution charts, priority breakdown, trend graph
- User, project, and task management
- Kanban and table views, filters by status and assignee
- Checklists, activity log, status and priority updates
- Deadlines workspace for due-date tracking
- Excel report export
- User avatar upload

The flow **project → tasks → assignees → deadlines → statuses** is implemented end-to-end and backed by demo seed data.

---

## Tech stack

### Backend

| Technology | Purpose |
|---|---|
| **Node.js** + **Express** | HTTP API |
| **MongoDB** + **Mongoose** | Data storage |
| **JWT** | Authentication |
| **bcryptjs** | Password hashing |
| **Multer** | File uploads |
| **ExcelJS** | Excel reports |
| **dotenv** | Environment config |
| **CORS** | Frontend access |

### Frontend

| Technology | Purpose |
|---|---|
| **React 19** + **Vite 6** | SPA |
| **React Router 7** | Routing, layout routes |
| **Tailwind CSS 4** | Styling |
| **Axios** | HTTP client |
| **Recharts** | Dashboard charts |
| **react-hot-toast** | Notifications |
| **moment** | Date formatting |

---

## Repository structure

```text
pro-control/
├── backend/                 # Node.js API
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/              # User, Project, Task
│   ├── routes/
│   ├── scripts/reseed-demo.js
│   └── server.js
├── frontend/Pro-Control/      # React (Vite)
├── VKR.md                     # Demo runbook (Russian)
├── README.md                  # Language index (GitHub)
├── README.ru.md               # Documentation (Russian)
└── README.en.md
```

### Data model (MongoDB)

| Collection | Entity | Key fields |
|---|---|---|
| `users` | User | name, email, password, role, profileImageUrl |
| `projects` | Project | title, description, status, members, startDate, dueDate |
| `tasks` | Task | title, status, priority, dueDate, assignedTo, todoChecklist, activity |

**Roles:** `admin` — full access; `member` — assigned tasks and project membership.

**Task statuses:** `Pending`, `In Progress`, `Completed`.

**Project statuses:** `Planning`, `Active`, `Completed`, `On Hold`.

---

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** 9+
- **MongoDB** 6+ locally (`127.0.0.1:27017`)
- Modern browser

Use **local MongoDB** for offline demos (Atlas `mongodb+srv://` requires internet).

---

## Quick start

### 1. Clone and install

```bash
git clone <repository-url>
cd pro-control

cd backend && npm install
cd ../frontend/Pro-Control && npm install
```

### 2. Backend environment

Create `backend/.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/procontrol
JWT_SECRET=your_jwt_secret_min_32_chars
ADMIN_INVITE_TOKEN=your_admin_registration_token
PORT=8000
CLIENT_URL=http://localhost:5173
```

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT signing secret |
| `ADMIN_INVITE_TOKEN` | Token for admin registration |
| `PORT` | API port (**8000** — matches frontend `BASE_URL`) |
| `CLIENT_URL` | Frontend origin for CORS |

### 3. Demo data (recommended)

From `backend/`:

```bash
npm run db:reseed-demo
```

Clears `tasks` → `projects` → `users` and seeds **20 users**, **1 project**, **11 tasks**.

### 4. Run

**Terminal 1 — backend:**

```bash
cd backend
npm run dev
```

**Terminal 2 — frontend:**

```bash
cd frontend/Pro-Control
npm run dev
```

Open **http://localhost:5173**

---

## Demo accounts

After `npm run db:reseed-demo`:

| Role | Email | Password |
|---|---|---|
| **Admin** | `efimova.tb@pro-control.demo` | `ProControl2025!` |
| **Member** | `zorin@pro-control.demo` | `MemberDemo2025!` |

Full account list: [VKR.md](./VKR.md) (Russian).

---

## API overview

Base URL: `http://localhost:8000`

| Prefix | Description |
|---|---|
| `/api/auth` | Register, login, profile, avatar upload |
| `/api/users` | User CRUD (admin) |
| `/api/projects` | Project CRUD |
| `/api/tasks` | Task CRUD, status, checklist, dashboard data |
| `/api/reports` | Excel export |
| `/uploads` | Static files (avatars) |

Protected routes require `Authorization: Bearer <token>`.

---

## UI sections

**Admin:** dashboard, projects, deadlines, task management, create task, team members.

**Member:** personal dashboard, projects, deadlines, my tasks (filters, kanban, task details).

---

## Production build

```bash
cd frontend/Pro-Control && npm run build && npm run preview
cd backend && npm start
```

Use strong secrets and configure `CLIENT_URL` plus a reverse proxy in production.

---

## Troubleshooting

| Issue | Fix |
|---|---|
| DB connection failed | Start MongoDB; check `MONGO_URI` |
| Empty frontend | Ensure backend runs on port **8000** |
| Login failed | Run `npm run db:reseed-demo` and use demo credentials |
| CORS errors | Set `CLIENT_URL=http://localhost:5173` |

---

## License

Developed as a graduation thesis project for educational and demonstration purposes.
