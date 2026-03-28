import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { UserContext } from "../context/user-context.jsx";

export const PrivateRoute = ({ allowedRoles }) => {
    const { user, loading } = useContext(UserContext);

    if (loading) {
        return null;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
        const fallback = user.role === "admin" ? "/admin/dashboard" : "/user/dashboard";
        return <Navigate to={fallback} replace />;
    }

    return <Outlet />;
};
