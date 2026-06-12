import { Outlet, useLocation } from "react-router-dom";
import { DashboardLayout } from "./dashboard-layout.jsx";
import { getUserShellActiveMenu } from "./dashboard-shell-active.js";

export const UserDashboardShell = () => {
    const { pathname } = useLocation();
    const activeMenu = getUserShellActiveMenu(pathname);

    return (
        <DashboardLayout activeMenu={activeMenu}>
            <Outlet />
        </DashboardLayout>
    );
};
