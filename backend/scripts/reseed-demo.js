/**
 * Демонстрационные данные Pro-Control для защиты ВКР.
 *
 * Очищает коллекции tasks → projects → users и создаёт согласованный набор.
 *
 * Запуск (из backend/):
 *   node scripts/reseed-demo.js --yes
 *   npm run db:reseed-demo
 */

require("dotenv").config();
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require(path.join(__dirname, "..", "models", "User"));
const Project = require(path.join(__dirname, "..", "models", "Project"));
const Task = require(path.join(__dirname, "..", "models", "Task"));

const COLLECTIONS = [
    { model: Task, name: "tasks", reason: "Ссылки на projects и users" },
    { model: Project, name: "projects", reason: "Ссылки на users" },
    { model: User, name: "users", reason: "Корневая сущность" },
];

/** Детерминированные аватары (DiceBear initials), без загрузки файлов */
function avatarUrl(seed) {
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}&fontWeight=600`;
}

const PASSWORDS = {
    admin: "ProControl2025!",
    member: "MemberDemo2025!",
};

/**
 * Роли в системе: только admin | member (см. models/User.js).
 * Ефимова Т.Б. — администратор; остальные — участники (исполнители).
 */
const USER_SEEDS = [
    {
        name: "Ефимова Татьяна Борисовна",
        email: "efimova.tb@pro-control.demo",
        role: "admin",
        passKey: "admin",
    },
    { name: "Габдуалиев Акбар", email: "gabdualiev@pro-control.demo", role: "member", passKey: "member" },
    { name: "Зорин Даниил", email: "zorin@pro-control.demo", role: "member", passKey: "member" },
    { name: "Тихомиров Егор", email: "tikhomirov@pro-control.demo", role: "member", passKey: "member" },
    { name: "Зайдуллин Нияз", email: "zaydullin@pro-control.demo", role: "member", passKey: "member" },
    { name: "Морозов Алексей", email: "morozov@pro-control.demo", role: "member", passKey: "member" },
    { name: "Овод Александр", email: "ovod@pro-control.demo", role: "member", passKey: "member" },
    { name: "Листратенко Максим", email: "listratenko@pro-control.demo", role: "member", passKey: "member" },
    { name: "Иванов Сергей", email: "ivanov@pro-control.demo", role: "member", passKey: "member" },
    { name: "Купасев Артем", email: "kupasev@pro-control.demo", role: "member", passKey: "member" },
    { name: "Проскурин Дмитрий", email: "proskurin@pro-control.demo", role: "member", passKey: "member" },
    { name: "Симоненко Никита", email: "simonenko@pro-control.demo", role: "member", passKey: "member" },
    { name: "Кудряшов Никита", email: "kudryashov@pro-control.demo", role: "member", passKey: "member" },
    { name: "Кекин Николай", email: "kekin@pro-control.demo", role: "member", passKey: "member" },
    { name: "Михеев Алексей", email: "miheev@pro-control.demo", role: "member", passKey: "member" },
    { name: "Хайдаров Хамиджон", email: "haydarov@pro-control.demo", role: "member", passKey: "member" },
    { name: "Мед Артем", email: "med@pro-control.demo", role: "member", passKey: "member" },
    { name: "Мочков Дмитрий", email: "mochkov@pro-control.demo", role: "member", passKey: "member" },
    { name: "Кривов Дмитрий", email: "krivov@pro-control.demo", role: "member", passKey: "member" },
    { name: "Караваев Дмитрий", email: "karavaev@pro-control.demo", role: "member", passKey: "member" },
];

const DEMO_PROJECT = {
    title: "Разработка web-приложения управления проектами и задачами Pro-Control",
    description: "Демонстрационный проект для показа работы системы на защите ВКР",
    status: "Active",
};

function daysFromNow(n) {
    const d = new Date();
    d.setDate(d.getDate() + n);
    d.setHours(12, 0, 0, 0);
    return d;
}

function atDaysAgo(days, hour = 10) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    d.setHours(hour, 30, 0, 0);
    return d;
}

function addDays(date, days) {
    const d = new Date(date.getTime());
    d.setDate(d.getDate() + days);
    return d;
}

/**
 * Календарь для 11 задач (февраль — июнь 2026) под график динамики на дашборде.
 * Статусы модели: Pending | In Progress | Completed
 * (аналог new / in_progress / done; отдельного review в схеме нет).
 */
function buildDemoTimePlan() {
    const p = (y, month, day, status, completedAfterDays, dueAfter) => ({
        createdAt: new Date(y, month, day, 10, 30, 0, 0),
        status,
        completedAfterDays,
        dueAfter,
    });

    return [
        p(2026, 1, 5, "Completed", 18, 28),
        p(2026, 1, 18, "In Progress", null, 35),
        p(2026, 2, 3, "Completed", 14, 22),
        p(2026, 2, 12, "In Progress", null, 30),
        p(2026, 2, 20, "Completed", 12, 20),
        p(2026, 2, 27, "In Progress", null, 25),
        p(2026, 3, 6, "Pending", null, 18),
        p(2026, 3, 14, "In Progress", null, 21),
        p(2026, 3, 22, "Completed", 10, 16),
        p(2026, 4, 2, "Pending", null, 14),
        p(2026, 4, 15, "In Progress", null, 12),
    ];
}

const DEMO_TIME_PLAN = buildDemoTimePlan();

async function hashPassword(plain) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(plain, salt);
}

async function clearAppData() {
    for (const { model, name } of COLLECTIONS) {
        const actual = model.collection.collectionName;
        if (actual !== name) {
            throw new Error(`Expected collection "${name}", got "${actual}".`);
        }
    }

    console.log("\nОчищаем коллекции (tasks → projects → users):");
    for (const { name, reason } of COLLECTIONS) {
        console.log(`  - ${name}: ${reason}`);
    }

    for (const { model, name } of COLLECTIONS) {
        const r = await model.deleteMany({});
        console.log(`  deleted ${name}: ${r.deletedCount}`);
    }
}

function buildTaskDocs(users, projectId, definitions, timePlan) {
    if (definitions.length !== timePlan.length) {
        throw new Error(`tasks ${definitions.length} ≠ timePlan ${timePlan.length}`);
    }

    const U = users.map((u) => u._id);
    const admin = U[0];

    return definitions.map((def, i) => {
        const slot = timePlan[i];
        const createdAt = new Date(slot.createdAt);
        const dueDate = addDays(createdAt, slot.dueAfter);
        const status = slot.status;
        const isDone = status === "Completed";
        const assignees = def.assigneeIndexes.map((idx) => U[idx]);
        const creator = def.creatorIndex != null ? U[def.creatorIndex] : admin;

        let todoChecklist = def.todoChecklist || [];
        let progress = isDone ? 100 : def.progress ?? 0;
        if (isDone) {
            if (todoChecklist.length === 0) {
                todoChecklist = [{ text: "Выполнено", completed: true }];
            } else {
                todoChecklist = todoChecklist.map((x) => ({ ...x, completed: true }));
            }
            progress = 100;
        }

        const completionAt =
            isDone && slot.completedAfterDays != null
                ? addDays(createdAt, slot.completedAfterDays)
                : null;

        let activity = (def.activityLog || []).map((a, idx) => {
            const d = addDays(createdAt, a.daysAfterCreated || 0);
            d.setMinutes(d.getMinutes() + idx * 5);
            return {
                action: a.action,
                user: U[a.userIndex],
                message: a.message,
                createdAt: d,
            };
        });

        if (completionAt) {
            const hasDone = activity.some(
                (e) =>
                    e.action === "status_changed" && String(e.message).includes("Завершено")
            );
            if (!hasDone) {
                activity.push({
                    action: "status_changed",
                    user: assignees[0] || creator,
                    message: "Статус: В работе → Завершено",
                    createdAt: new Date(completionAt),
                });
            }
        }

        activity.sort((a, b) => a.createdAt - b.createdAt);

        let updatedAt = completionAt || addDays(createdAt, 2);
        if (activity.length) {
            const last = activity[activity.length - 1].createdAt;
            if (last > updatedAt) updatedAt = new Date(last);
        }

        return {
            title: def.title,
            description: def.description,
            priority: def.priority,
            status,
            dueDate,
            project: projectId,
            assignedTo: assignees,
            createdBy: creator,
            attachments: [],
            todoChecklist,
            activity,
            progress,
            createdAt,
            updatedAt,
        };
    });
}

async function seed() {
    const adminHash = await hashPassword(PASSWORDS.admin);
    const memberHash = await hashPassword(PASSWORDS.member);

    const userDocs = USER_SEEDS.map((s) => ({
        name: s.name,
        email: s.email,
        password: s.passKey === "admin" ? adminHash : memberHash,
        role: s.role,
        profileImageUrl: avatarUrl(s.name),
    }));

    const users = await User.insertMany(userDocs);
    const U = (i) => users[i]._id;

    const memberIds = users.slice(1).map((u) => u._id);

    const projectRow = {
        title: DEMO_PROJECT.title,
        description: DEMO_PROJECT.description,
        status: DEMO_PROJECT.status,
        startDate: atDaysAgo(120),
        dueDate: daysFromNow(45),
        createdBy: U(0),
        members: memberIds,
        createdAt: atDaysAgo(125),
        updatedAt: atDaysAgo(1),
    };

    const [project] = await Project.insertMany([projectRow]);

    const taskDefs = [
        {
            title: "Разработка экрана списка проектов",
            description: "Карточки проектов, фильтрация по статусу, переход в детали.",
            priority: "High",
            assigneeIndexes: [1],
            creatorIndex: 0,
            progress: 100,
            todoChecklist: [
                { text: "Вёрстка списка", completed: true },
                { text: "Интеграция с API", completed: true },
            ],
            activityLog: [
                { action: "created", userIndex: 0, message: "Задача создана", daysAfterCreated: 0 },
                { action: "status_changed", userIndex: 1, message: "Статус: Ожидает → В работе", daysAfterCreated: 2 },
                { action: "status_changed", userIndex: 1, message: "Статус: В работе → Завершено", daysAfterCreated: 18 },
            ],
        },
        {
            title: "Разработка экрана задач",
            description: "Таблица и канбан, назначение исполнителей, приоритеты.",
            priority: "High",
            assigneeIndexes: [2],
            creatorIndex: 1,
            progress: 65,
            todoChecklist: [
                { text: "Табличный вид", completed: true },
                { text: "Канбан-доска", completed: true },
                { text: "Drag-and-drop статусов", completed: false },
            ],
            activityLog: [
                { action: "created", userIndex: 1, message: "Задача создана", daysAfterCreated: 0 },
                { action: "status_changed", userIndex: 2, message: "Статус: Ожидает → В работе", daysAfterCreated: 3 },
            ],
        },
        {
            title: "Реализация авторизации пользователя",
            description: "JWT, вход по email/паролю, хранение сессии на клиенте.",
            priority: "High",
            assigneeIndexes: [3],
            creatorIndex: 0,
            progress: 100,
            activityLog: [
                { action: "created", userIndex: 0, message: "Задача создана", daysAfterCreated: 0 },
                { action: "status_changed", userIndex: 3, message: "Статус: В работе → Завершено", daysAfterCreated: 14 },
            ],
        },
        {
            title: "Настройка разграничения прав доступа",
            description: "Роли admin и member: доступ к админ-панели и операциям с задачами.",
            priority: "High",
            assigneeIndexes: [4, 5],
            creatorIndex: 0,
            progress: 55,
            todoChecklist: [
                { text: "Middleware protect/admin", completed: true },
                { text: "Ограничения на фронте", completed: false },
            ],
            activityLog: [
                { action: "created", userIndex: 0, message: "Задача создана", daysAfterCreated: 0 },
                { action: "assignees_changed", userIndex: 0, message: "Назначен второй исполнитель", daysAfterCreated: 1 },
                { action: "status_changed", userIndex: 4, message: "Статус: Ожидает → В работе", daysAfterCreated: 4 },
            ],
        },
        {
            title: "Создание REST API для проектов",
            description: "CRUD проектов, участники, статусы Planning/Active/Completed/On Hold.",
            priority: "High",
            assigneeIndexes: [6],
            creatorIndex: 1,
            progress: 100,
            activityLog: [
                { action: "created", userIndex: 1, message: "Задача создана", daysAfterCreated: 0 },
                { action: "status_changed", userIndex: 6, message: "Статус: В работе → Завершено", daysAfterCreated: 12 },
            ],
        },
        {
            title: "Создание REST API для задач",
            description: "CRUD задач, чеклист, activity log, смена статуса.",
            priority: "High",
            assigneeIndexes: [7],
            creatorIndex: 2,
            progress: 70,
            activityLog: [
                { action: "created", userIndex: 2, message: "Задача создана", daysAfterCreated: 0 },
                { action: "status_changed", userIndex: 7, message: "Статус: Ожидает → В работе", daysAfterCreated: 2 },
            ],
        },
        {
            title: "Реализация фильтрации задач по статусу и исполнителю",
            description: "Query-параметры API и элементы управления в UI.",
            priority: "Medium",
            assigneeIndexes: [8],
            creatorIndex: 2,
            progress: 0,
            activityLog: [{ action: "created", userIndex: 2, message: "Задача создана", daysAfterCreated: 0 }],
        },
        {
            title: "Реализация смены статуса задачи",
            description: "Pending → In Progress → Completed, обновление прогресса и activity.",
            priority: "Medium",
            assigneeIndexes: [9, 10],
            creatorIndex: 1,
            progress: 40,
            activityLog: [
                { action: "created", userIndex: 1, message: "Задача создана", daysAfterCreated: 0 },
                { action: "status_changed", userIndex: 9, message: "Статус: Ожидает → В работе", daysAfterCreated: 5 },
            ],
        },
        {
            title: "Подготовка тестовых данных",
            description: "Скрипт reseed-demo.js: очистка коллекций и демо-наполнение.",
            priority: "Medium",
            assigneeIndexes: [11],
            creatorIndex: 0,
            progress: 100,
            activityLog: [
                { action: "created", userIndex: 0, message: "Задача создана", daysAfterCreated: 0 },
                { action: "status_changed", userIndex: 11, message: "Статус: В работе → Завершено", daysAfterCreated: 10 },
            ],
        },
        {
            title: "Проверка пользовательских сценариев",
            description: "Вход, создание задачи, смена статуса, фильтры, дашборд.",
            priority: "Medium",
            assigneeIndexes: [12, 13],
            creatorIndex: 1,
            progress: 0,
            todoChecklist: [
                { text: "Сценарий администратора", completed: false },
                { text: "Сценарий участника", completed: false },
            ],
            activityLog: [{ action: "created", userIndex: 1, message: "Задача создана", daysAfterCreated: 0 }],
        },
        {
            title: "Подготовка демонстрации для защиты",
            description: "Сценарий презентации, учётные записи, показ ключевых экранов.",
            priority: "High",
            assigneeIndexes: [14, 15, 16],
            creatorIndex: 0,
            progress: 45,
            todoChecklist: [
                { text: "Список экранов", completed: true },
                { text: "Тайминг выступления", completed: false },
                { text: "Резервный план при сбое", completed: false },
            ],
            activityLog: [
                { action: "created", userIndex: 0, message: "Задача создана", daysAfterCreated: 0 },
                { action: "assignees_changed", userIndex: 0, message: "Расширена команда подготовки", daysAfterCreated: 2 },
                { action: "status_changed", userIndex: 14, message: "Статус: Ожидает → В работе", daysAfterCreated: 3 },
            ],
        },
    ];

    if (taskDefs.length !== DEMO_TIME_PLAN.length) {
        throw new Error(`Ожидалось ${DEMO_TIME_PLAN.length} задач, задано ${taskDefs.length}`);
    }

    const taskDocs = buildTaskDocs(users, project._id, taskDefs, DEMO_TIME_PLAN);
    await Task.insertMany(taskDocs);

    return {
        userCount: users.length,
        projectCount: 1,
        taskCount: taskDocs.length,
    };
}

async function main() {
    if (!process.argv.includes("--yes")) {
        console.error(
            "\nОтказ: скрипт удаляет ВСЕ записи в tasks, projects, users.\n" +
                "  node scripts/reseed-demo.js --yes\n"
        );
        process.exit(1);
    }

    const uri = process.env.MONGO_URI;
    if (!uri || !String(uri).trim()) {
        console.error("В .env должен быть задан MONGO_URI.");
        process.exit(1);
    }

    await mongoose.connect(uri);
    console.log(`Подключено к базе: ${mongoose.connection.name}`);

    await clearAppData();
    const { userCount, projectCount, taskCount } = await seed();

    console.log("\nГотово.");
    console.log(`  users: ${userCount}`);
    console.log(`  projects: ${projectCount}`);
    console.log(`  tasks: ${taskCount}`);
    console.log("\nУчётные записи:");
    USER_SEEDS.forEach((s) => {
        const pw = s.passKey === "admin" ? PASSWORDS.admin : PASSWORDS.member;
        console.log(`  ${s.email} (${s.role}) — ${pw}`);
    });
    console.log("\nВход администратора (Ефимова Т.Б.):");
    console.log(`  ${USER_SEEDS[0].email} / ${PASSWORDS.admin}`);
    console.log("");

    await mongoose.disconnect();
    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    mongoose.disconnect().catch(() => {});
    process.exit(1);
});
