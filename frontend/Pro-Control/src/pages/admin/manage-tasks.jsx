import React, { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/layouts/dashboard-layout.jsx";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axios-instance.js";
import { API_PATHS } from "../../utils/api-paths.js";
import { LuFileSpreadsheet } from "react-icons/lu";
import { TaskStatusTabs } from "../../components/task-status-tabs.jsx";
import { TaskCard } from "../../components/Cards/task-card.jsx";
import {toast} from "react-toastify";

// Маппинг для фильтрации и отображения
const statusMap = {
    "Все": "",
    "Ожидает": "Pending",
    "В работе": "In Progress",
    "Завершено": "Completed",
};

export const ManageTasks = () => {
    const [allTasks, setAllTasks] = useState([]);
    const [tabs, setTabs] = useState([]);
    const [filterStatus, setFilterStatus] = useState("Все");
    const navigate = useNavigate();

    const getAllTasks = async () => {
        try {
            const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS, {
                params: {
                    status: statusMap[filterStatus] || "",
                },
            });

            setAllTasks(response.data?.tasks?.length > 0 ? response.data.tasks : []);

            const statusSummary = response.data?.statusSummary || {};

            const statusArray = [
                { label: "Все", count: statusSummary.all || 0 },
                { label: "Ожидает", count: statusSummary.pendingTasks || 0 },
                { label: "В работе", count: statusSummary.inProgressTasks || 0 },
                { label: "Завершено", count: statusSummary.completedTasks || 0 },
            ];

            setTabs(statusArray);
        } catch (error) {
            console.error("Ошибка при получении задач:", error);
        }
    };

    const handleClick = (taskData) => {
        navigate(`/admin/create-task`, { state: { taskId: taskData._id } });
    };
    const handleDownloadReport = async () => {
        try {
            const response = await axiosInstance.get(API_PATHS.REPORTS.EXPORT_TASKS, {
                responseType: "blob",
            });

            // Create a URL for the blob
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "task_details.xlsx");
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading details:", error);
            toast.error("Failed to download details. Please try again.");
        }
    };
    useEffect(() => {
        getAllTasks(filterStatus);
    }, [filterStatus]);

    return (
        <DashboardLayout activeMenu="Manage Tasks">
            <div className="my-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-xl md:text-xl font-medium">Мои задачи</h2>

                        <button
                            className="flex lg:hidden download-btn"
                            onClick={handleDownloadReport}
                        >
                            <LuFileSpreadsheet className="text-lg" />
                            Скачать отчет
                        </button>
                    </div>

                    {tabs?.[0]?.count > 0 && (
                        <div className="flex items-center gap-3">
                            <TaskStatusTabs
                                tabs={tabs}
                                activeTab={filterStatus}
                                setActiveTab={setFilterStatus}
                            />

                            <button
                                className="hidden lg:flex download-btn"
                                onClick={handleDownloadReport}
                            >
                                <LuFileSpreadsheet className="text-lg" />
                                Скачать отчет
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    {allTasks?.map((item) => (
                        <TaskCard
                            key={item._id}
                            title={item.title}
                            description={item.description}
                            priority={item.priority}
                            status={item.status}
                            progress={item.progress}
                            createdAt={item.createdAt}
                            dueDate={item.dueDate}
                            assignedTo={item.assignedTo?.map((user) => user.profileImageUrl)}
                            attachmentCount={item.attachments?.length || 0}
                            completedTodoCount={item.completedTodoCount || 0}
                            todoChecklist={item.todoChecklist || []}
                            onClick={() => handleClick(item)}
                        />
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
};
