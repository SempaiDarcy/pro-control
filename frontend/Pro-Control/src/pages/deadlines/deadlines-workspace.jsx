import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/user-context.jsx";
import { DashboardLayout } from "../../components/layouts/dashboard-layout.jsx";
import { useUserAuth } from "../../hooks/use-user-auth.jsx";
import axiosInstance from "../../utils/axios-instance.js";
import { API_PATHS } from "../../utils/api-paths.js";
import toast from "react-hot-toast";
import { LuChevronDown, LuUser } from "react-icons/lu";
import { Modal } from "../../components/modal.jsx";

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
            return "bg-teal-50/95 text-teal-900 ring-teal-600/12";
        case "Medium":
            return "bg-amber-50/95 text-amber-900 ring-amber-600/14";
        case "High":
        default:
            return "bg-rose-50/95 text-rose-900 ring-rose-600/14";
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
            return "bg-sky-50/95 text-sky-900 ring-sky-600/12";
        case "Completed":
            return "bg-emerald-50/95 text-emerald-900 ring-emerald-600/12";
        case "Pending":
        default:
            return "bg-violet-50/95 text-violet-900 ring-violet-600/12";
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

const SECTION_SHELL_BY_TONE = {
    overdue:
        "rounded-xl border border-zinc-200/80 bg-rose-50/28 shadow-[0_1px_2px_rgba(0,0,0,0.04)] border-l-[3px] border-l-rose-400/50",
    today:
        "rounded-xl border border-zinc-200/80 bg-amber-50/22 shadow-[0_1px_2px_rgba(0,0,0,0.04)] border-l-[3px] border-l-amber-400/45",
    week:
        "rounded-xl border border-zinc-200/80 bg-slate-50/48 shadow-[0_1px_2px_rgba(0,0,0,0.04)] border-l-[3px] border-l-slate-400/45",
    soon:
        "rounded-xl border border-zinc-200/80 bg-indigo-50/22 shadow-[0_1px_2px_rgba(0,0,0,0.04)] border-l-[3px] border-l-indigo-400/38",
};

const TASK_CARD_BY_TONE = {
    overdue:
        "rounded-lg border border-rose-200/50 bg-rose-50/62 transition-[border-color,box-shadow,background-color] hover:border-rose-300/55 hover:bg-rose-50/88 hover:shadow-[0_1px_3px_rgba(0,0,0,0.05)] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rose-300/55",
    today:
        "rounded-lg border border-amber-200/48 bg-amber-50/58 transition-[border-color,box-shadow,background-color] hover:border-amber-300/50 hover:bg-amber-50/82 hover:shadow-[0_1px_3px_rgba(0,0,0,0.05)] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-300/50",
    week:
        "rounded-lg border border-slate-200/55 bg-slate-50/78 transition-[border-color,box-shadow,background-color] hover:border-slate-300/55 hover:bg-slate-100/55 hover:shadow-[0_1px_3px_rgba(0,0,0,0.05)] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-300/55",
    soon:
        "rounded-lg border border-indigo-200/42 bg-indigo-50/48 transition-[border-color,box-shadow,background-color] hover:border-indigo-300/48 hover:bg-indigo-50/72 hover:shadow-[0_1px_3px_rgba(0,0,0,0.05)] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-300/50",
};

const EMPTY_STATE_BY_TONE = {
    overdue: "rounded-lg border border-rose-200/35 bg-rose-50/36 py-8",
    today: "rounded-lg border border-amber-200/32 bg-amber-50/34 py-8",
    week: "rounded-lg border border-slate-200/40 bg-slate-50/42 py-8",
    soon: "rounded-lg border border-indigo-200/32 bg-indigo-50/32 py-8",
};

const SKELETON_CARD_BY_TONE = {
    overdue: "border border-rose-200/38 bg-rose-50/45",
    today: "border border-amber-200/36 bg-amber-50/42",
    week: "border border-slate-200/42 bg-slate-50/48",
    soon: "border border-indigo-200/34 bg-indigo-50/38",
};

const assigneeNamesLine = (list) =>
    list
        .map((u) => u?.name)
        .filter(Boolean)
        .join(", ");

const MAX_ASSIGNEE_AVATARS = 3;

/**
 * Overlapped avatars +N; modal body/footer как select-users.jsx.
 */
