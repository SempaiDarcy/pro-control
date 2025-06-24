import {useUserAuth} from "../../hooks/use-user-auth.jsx";
import {useContext} from "react";
import {UserContext} from "../../context/user-context.jsx";

export const Dashboard = () => {
    useUserAuth()

    const {user} = useContext(UserContext)
    return (
        <div>
            Dashboard
        </div>
    );
};