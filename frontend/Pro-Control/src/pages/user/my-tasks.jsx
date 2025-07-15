import React, { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/layouts/dashboard-layout.jsx";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axios-instance.js";
import { API_PATHS } from "../../utils/api-paths.js";
import { TaskStatusTabs } from "../../components/task-status-tabs.jsx";
import { TaskCard } from "../../components/Cards/task-card.jsx";

// Маппинг для перевода русских статусов в английские для API
const statusMap = {
    "Все": "",
    "Ожидает": "Pending",
    "В работе": "In Progress",
    "Завершено": "Completed",
};

export const MyTasks = () => {
    const [allTasks, setAllTasks] = useState([]);
    const [tabs, setTabs] = useState([]);
    const [filterStatus, setFilterStatus] = useState("Все"); // теперь русское значение
    const navigate = useNavigate();

    const getAllTasks = async () => {
        try {
            const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS, {
                params: {
                    status: statusMap[filterStatus] || "", // фильтрация по английским значениям
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

    const handleClick = (taskId) => {
        navigate(`/user/task-details/${taskId}`);
    };

    useEffect(() => {
        getAllTasks(filterStatus);
    }, [filterStatus]);

    return (
        <DashboardLayout activeMenu="Мои задачи">
            <div className="my-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                    <h2 className="text-xl md:text-xl font-medium">Мои задачи</h2>

                    {tabs?.[0]?.count > 0 && (
                        <TaskStatusTabs
                            tabs={tabs}
                            activeTab={filterStatus}
                            setActiveTab={setFilterStatus}
                        />
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
                            onClick={() => handleClick(item._id)}
                        />
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
};
