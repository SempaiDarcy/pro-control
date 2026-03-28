import React, { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/layouts/dashboard-layout.jsx";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axios-instance.js";
import { API_PATHS } from "../../utils/api-paths.js";
import { LuFileSpreadsheet } from "react-icons/lu";
import { TaskStatusTabs } from "../../components/task-status-tabs.jsx";
import { TaskCard } from "../../components/Cards/task-card.jsx";
import { toast } from "react-toastify";
import { SelectDropdown } from "../../components/inputs/select-dropdown.jsx";
import { PRIORITY_DATA } from "../../utils/data.js";

const statusMap = {
    Все: "",
    Ожидает: "Pending",
    "В работе": "In Progress",
    Завершено: "Completed",
};

const SORT_OPTIONS = [
    { label: "По умолчанию", value: "" },
    { label: "Срок (раньше — выше)", value: "dueAsc" },
    { label: "Срок (позже — выше)", value: "dueDesc" },
];

export const ManageTasks = () => {
    const [allTasks, setAllTasks] = useState([]);
    const [tabs, setTabs] = useState([]);
    const [filterStatus, setFilterStatus] = useState("Все");
    const [searchQ, setSearchQ] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("");
    const [projectFilter, setProjectFilter] = useState("");
    const [assigneeFilter, setAssigneeFilter] = useState("");
    const [overdueOnly, setOverdueOnly] = useState(false);
    const [sortDue, setSortDue] = useState("");
    const [projects, setProjects] = useState([]);
    const [members, setMembers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            try {
                const [projRes, usersRes] = await Promise.all([
                    axiosInstance.get(API_PATHS.PROJECTS.LIST),
                    axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS),
                ]);
                setProjects(Array.isArray(projRes.data) ? projRes.data : []);
                setMembers(Array.isArray(usersRes.data) ? usersRes.data : []);
            } catch (error) {
                console.error("Ошибка при загрузке фильтров:", error);
            }
        };
        load();
    }, []);

    const buildQueryParams = () => {
        const params = {};
        const st = statusMap[filterStatus];
        if (st) params.status = st;
        if (searchQ.trim()) params.q = searchQ.trim();
        if (priorityFilter) params.priority = priorityFilter;
        if (projectFilter) params.project = projectFilter;
        if (assigneeFilter) params.assignedTo = assigneeFilter;
        if (overdueOnly) params.overdue = "true";
        if (sortDue === "dueAsc") {
            params.sortBy = "dueDate";
            params.order = "asc";
        } else if (sortDue === "dueDesc") {
            params.sortBy = "dueDate";
            params.order = "desc";
        }
        return params;
    };

    const getAllTasks = async () => {
        try {
            const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS, {
                params: buildQueryParams(),
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
        getAllTasks();
    }, [
        filterStatus,
        searchQ,
        priorityFilter,
        projectFilter,
        assigneeFilter,
        overdueOnly,
        sortDue,
    ]);

    const projectOptions = [
        { label: "Все проекты", value: "" },
        ...projects.map((p) => ({ label: p.title, value: String(p._id) })),
    ];

    const assigneeOptions = [
        { label: "Все исполнители", value: "" },
        ...members.map((u) => ({ label: u.name, value: String(u._id) })),
    ];

    const priorityOptions = [{ label: "Все приоритеты", value: "" }, ...PRIORITY_DATA];

    return (
        <DashboardLayout activeMenu="Manage Tasks">
            <div className="my-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
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

                    <div className="flex flex-wrap items-center gap-3">
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
                </div>

                <div className="mt-4 space-y-3">
                    <div>
                        <label className="text-xs font-medium text-slate-600">Поиск</label>
                        <input
                            className="form-input mt-1"
                            placeholder="Название или описание"
                            value={searchQ}
                            onChange={({ target }) => setSearchQ(target.value)}
                        />
                    </div>

                    <div className="flex flex-wrap gap-3 items-end">
                        <div className="w-full sm:w-[calc(50%-0.375rem)] md:w-44 min-w-0">
                            <label className="text-xs font-medium text-slate-600">Приоритет</label>
                            <SelectDropdown
                                options={priorityOptions}
                                value={priorityFilter}
                                onChange={setPriorityFilter}
                                placeholder="Все приоритеты"
                            />
                        </div>
                        <div className="w-full sm:w-[calc(50%-0.375rem)] md:w-48 min-w-0">
                            <label className="text-xs font-medium text-slate-600">Проект</label>
                            <SelectDropdown
                                options={projectOptions}
                                value={projectFilter}
                                onChange={setProjectFilter}
                                placeholder="Все проекты"
                            />
                        </div>
                        <div className="w-full sm:w-[calc(50%-0.375rem)] md:w-48 min-w-0">
                            <label className="text-xs font-medium text-slate-600">Исполнитель</label>
                            <SelectDropdown
                                options={assigneeOptions}
                                value={assigneeFilter}
                                onChange={setAssigneeFilter}
                                placeholder="Все исполнители"
                            />
                        </div>
                        <div className="w-full sm:w-[calc(50%-0.375rem)] md:w-52 min-w-0">
                            <label className="text-xs font-medium text-slate-600">Сортировка по сроку</label>
                            <SelectDropdown
                                options={SORT_OPTIONS}
                                value={sortDue}
                                onChange={setSortDue}
                                placeholder="По умолчанию"
                            />
                        </div>
                        <div className="w-full sm:w-auto pb-1">
                            <button
                                type="button"
                                onClick={() => setOverdueOnly((v) => !v)}
                                className={`text-sm font-medium px-3 py-2.5 rounded-md border transition-colors ${
                                    overdueOnly
                                        ? "text-rose-600 bg-rose-50 border-rose-200"
                                        : "text-gray-700 bg-white border-slate-100"
                                }`}
                            >
                                Просроченные
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    {allTasks?.map((item) => (
                        <TaskCard
                            key={item._id}
                            title={item.title}
                            description={item.description}
                            projectTitle={item.project?.title}
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
