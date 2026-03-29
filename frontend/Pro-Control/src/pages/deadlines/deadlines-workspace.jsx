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
            return "text-emerald-700 bg-emerald-50 border-emerald-200/80";
        case "Medium":
            return "text-amber-800 bg-amber-50 border-amber-200/80";
        case "High":
        default:
            return "text-rose-700 bg-rose-50 border-rose-200/80";
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
            return "text-cyan-800 bg-cyan-50 border-cyan-200/80";
        case "Completed":
            return "text-lime-800 bg-lime-50 border-lime-200/80";
        case "Pending":
        default:
            return "text-violet-800 bg-violet-50 border-violet-200/80";
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
            className={`w-full rounded-xl border bg-app-surface px-4 py-3 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-[box-shadow,border-color,background-color] hover:bg-app-border-muted/40 ${
                overdueAccent
                    ? "border-rose-200/90 ring-1 ring-rose-100/70"
                    : "border-app-border hover:border-neutral-400/30"
            }`}
        >
            <div className="mb-2 flex flex-wrap items-center gap-2 gap-y-1.5">
                <span
                    className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${statusClass(
                        task.status
                    )}`}
                >
                    {statusLabel(task.status)}
                </span>
                <span
                    className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${priorityClass(
                        task.priority
                    )}`}
                >
                    {priorityLabel(task.priority)}
                </span>
                {overdueAccent ? (
                    <span className="inline-flex items-center rounded-md border border-rose-200/90 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-800">
                        Просрочено
                    </span>
                ) : null}
            </div>
            <p className="text-[14px] font-semibold leading-snug text-app-heading line-clamp-2">
                {task.title}
            </p>
            <p className="mt-1 line-clamp-1 text-[12px] text-app-muted">
                {task.project?.title ? `Проект: ${task.project.title}` : "Без проекта"}
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <span
                    className={`text-xs font-semibold tabular-nums ${
                        overdueAccent ? "text-rose-600" : "text-app-muted"
                    }`}
                >
                    Срок:{" "}
                    <span className={overdueAccent ? "" : "text-app-heading"}>
                        {formatDue(task.dueDate)}
                    </span>
                </span>
                {names.length > 0 ? (
                    <div className="origin-right scale-75">
                        <AvatarGroup avatars={avatars} names={names} maxVisible={4} />
                    </div>
                ) : null}
            </div>
        </button>
    );
};

const Section = ({
    title,
    subtitle,
    tasks,
    overdueAccent,
    emptyText,
    onOpenTask,
    sectionClassName = "",
}) => (
    <section
        className={`rounded-2xl border border-app-border bg-app-surface p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] md:p-6 ${sectionClassName}`}
    >
        <div className="mb-4 border-b border-app-border-muted pb-4">
            <h3 className="text-lg font-semibold tracking-tight text-app-heading">
                {title}
            </h3>
            {subtitle ? (
                <p className="mt-1 text-sm leading-relaxed text-app-muted">{subtitle}</p>
            ) : null}
        </div>
        {tasks.length === 0 ? (
            <div className="rounded-xl bg-app-border-muted/50 px-4 py-10 text-center text-sm text-app-muted">
                {emptyText}
            </div>
        ) : (
            <div className="flex flex-col gap-2.5">
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
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold tracking-tight text-app-heading md:text-[1.65rem]">
                        Дедлайны
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-app-muted">
                        Просроченные, сегодня, неделя и ближайшие сроки без календаря
                    </p>
                </div>

                {loading ? (
                    <p className="text-sm text-app-muted">Загрузка…</p>
                ) : (
                    <div className="flex flex-col gap-8">
                        <Section
                            title="Просроченные"
                            subtitle="Не завершены и срок уже прошёл"
                            tasks={buckets.overdue}
                            overdueAccent
                            emptyText="Нет просроченных задач"
                            onOpenTask={openTask}
                            sectionClassName="border-rose-200/70 bg-rose-50/25"
                        />

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
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};