const DeadlineAssigneeCell = ({ assignedTo }) => {
    const list = Array.isArray(assignedTo) ? assignedTo.filter(Boolean) : [];
    const [modalOpen, setModalOpen] = useState(false);

    if (list.length === 0) return null;

    const overflow = Math.max(0, list.length - MAX_ASSIGNEE_AVATARS);
    const shown = overflow > 0 ? list.slice(0, MAX_ASSIGNEE_AVATARS) : list;
    const namesTitle = assigneeNamesLine(list);

    return (
        <>
            <div className="relative shrink-0 pl-2">
                <button
                    type="button"
                    title={namesTitle || undefined}
                    className="inline-flex cursor-pointer items-center justify-end border-0 bg-transparent p-0 shadow-none [appearance:none] outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    aria-label={namesTitle ? `Исполнители: ${namesTitle}` : "Исполнители"}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setModalOpen(true);
                    }}
                >
                    <div className="flex items-center justify-end -space-x-2">
                        {shown.map((u, i) => (
                            <div
                                key={u._id || `${i}-${u.name || ""}`}
                                className="relative inline-flex h-9 w-9 shrink-0 rounded-full ring-2 ring-white"
                                style={{ zIndex: i + 1 }}
                            >
                                {u.profileImageUrl ? (
                                    <img
                                        src={u.profileImageUrl}
                                        alt=""
                                        className="h-9 w-9 rounded-full object-cover shadow-sm ring-1 ring-zinc-200/80"
                                    />
                                ) : (
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 shadow-sm ring-1 ring-zinc-200/70">
                                        <LuUser className="h-4 w-4 text-zinc-500" strokeWidth={1.75} />
                                    </div>
                                )}
                            </div>
                        ))}
                        {overflow > 0 ? (
                            <div
                                className="relative flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-[11px] font-semibold text-zinc-600 ring-2 ring-white"
                                style={{ zIndex: shown.length + 1 }}
                            >
                                +{overflow}
                            </div>
                        ) : null}
                    </div>
                </button>
            </div>

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Исполнители">
                <div className="space-y-4 h-[60vh] overflow-y-auto">
                    {list.map((u) => (
                        <div
                            key={u._id || u.email || u.name}
                            className="flex items-center gap-4 p-3 border-b border-gray-200"
                        >
                            {u.profileImageUrl ? (
                                <img
                                    src={u.profileImageUrl}
                                    alt={u.name || ""}
                                    className="w-10 h-10 rounded-full border-2 border-white"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-gray-600">
                                    <LuUser className="w-5 h-5" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-800 dark:text-white">
                                    {u.name || "Без имени"}
                                </p>
                                {u.email ? (
                                    <p className="text-[13px] text-gray-500">{u.email}</p>
                                ) : null}
                            </div>
                            <span className="inline-block h-4 w-4 shrink-0" aria-hidden="true" />
                        </div>
                    ))}
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" className="card-btn" onClick={() => setModalOpen(false)}>
                        Закрыть
                    </button>
                </div>
            </Modal>
        </>
    );
};

const DeadlineTaskRow = ({ task, overdueAccent, onOpen, sectionTone = "soon" }) => {
    const openRow = () => onOpen(task);
    const cardBase = TASK_CARD_BY_TONE[sectionTone] || TASK_CARD_BY_TONE.soon;

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={openRow}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openRow();
                }
            }}
            className={`group w-full cursor-pointer overflow-hidden px-4 py-3.5 text-left ${cardBase} ${
                overdueAccent ? "border-l-[3px] border-l-rose-400" : ""
            }`}
        >
            <div className="flex gap-3 sm:gap-4">
                <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-1.5 gap-y-1">
                        <span
                            className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${statusClass(
                                task.status
                            )}`}
                        >
                            {statusLabel(task.status)}
                        </span>
                        <span
                            className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${priorityClass(
                                task.priority
                            )}`}
                        >
                            {priorityLabel(task.priority)}
                        </span>
                        {overdueAccent ? (
                            <span className="inline-flex items-center rounded-md bg-rose-50/95 px-2 py-0.5 text-[11px] font-semibold text-rose-900 ring-1 ring-inset ring-rose-600/16">
                                Просрочено
                            </span>
                        ) : null}
                    </div>
                    <p className="text-[15px] font-semibold leading-snug tracking-tight text-zinc-900 line-clamp-2">
                        {task.title}
                    </p>
                    <p className="mt-1 line-clamp-1 text-xs text-zinc-500">
                        {task.project?.title ? `Проект: ${task.project.title}` : "Без проекта"}
                    </p>
                    <p
                        className={`mt-2.5 text-xs font-semibold tabular-nums ${
                            overdueAccent ? "text-rose-600" : "text-zinc-500"
                        }`}
                    >
                        Срок:{" "}
                        <span className={overdueAccent ? "text-rose-700" : "font-semibold text-zinc-800"}>
                            {formatDue(task.dueDate)}
                        </span>
                    </p>
                </div>
                <DeadlineAssigneeCell assignedTo={task.assignedTo} />
            </div>
        </div>
    );
};

