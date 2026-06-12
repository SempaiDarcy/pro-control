import { LuMenu, LuX, LuPanelLeft, LuPanelRight } from "react-icons/lu";
import { useLocation } from "react-router-dom";
import { getShellBreadcrumbParts } from "./shell-breadcrumb.js";

function ShellBreadcrumbTrail({ parts }) {
    return (
        <nav aria-label="Навигация по разделу" className="min-w-0 flex-1 overflow-hidden">
            <ol className="flex min-w-0 flex-nowrap items-center gap-x-1.5 text-[13px] leading-snug">
                {parts.map((label, i) => (
                    <li key={`${label}-${i}`} className="flex min-w-0 items-center gap-1.5">
                        {i > 0 ? (
                            <span className="shrink-0 text-zinc-300 select-none" aria-hidden="true">
                                /
                            </span>
                        ) : null}
                        <span
                            className={
                                i === parts.length - 1
                                    ? "truncate font-semibold tracking-tight text-zinc-900"
                                    : "truncate font-medium text-zinc-500"
                            }
                        >
                            {label}
                        </span>
                    </li>
                ))}
            </ol>
        </nav>
    );
}

/**
 * Слева: меню + breadcrumb. Справа: бренд (стабильная сетка, без сдвига от длины крошек).
 */
export const Navbar = ({
    mobileOpen,
    setMobileOpen,
    sidebarCollapsed,
    onToggleSidebarCollapsed,
}) => {
    const { pathname } = useLocation();
    const parts = getShellBreadcrumbParts(pathname);

    const brand = (
        <div className="shrink-0 justify-self-end">
            <span
                className="block text-[0.9375rem] font-semibold tracking-tight text-zinc-900"
                translate="no"
            >
                Про-Контроль
            </span>
        </div>
    );

    return (
        <>
            <header className="sticky top-0 z-20 grid h-12 w-full shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-zinc-200/80 bg-white/95 px-3 backdrop-blur-sm lg:hidden">
                <div className="flex min-w-0 items-center gap-3 overflow-hidden">
                    <button
                        type="button"
                        className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-zinc-700 transition-colors hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300/70 focus-visible:ring-offset-2"
                        aria-expanded={mobileOpen}
                        aria-label={mobileOpen ? "Закрыть меню" : "Открыть меню"}
                        onClick={() => setMobileOpen((o) => !o)}
                    >
                        {mobileOpen ? (
                            <LuX className="h-[22px] w-[22px]" strokeWidth={1.75} />
                        ) : (
                            <LuMenu className="h-[22px] w-[22px]" strokeWidth={1.75} />
                        )}
                    </button>
                    <ShellBreadcrumbTrail parts={parts} />
                </div>
                {brand}
            </header>

            <header className="sticky top-0 z-20 hidden h-12 w-full shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-zinc-200/80 bg-white/95 px-5 backdrop-blur-sm lg:grid">
                <div className="flex min-w-0 items-center gap-3 overflow-hidden">
                    <button
                        type="button"
                        className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300/70 focus-visible:ring-offset-2"
                        aria-label={sidebarCollapsed ? "Развернуть меню" : "Свернуть меню"}
                        title={sidebarCollapsed ? "Развернуть меню" : "Свернуть меню"}
                        onClick={() => onToggleSidebarCollapsed?.()}
                    >
                        {sidebarCollapsed ? (
                            <LuPanelRight className="h-[18px] w-[18px]" strokeWidth={1.75} />
                        ) : (
                            <LuPanelLeft className="h-[18px] w-[18px]" strokeWidth={1.75} />
                        )}
                    </button>
                    <ShellBreadcrumbTrail parts={parts} />
                </div>
                {brand}
            </header>
        </>
    );
};
