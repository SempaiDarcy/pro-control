import React, { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/layouts/dashboard-layout.jsx";
import { API_PATHS } from "../../utils/api-paths.js";
import axiosInstance from "../../utils/axios-instance.js";
import { LuFileSpreadsheet } from "react-icons/lu";
import { UserCard } from "../../components/cards/user-card.jsx";
import { toast } from "react-toastify";

export const ManageUsers = () => {
    const [allUsers, setAllUsers] = useState([]);

    const getAllUsers = async () => {
        try {
            const response = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS);
            if (response.data?.length > 0) {
                setAllUsers(response.data);
            }
        } catch (error) {
            console.error("Ошибка при получении пользователей:", error);
        }
    };

    // Загрузка отчета о пользователях
    const handleDownloadReport = async () => {
        try {
            const response = await axiosInstance.get(API_PATHS.REPORTS.EXPORT_USERS, {
                responseType: "blob",
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "список_пользователей.xlsx");
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Ошибка при скачивании отчета:", error);
            toast.error("Не удалось скачать отчет. Пожалуйста, попробуйте снова.");
        }
    };

    useEffect(() => {
        getAllUsers();
    }, []);

    return (
        <DashboardLayout activeMenu="Team Members">
            <div className="mt-5 mb-10">
                <div className="flex md:flex-row md:items-center justify-between">
                    <h2 className="text-xl md:text-xl font-medium">Участники команды</h2>

                    <button
                        className="flex md:flex download-btn"
                        onClick={handleDownloadReport}
                    >
                        <LuFileSpreadsheet className="text-lg" />
                        Скачать отчёт
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    {allUsers?.map((user) => (
                        <UserCard key={user._id} userInfo={user} />
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
};
