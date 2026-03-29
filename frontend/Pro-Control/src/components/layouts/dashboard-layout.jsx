import React, { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { UserContext } from "../../context/user-context.jsx";
import { SideMenu } from "./side-menu.jsx";
import { Navbar } from "./navbar.jsx";

const SIDEBAR_STORAGE_KEY = "pc-sidebar-collapsed";

export const DashboardLayout = ({ children, activeMenu }) => {
    const { pathname } = useLocation();
    const { user } = useContext(UserContext);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        try {
            return localStorage.getItem(SIDEBAR_STORAGE_KEY) === "1";
        } catch {
            return false;
        }
    });

    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    useEffect(() => {
        try {
            localStorage.setItem(SIDEBAR_STORAGE_KEY, sidebarCollapsed ? "1" : "0");
        } catch {
            /* ignore */
        }
    }, [sidebarCollapsed]);

    useEffect(() => {
        if (!mobileOpen) return;
        const onKey = (e) => {
            if (e.key === "Escape") setMobileOpen(false);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [mobileOpen]);

    const expandedW = "w-[13.5rem]";
    const collapsedW = "w-14";
    const asideClass = `fixed left-0 top-0 z-30 hidden h-svh flex-col border-r border-zinc-200 bg-white shadow-[1px_0_0_rgba(0,0,0,0.03)] transition-[width] duration-200 ease-out lg:flex ${sidebarCollapsed ? collapsedW : expandedW}`;

    const mainPad = sidebarCollapsed ? "lg:pl-14" : "lg:pl-[13.5rem]";

    return (
        <div className="min-h-svh bg-zinc-50">
            <aside className={asideClass} aria-hidden={false}>
                {user ? <SideMenu activeMenu={activeMenu} collapsed={sidebarCollapsed} /> : null}
            </aside>

            {mobileOpen && user ? (
                <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
                    <button
                        type="button"
                        className="absolute inset-0 cursor-pointer bg-zinc-950/40 backdrop-blur-[1px]"
                        aria-label="Закрыть меню"
                        onClick={() => setMobileOpen(false)}
                    />
                    <div className="absolute left-0 top-0 flex h-full w-[min(16rem,86vw)] flex-col border-r border-zinc-200 bg-white shadow-xl">
                        <SideMenu
                            activeMenu={activeMenu}
                            collapsed={false}
                            onNavigate={() => setMobileOpen(false)}
                        />
                    </div>
                </div>
            ) : null}

            <div className={`flex min-w-0 flex-col ${mainPad}`}>
                {user ? (
                    <Navbar
                        mobileOpen={mobileOpen}
                        setMobileOpen={setMobileOpen}
                        sidebarCollapsed={sidebarCollapsed}
                        onToggleSidebarCollapsed={() => setSidebarCollapsed((c) => !c)}
                    />
                ) : null}
                <main className="flex-1 px-4 py-5 md:px-6 md:py-6 lg:px-8 lg:py-8">
                    {user ? children : null}
                </main>
            </div>
        </div>
    );
};
