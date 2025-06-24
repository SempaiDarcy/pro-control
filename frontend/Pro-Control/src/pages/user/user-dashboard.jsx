import {useUserAuth} from "../../hooks/use-user-auth.jsx";

export const UserDashboard = () => {
    useUserAuth()
    return (
        <div>
            UserDashboard
        </div>
    );
};