/**
 * Путь для подсветки пункта sidebar (должен совпадать с path в SIDE_MENU_DATA).
 */
export function getAdminShellActiveMenu(pathname) {
    if (pathname === "/admin/create-project" || pathname.startsWith("/admin/create-project/")) {
        return "/admin/projects";
    }
    if (pathname.startsWith("/admin/dashboard")) return "/admin/dashboard";
    if (pathname.startsWith("/admin/projects")) return "/admin/projects";
    if (pathname.startsWith("/admin/deadlines")) return "/admin/deadlines";
    if (pathname.startsWith("/admin/tasks")) return "/admin/tasks";
    if (pathname.startsWith("/admin/create-task")) return "/admin/create-task";
    if (pathname.startsWith("/admin/users")) return "/admin/users";
    return pathname;
}

export function getUserShellActiveMenu(pathname) {
    if (pathname.startsWith("/user/task-details")) return "/user/tasks";
    if (pathname.startsWith("/user/dashboard")) return "/user/dashboard";
    if (pathname.startsWith("/user/projects")) return "/user/projects";
    if (pathname.startsWith("/user/deadlines")) return "/user/deadlines";
    if (pathname.startsWith("/user/tasks")) return "/user/tasks";
    return pathname;
}
