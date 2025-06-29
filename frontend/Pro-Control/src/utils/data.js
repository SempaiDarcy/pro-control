import {
    LuLayoutDashboard,
    LuUsers,
    LuClipboardCheck,
    LuSquarePlus,
    LuLogOut,
} from "react-icons/lu";

export const SIDE_MENU_DATA = [
    {
        id: "01",
        label: "Панель управления",
        icon: LuLayoutDashboard,
        path: "/admin/dashboard",
    },
    {
        id: "02",
        label: "Управление задачами",
        icon: LuClipboardCheck,
        path: "/admin/tasks",
    },
    {
        id: "03",
        label: "Создать задачу",
        icon: LuSquarePlus,
        path: "/admin/create-task",
    },
    {
        id: "04",
        label: "Участники команды",
        icon: LuUsers,
        path: "/admin/users",
    },
    {
        id: "05",
        label: "Выйти",
        icon: LuLogOut,
        path: "logout",
    },
];

export const SIDE_MENU_USER_DATA = [
    {
        id: "01",
        label: "Панель управления",
        icon: LuLayoutDashboard,
        path: "/user/dashboard",
    },
    {
        id: "02",
        label: "Мои задачи",
        icon: LuClipboardCheck,
        path: "/user/tasks",
    },
    {
        id: "05",
        label: "Выйти",
        icon: LuLogOut,
        path: "logout",
    },
];

export const PRIORITY_DATA = [
    { label: "Низкий", value: "Low" },
    { label: "Средний", value: "Medium" },
    { label: "Высокий", value: "High" },
];

export const STATUS_DATA = [
    { label: "В ожидании", value: "Pending" },
    { label: "В работе", value: "In Progress" },
    { label: "Завершено", value: "Completed" },
];
