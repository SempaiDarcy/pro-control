import React, { useContext } from "react";
import {UserContext} from "../../context/user-context.jsx";
import {SideMenu} from "./side-menu.jsx";
import {Navbar} from "./navbar.jsx";

export const DashboardLayout = ({ children, activeMenu }) => {
    const { user } = useContext(UserContext);

    return (
        <div className="">
            <Navbar activeMenu={activeMenu} />

            {user && (
                <div className="flex">
                    <div className="max-[1080px]:hidden">
                        <SideMenu activeMenu={activeMenu} />
                    </div>

                    <div className="grow mx-5">{children}</div>
                </div>
            )}
        </div>
    );
};
