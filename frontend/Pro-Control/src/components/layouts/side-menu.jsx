import {useContext, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {UserContext} from "../../context/user-context.jsx";
import {SIDE_MENU_DATA, SIDE_MENU_USER_DATA} from "../../utils/data.js";
import { LuUser } from "react-icons/lu";

export const SideMenu = ({activeMenu}) => {
    const {user, clearUser} = useContext(UserContext);
    const [sideMenuData, setSideMenuData] = useState([]);

    const navigate = useNavigate();

    const handleClick = (route) => {
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
            setSideMenuData(user?.role === 'admin' ? SIDE_MENU_DATA : SIDE_MENU_USER_DATA)
        }
        return () => {
        };
    }, [user]);
    return <div className="w-64 h-[calc(100vh-61px)] bg-white border-r border-gray-200/50 sticky top-[61px] z-20">
        <div className="flex flex-col items-center justify-center mb-7 pt-5">
            <div className="relative">
                {user?.profileImageUrl ? (
                    <img
                        src={user.profileImageUrl}
                        alt="Profile Image"
                        className="w-20 h-20 object-cover rounded-full border-2 border-gray-200"
                    />
                ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                        <LuUser className="text-3xl text-gray-400" />
                    </div>
                )}

            </div>

            {user?.role === "admin" && (
                <div className="text-[10px] font-medium text-white bg-primary px-3 py-0.5 rounded mt-1">
                    Admin
                </div>)}

            <h5 className="text-gray-950 font-medium leading-6 mt-3">
                {user?.name || ""}
            </h5>

            <p className="text-[12px] text-gray-500">{user?.email || ""}</p>
        </div>

        {sideMenuData.map((item, index) => (<button
                key={`menu_${index}`}
                className={`w-full flex items-center gap-4 text-[14px] ${activeMenu == item.path ? "text-primary bg-linear-to-r from-blue-50/40 to-blue-100/50 border-r-3" : ""} py-3 px-6 mb-3 cursor-pointer`}
                onClick={() => handleClick(item.path)}
            >
                <item.icon className="text-xl"/>
                {item.label}
            </button>))}
    </div>;
};
