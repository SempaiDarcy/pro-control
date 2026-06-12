import { Outlet, useLocation } from "react-router-dom";
import { DashboardLayout } from "./dashboard-layout.jsx";
import { getAdminShellActiveMenu } from "./dashboard-shell-active.js";

export const AdminDashboardShell = () => {
    const { pathname } = useLocation();
    const activeMenu = getAdminShellActiveMenu(pathname);

    return (
        <DashboardLayout activeMenu={activeMenu}>
            <Outlet />
        </DashboardLayout>
    );
};
