import React, { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/layouts/dashboard-layout.jsx";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axios-instance.js";
import { API_PATHS } from "../../utils/api-paths.js";
import { TaskStatusTabs } from "../../components/task-status-tabs.jsx";
import { TaskCard } from "../../components/Cards/task-card.jsx";
import { SelectDropdown } from "../../components/inputs/select-dropdown.jsx";
import { PRIORITY_DATA } from "../../utils/data.js";
import { TasksKanbanBoard } from "../../components/tasks-kanban-board.jsx";
import toast from "react-hot-toast";

const statusMap = {
    Все: "",
    Ожидает: "Pending",
    "В работе": "In Progress",
    Завершено: "Completed",
};

const SORT_OPTIONS = [
    { label: "По умолчанию", value: "" },
    { label: "По сроку: сначала ранние", value: "dueAsc" },
    { label: "По сроку: сначала поздние", value: "dueDesc" },
];

export const MyTasks = () => {
    const [allTasks, setAllTasks] = useState([]);
    const [tabs, setTabs] = useState([]);
    const [filterStatus, setFilterStatus] = useState("Все");
    const [searchQ, setSearchQ] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("");
    const [projectFilter, setProjectFilter] = useState("");
    const [overdueOnly, setOverdueOnly] = useState(false);
    const [sortDue, setSortDue] = useState("");
    const [projects, setProjects] = useState([]);
    const [viewMode, setViewMode] = useState("list");
    const navigate = useNavigate();

    useEffect(() => {
        const loadProjects = async () => {
            try {
                const response = await axiosInstance.get(API_PATHS.PROJECTS.LIST);
                setProjects(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error("Ошибка при загрузке проектов:", error);
            }
        };
        loadProjects();
    }, []);

    const buildQueryParams = () => {
        const params = {};
        const st = statusMap[filterStatus];
        if (st && viewMode !== "kanban") params.status = st;
        if (searchQ.trim()) params.q = searchQ.trim();
        if (priorityFilter) params.priority = priorityFilter;
        if (projectFilter) params.project = projectFilter;
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

    const handleOpenTask = (taskOrId) => {
        const id = typeof taskOrId === "object" ? taskOrId._id : taskOrId;
        navigate(`/user/task-details/${id}`);
    };

    const handleKanbanStatusChange = async (taskId, newStatus) => {
        try {
            await axiosInstance.put(API_PATHS.TASKS.UPDATE_TASK_STATUS(taskId), {
                status: newStatus,
            });
            await getAllTasks();
        } catch (error) {
            const msg =
                error.response?.data?.message || "Не удалось изменить статус задачи";
            toast.error(msg);
        }
    };

    useEffect(() => {
        getAllTasks();
    }, [
        viewMode,
        filterStatus,
        searchQ,
        priorityFilter,
        projectFilter,
        overdueOnly,
        sortDue,
    ]);

    const projectOptions = [
        { label: "Все проекты", value: "" },
        ...projects.map((p) => ({ label: p.title, value: String(p._id) })),
    ];

    const priorityOptions = [{ label: "Все приоритеты", value: "" }, ...PRIORITY_DATA];

    return (
        <DashboardLayout activeMenu="Мои задачи">
            <div className="my-5">
                <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl md:text-xl font-medium">Мои задачи</h2>
                    <div className="inline-flex rounded-md border border-slate-100 overflow-hidden text-sm shrink-0">
                        <button
                            type="button"
                            className={`px-3 py-1.5 font-medium ${
                                viewMode === "list"
                                    ? "bg-primary text-white"
                                    : "bg-white text-gray-700"
                            }`}
                            onClick={() => setViewMode("list")}
                        >
                            Список
                        </button>
                        <button
                            type="button"
                            className={`px-3 py-1.5 font-medium border-l border-slate-100 ${
                                viewMode === "kanban"
                                    ? "bg-primary text-white"
                                    : "bg-white text-gray-700"
                            }`}
                            onClick={() => setViewMode("kanban")}
                        >
                            Доска
                        </button>
                    </div>
                </div>

                <div className="mt-3 rounded-lg border border-slate-100 bg-white p-3 sm:p-4 shadow-sm shadow-gray-100/50">
                    <div className="flex flex-col xl:flex-row gap-4 xl:gap-5 2xl:gap-6 xl:items-end">
                        <div className="w-full xl:w-[min(100%,17.5rem)] xl:max-w-[20rem] shrink-0">
                            <label className="text-xs font-semibold text-slate-800">
                                Поиск
                            </label>
                            <input
                                className="form-input mt-1.5 w-full py-2"
                                placeholder="Найти по названию или описанию"
                                value={searchQ}
                                onChange={({ target }) => setSearchQ(target.value)}
                                type="search"
                                autoComplete="off"
                            />
                        </div>
                        <div className="min-w-0 flex-1 border-t border-slate-100 pt-3 xl:border-t-0 xl:pt-0 xl:border-l xl:border-slate-100 xl:pl-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-x-3 gap-y-3 2xl:gap-x-4 items-end">
                                <div className="min-w-0">
                                    <label className="text-xs font-medium text-slate-600">
                                        Приоритет
                                    </label>
                                    <SelectDropdown
                                        options={priorityOptions}
                                        value={priorityFilter}
                                        onChange={setPriorityFilter}
                                        placeholder="Все приоритеты"
                                        compact
                                    />
                                </div>
                                <div className="min-w-0">
                                    <label className="text-xs font-medium text-slate-600">
                                        Проект
                                    </label>
                                    <SelectDropdown
                                        options={projectOptions}
                                        value={projectFilter}
                                        onChange={setProjectFilter}
                                        placeholder="Все проекты"
                                        compact
                                    />
                                </div>
                                <div className="min-w-0">
                                    <label className="text-xs font-medium text-slate-600">
                                        Сортировка по сроку
                                    </label>
                                    <SelectDropdown
                                        options={SORT_OPTIONS}
                                        value={sortDue}
                                        onChange={setSortDue}
                                        placeholder="По умолчанию"
                                        compact
                                    />
                                </div>
                                <div className="shrink-0 sm:col-span-2 lg:col-span-1 xl:col-span-1 2xl:col-span-1 flex flex-col justify-end">
                                    <span
                                        className="text-xs font-medium text-slate-600 select-none invisible h-[14px] block"
                                        aria-hidden="true"
                                    >
                                        .
                                    </span>
                                    <div className="mt-1.5">
                                        <button
                                            type="button"
                                            onClick={() => setOverdueOnly((v) => !v)}
                                            className={`text-xs font-semibold px-3 py-2 rounded-md border transition-colors whitespace-nowrap w-full sm:w-auto ${
                                                overdueOnly
                                                    ? "text-rose-700 bg-rose-50 border-rose-300 shadow-sm"
                                                    : "text-slate-700 bg-transparent border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50/80"
                                            }`}
                                        >
                                            Просроченные
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-2 min-h-[44px] flex items-end">
                    {viewMode === "list" ? (
                        <TaskStatusTabs
                            tabs={tabs}
                            activeTab={filterStatus}
                            setActiveTab={setFilterStatus}
                            wrapperClassName="my-0 w-full"
                        />
                    ) : (
                        <div className="w-full" aria-hidden="true" />
                    )}
                </div>

                {viewMode === "list" ? (
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
                                onClick={() => handleOpenTask(item._id)}
                            />
                        ))}
                    </div>
                ) : (
                    <TasksKanbanBoard
                        tasks={allTasks}
                        onTaskOpen={handleOpenTask}
                        onTaskStatusChange={handleKanbanStatusChange}
                    />
                )}
            </div>
        </DashboardLayout>
    );
};
