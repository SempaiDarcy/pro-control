import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/user-context.jsx";
import { SIDE_MENU_DATA, SIDE_MENU_USER_DATA } from "../../utils/data.js";
import { LuUser } from "react-icons/lu";

export const SideMenu = ({ activeMenu, onNavigate, collapsed = false }) => {
    const { user, clearUser } = useContext(UserContext);
    const [sideMenuData, setSideMenuData] = useState([]);
    const navigate = useNavigate();

    const isMobileDrawer = typeof onNavigate === "function";
    const narrow = collapsed && !isMobileDrawer;

    const closeMobile = () => {
        if (isMobileDrawer) onNavigate();
    };

    const handleClick = (route) => {
        closeMobile();
        if (route === "logout") {
            handelLogout();
            return;
        }
        navigate(route);
    };

    const handelLogout = () => {
        localStorage.clear();
        clearUser();
        navigate("/login");
    };

    useEffect(() => {
        if (user) {
            setSideMenuData(user?.role === "admin" ? SIDE_MENU_DATA : SIDE_MENU_USER_DATA);
        }
        return () => {};
    }, [user]);

    return (
        <div className="flex h-full min-h-0 flex-col bg-white">
            <nav
                className={`min-h-0 flex-1 space-y-0.5 overflow-y-auto pb-2 ${
                    narrow ? "px-1.5 pt-1.5" : isMobileDrawer ? "px-2 pt-3" : "px-2 pt-2"
                }`}
                aria-label="Основное меню"
            >
                {sideMenuData.map((item, index) => {
                    const isActive = activeMenu === item.path;
                    const base =
                        "flex w-full items-center rounded-lg text-sm transition-colors duration-150 cursor-pointer";
                    const activeCls =
                        "bg-zinc-100 font-medium text-zinc-900 shadow-sm ring-1 ring-zinc-200/50";
                    const idleCls =
                        "font-medium text-zinc-800 hover:bg-zinc-50 hover:text-zinc-950";
                    const pad = narrow ? "justify-center px-0 py-2" : "gap-3 px-2.5 py-2 text-left";

                    return (
                        <button
                            key={`menu_${index}`}
                            type="button"
                            title={narrow ? item.label : undefined}
                            aria-current={isActive ? "page" : undefined}
                            className={`${base} ${pad} ${isActive ? activeCls : idleCls}`}
                            onClick={() => handleClick(item.path)}
                        >
                            <item.icon
                                className={`h-[1.125rem] w-[1.125rem] shrink-0 ${isActive ? "text-zinc-800" : "text-zinc-700"}`}
                            />
                            {!narrow ? <span className="truncate">{item.label}</span> : null}
                        </button>
                    );
                })}
            </nav>

            <div className={`mt-auto shrink-0 px-1.5 pb-3 ${narrow ? "pt-1" : "px-2 pt-1"}`}>
                {narrow ? (
                    <div className="flex justify-center" title={user?.name || ""}>
                        {user?.profileImageUrl ? (
                            <img
                                src={user.profileImageUrl}
                                alt=""
                                className="h-8 w-8 rounded-full border border-zinc-200/80 object-cover"
                            />
                        ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200/80 bg-zinc-50">
                                <LuUser className="h-3.5 w-3.5 text-zinc-400" />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center gap-2.5 rounded-lg bg-zinc-50/90 px-2 py-2">
                        {user?.profileImageUrl ? (
                            <img
                                src={user.profileImageUrl}
                                alt=""
                                className="h-8 w-8 shrink-0 rounded-full border border-zinc-200/80 object-cover"
                            />
                        ) : (
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-200/80 bg-white">
                                <LuUser className="h-3.5 w-3.5 text-zinc-400" />
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1">
                                <p className="truncate text-xs font-medium text-zinc-900">{user?.name || "—"}</p>
                                {user?.role === "admin" ? (
                                    <span className="shrink-0 rounded bg-blue-50/90 px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-blue-800 ring-1 ring-blue-200/40">
                                        Админ
                                    </span>
                                ) : null}
                            </div>
                            <p className="truncate text-[11px] text-zinc-500">{user?.email || ""}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
