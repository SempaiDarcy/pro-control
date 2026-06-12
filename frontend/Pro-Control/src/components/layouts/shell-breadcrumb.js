/**
 * Крошки topbar: корень раздела + текущая страница (кириллица).
 */
export function getShellBreadcrumbParts(pathname) {
    const isAdmin = pathname.startsWith("/admin");
    const isUser = pathname.startsWith("/user");
    const root = isAdmin ? "Панель управления" : isUser ? "Рабочая область" : "Панель управления";

    let section = "Раздел";

    if (pathname === "/admin/dashboard" || pathname === "/user/dashboard") {
        section = "Обзор";
    } else if (pathname === "/admin/projects" || pathname === "/user/projects") {
        section = "Проекты";
    } else if (pathname === "/admin/create-project") {
        section = "Создание проекта";
    } else if (pathname === "/admin/deadlines" || pathname === "/user/deadlines") {
        section = "Дедлайны";
    } else if (pathname === "/admin/tasks") {
        section = "Управление задачами";
    } else if (pathname === "/user/tasks") {
        section = "Мои задачи";
    } else if (pathname.startsWith("/user/task-details")) {
        section = "Задача";
    } else if (pathname === "/admin/create-task") {
        section = "Задача";
    } else if (pathname === "/admin/users") {
        section = "Участники команды";
    }

    return [root, section];
}
