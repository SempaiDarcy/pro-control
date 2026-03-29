import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/user-context.jsx";
import { DashboardLayout } from "../../components/layouts/dashboard-layout.jsx";
import { useUserAuth } from "../../hooks/use-user-auth.jsx";
import axiosInstance from "../../utils/axios-instance.js";
import { API_PATHS } from "../../utils/api-paths.js";
import { AvatarGroup } from "../../components/avatar-group.jsx";
import toast from "react-hot-toast";

const startOfDay = (d) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x.getTime();
};

const endOfDay = (d) => {
    const x = new Date(d);
    x.setHours(23, 59, 59, 999);
    return x.getTime();
};

const endOfCalendarWeekSunday = (ref) => {
    const date = new Date(ref);
    const dow = date.getDay();
    const daysUntilSunday = dow === 0 ? 0 : 7 - dow;
    const end = new Date(date);
    end.setDate(date.getDate() + daysUntilSunday);
    end.setHours(23, 59, 59, 999);
    return end.getTime();
};

const addDaysEnd = (timeMs, days) => {
    const d = new Date(timeMs);
    d.setDate(d.getDate() + days);
    d.setHours(23, 59, 59, 999);
    return d.getTime();
};

const bucketByDeadline = (tasks) => {
    const now = new Date();
    const t0 = startOfDay(now);
    const t1 = endOfDay(now);
    const weekEnd = endOfCalendarWeekSunday(now);
    const soonEnd = addDaysEnd(weekEnd, 14);

    const overdue = [];
    const today = [];
    const thisWeek = [];
    const soon = [];

    (tasks || []).forEach((task) => {
        if (task.status === "Completed") return;
        const due = task.dueDate ? new Date(task.dueDate).getTime() : null;
        if (due == null || Number.isNaN(due)) return;

        if (due < t0) overdue.push(task);
        else if (due >= t0 && due <= t1) today.push(task);
        else if (due > t1 && due <= weekEnd) thisWeek.push(task);
        else if (due > weekEnd && due <= soonEnd) soon.push(task);
    });

    const byDue = (a, b) =>
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();

    overdue.sort(byDue);
    today.sort(byDue);
    thisWeek.sort(byDue);
    soon.sort(byDue);

    return { overdue, today, thisWeek, soon };
};

const priorityClass = (p) => {
    switch (p) {
        case "Low":
            return "text-emerald-600 bg-emerald-50 border-emerald-200/70";
        case "Medium":
            return "text-amber-600 bg-amber-50 border-amber-200/70";
        case "High":
        default:
            return "text-rose-600 bg-rose-50 border-rose-200/70";
    }
};

const priorityLabel = (p) => {
    switch (p) {
        case "Low":
            return "Низкий";
        case "Medium":
            return "Средний";
        case "High":
            return "Высокий";
        default:
            return p || "";
    }
};

const statusClass = (s) => {
    switch (s) {
        case "In Progress":
            return "text-cyan-600 bg-cyan-50 border-cyan-200/70";
        case "Completed":
            return "text-lime-600 bg-lime-50 border-lime-200/70";
        case "Pending":
        default:
            return "text-violet-600 bg-violet-50 border-violet-200/70";
    }
};

const statusLabel = (s) => {
    switch (s) {
        case "In Progress":
            return "В работе";
        case "Completed":
            return "Завершено";
        case "Pending":
            return "Ожидает";
        default:
            return s || "";
    }
};

const formatDue = (dueDate) =>
    new Date(dueDate).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