const DeadlineSectionSkeletonBody = ({ sectionTone = "soon" }) => {
    const sk = SKELETON_CARD_BY_TONE[sectionTone] || SKELETON_CARD_BY_TONE.soon;
    return (
        <div className="flex flex-col gap-2.5">
            {[1, 2, 3].map((i) => (
                <div key={i} className={`h-[5.25rem] animate-pulse rounded-lg ${sk}`} />
            ))}
        </div>
    );
};

const DeadlineSection = ({
    title,
    subtitle,
    tasks,
    overdueAccent,
    emptyText,
    onOpenTask,
    loading = false,
    sectionTone = "soon",
}) => {
    const [expanded, setExpanded] = useState(true);
    const count = tasks.length;
    const shellClass = SECTION_SHELL_BY_TONE[sectionTone] || SECTION_SHELL_BY_TONE.soon;
    const emptyClass = EMPTY_STATE_BY_TONE[sectionTone] || EMPTY_STATE_BY_TONE.soon;

    return (
        <section className={shellClass}>
            <div className="px-5 pt-5 md:px-6 md:pt-6">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                            <h3 className="text-base font-semibold tracking-tight text-zinc-900 md:text-[1.0625rem]">
                                {title}
                            </h3>
                            {!loading && count > 0 ? (
                                <span className="text-xs font-medium tabular-nums text-zinc-400">
                                    {count}
                                </span>
                            ) : null}
                        </div>
                        {subtitle ? (
                            <p className="mt-1 text-sm leading-relaxed text-zinc-500">{subtitle}</p>
                        ) : null}
                    </div>
                    <button
                        type="button"
                        className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-zinc-300/70"
                        aria-expanded={expanded}
                        aria-label={expanded ? "Свернуть секцию" : "Развернуть секцию"}
                        onClick={() => setExpanded((v) => !v)}
                    >
                        <LuChevronDown
                            className={`h-[18px] w-[18px] transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                            strokeWidth={1.75}
                        />
                    </button>
                </div>
            </div>

            {expanded ? (
                <div className="px-5 pb-5 pt-4 md:px-6 md:pb-6">
                    {loading ? (
                        <DeadlineSectionSkeletonBody sectionTone={sectionTone} />
                    ) : count === 0 ? (
                        <div className={emptyClass}>
                            <p className="px-4 text-center text-[13px] leading-relaxed text-zinc-400">
                                {emptyText}
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2.5">
                            {tasks.map((t) => (
                                <DeadlineTaskRow
                                    key={t._id}
                                    task={t}
                                    overdueAccent={overdueAccent}
                                    sectionTone={sectionTone}
                                    onOpen={onOpenTask}
                                />
                            ))}
                        </div>
                    )}
                </div>
            ) : null}
        </section>
    );
};

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

    const body = (
        <>
            <div className="mb-6 md:mb-8">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Планирование
                </p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900 md:text-[1.65rem]">
                    Дедлайны
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
                    Просроченные, сегодня, неделя и ближайшие сроки без календаря
                </p>
            </div>

            <div className="flex flex-col gap-5 md:gap-6">
                <DeadlineSection
                    title="Просроченные"
                    subtitle="Не завершены и срок уже прошёл"
                    tasks={buckets.overdue}
                    overdueAccent
                    sectionTone="overdue"
                    emptyText="Нет просроченных задач"
                    onOpenTask={openTask}
                    loading={loading}
                />

                <DeadlineSection
                    title="Сегодня"
                    subtitle="Срок сегодня"
                    tasks={buckets.today}
                    sectionTone="today"
                    emptyText="Нет задач на сегодня"
                    onOpenTask={openTask}
                    loading={loading}
                />

                <DeadlineSection
                    title="На этой неделе"
                    subtitle="После сегодня до конца календарной недели"
                    tasks={buckets.thisWeek}
                    sectionTone="week"
                    emptyText="Нет задач на оставшуюся часть недели"
                    onOpenTask={openTask}
                    loading={loading}
                />

                <DeadlineSection
                    title="Скоро истекают"
                    subtitle="В течение двух недель после конца текущей недели"
                    tasks={buckets.soon}
                    sectionTone="soon"
                    emptyText="Нет задач в этом окне"
                    onOpenTask={openTask}
                    loading={loading}
                />
            </div>
        </>
    );

    return <DashboardLayout activeMenu={menuPath}>{body}</DashboardLayout>;
};