const DeadlineTaskRow = ({ task, overdueAccent, onOpen }) => {
    const avatars = (task.assignedTo || []).map((u) => u.profileImageUrl || "");
    const names = (task.assignedTo || []).map((u) => u.name || "");

    return (
        <button
            type="button"
            onClick={() => onOpen(task)}
            className={`w-full text-left rounded-lg border bg-white px-3 py-2.5 transition-colors hover:bg-gray-50/80 ${
                overdueAccent
                    ? "border-rose-200/90 ring-1 ring-rose-100/60"
                    : "border-gray-200/80"
            }`}
        >
            <div className="flex flex-wrap items-center gap-1.5 gap-y-1 mb-1.5">
                <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded border ${statusClass(
                        task.status
                    )}`}
                >
                    {statusLabel(task.status)}
                </span>
                <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded border ${priorityClass(
                        task.priority
                    )}`}
                >
                    {priorityLabel(task.priority)}
                </span>
                {overdueAccent ? (
                    <span className="text-[10px] font-medium text-rose-700 bg-rose-50 border border-rose-200/80 px-2 py-0.5 rounded">
                        Просрочено
                    </span>
                ) : null}
            </div>
            <p className="text-[13px] font-medium text-gray-900 line-clamp-2">{task.title}</p>
            <p className="text-[11px] text-gray-500 mt-1 line-clamp-1">
                {task.project?.title ? `Проект: ${task.project.title}` : "Без проекта"}
            </p>
            <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                <span
                    className={`text-[11px] font-medium ${
                        overdueAccent ? "text-rose-600" : "text-gray-600"
                    }`}
                >
                    Срок: {formatDue(task.dueDate)}
                </span>
                {names.length > 0 ? (
                    <div className="scale-75 origin-right">
                        <AvatarGroup avatars={avatars} names={names} maxVisible={4} />
                    </div>
                ) : null}
            </div>
        </button>
    );
};

const Section = ({ title, subtitle, tasks, overdueAccent, emptyText, onOpenTask }) => (
    <section className="mb-8 last:mb-0">
        <div className="mb-3">
            <h3 className="text-base font-medium text-gray-900">{title}</h3>
            {subtitle ? <p className="text-[12px] text-gray-500 mt-0.5">{subtitle}</p> : null}
        </div>
        {tasks.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/40 px-4 py-6 text-center text-[13px] text-gray-500">
                {emptyText}
            </div>
        ) : (
            <div className="flex flex-col gap-2">
                {tasks.map((t) => (
                    <DeadlineTaskRow
                        key={t._id}
                        task={t}
                        overdueAccent={overdueAccent}
                        onOpen={onOpenTask}
                    />
                ))}
            </div>
        )}
    </section>
);

export const DeadlinesWorkspace = () => {
    useUserAuth();
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const menuPath = user?.role === "admin" ? "/admin/deadlines" : "/user/deadlines";

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS);
                const list = res.data?.tasks;
                setTasks(Array.isArray(list) ? list : []);
            } catch (e) {
                console.error(e);
                toast.error("Не удалось загрузить задачи");
                setTasks([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const buckets = useMemo(() => bucketByDeadline(tasks), [tasks]);

    const openTask = (task) => {
        if (user?.role === "admin") {
            navigate("/admin/create-task", { state: { taskId: task._id } });
        } else {
            navigate(`/user/task-details/${task._id}`);
        }
    };

    return (
        <DashboardLayout activeMenu={menuPath}>
            <div className="my-5">
                <div className="mb-6">
                    <h2 className="text-xl md:text-2xl font-medium text-gray-900">Дедлайны</h2>
                    <p className="text-[13px] text-gray-500 mt-1">
                        Контроль сроков: просроченные, сегодня, неделя и ближайшие даты
                    </p>
                </div>

                {loading ? (
                    <p className="text-sm text-gray-500">Загрузка…</p>
                ) : (
                    <>
                        <div className="rounded-xl border border-rose-100/90 bg-rose-50/20 p-4 mb-8">
                            <Section
                                title="Просроченные"
                                subtitle="Не завершены и срок уже прошёл"
                                tasks={buckets.overdue}
                                overdueAccent
                                emptyText="Нет просроченных задач"
                                onOpenTask={openTask}
                            />
                        </div>

                        <Section
                            title="Сегодня"
                            subtitle="Срок сегодня"
                            tasks={buckets.today}
                            emptyText="Нет задач на сегодня"
                            onOpenTask={openTask}
                        />

                        <Section
                            title="На этой неделе"
                            subtitle="После сегодня до конца календарной недели"
                            tasks={buckets.thisWeek}
                            emptyText="Нет задач на оставшуюся часть недели"
                            onOpenTask={openTask}
                        />

                        <Section
                            title="Скоро истекают"
                            subtitle="В течение двух недель после конца текущей недели"
                            tasks={buckets.soon}
                            emptyText="Нет задач в этом окне"
                            onOpenTask={openTask}
                        />
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};
