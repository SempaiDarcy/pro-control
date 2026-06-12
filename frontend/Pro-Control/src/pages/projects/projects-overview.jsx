import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/user-context.jsx";
import { useUserAuth } from "../../hooks/use-user-auth.jsx";
import axiosInstance from "../../utils/axios-instance.js";
import { API_PATHS } from "../../utils/api-paths.js";
import { Progress } from "../../components/progress.jsx";
import { AvatarGroup } from "../../components/avatar-group.jsx";
import toast from "react-hot-toast";
import { LuFolders } from "react-icons/lu";

const STATUS_LABEL = {
    Planning: "Планирование",
    Active: "Активен",
    Completed: "Завершён",
    "On Hold": "На паузе",
};

const statusBadgeClass = (status) => {
    switch (status) {
        case "Active":
            return "bg-cyan-50 text-cyan-700 ring-1 ring-inset ring-cyan-600/15";
        case "Completed":
            return "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-600/15";
        case "On Hold":
            return "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-600/15";
        case "Planning":
        default:
            return "bg-violet-50 text-violet-800 ring-1 ring-inset ring-violet-600/15";
    }
};

const formatDue = (due) => {
    if (!due) return "Не задан";
    return new Date(due).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

const ProjectCard = ({ project }) => {
    const title = project.title || "Без названия";
    const desc = project.description?.trim() || "";
    const members = project.members || [];
    const avatars = members.map((m) => m.profileImageUrl || "");
    const names = members.map((m) => m.name || "");
    const progress = Number.isFinite(project.progressPercent) ? project.progressPercent : 0;
    const barStatus = progress >= 100 ? "Completed" : "In Progress";

    return (
        <div
            className="group flex min-h-[196px] flex-col rounded-xl border border-app-border bg-app-surface p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-[box-shadow,border-color] duration-200 hover:border-neutral-400/35 hover:shadow-md"
        >
            <div className="min-w-0 flex-1">
                <h3 className="text-[15px] font-semibold leading-snug tracking-tight text-app-heading line-clamp-2">
                    {title}
                </h3>
                <p className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-app-muted">
                    {desc || "Описание не заполнено"}
                </p>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusBadgeClass(
                        project.status
                    )}`}
                >
                    {STATUS_LABEL[project.status] || project.status}
                </span>
                <span className="text-[11px] font-medium tabular-nums text-app-muted">
                    Срок:{" "}
                    <span className="text-app-heading">{formatDue(project.dueDate)}</span>
                </span>
            </div>

            <div className="mt-2.5 text-[12px] text-app-muted">
                <span className="font-medium text-app-heading">
                    {project.completedTaskCount ?? 0}
                </span>
                <span className="text-slate-400"> / </span>
                <span className="font-medium text-app-heading">{project.taskCount ?? 0}</span>
                <span className="ml-1">задач завершено</span>
            </div>

            <div className="mt-3 border-t border-app-border-muted pt-3">
                <div className="mb-1 flex items-center justify-between text-[11px] font-medium text-app-muted">
                    <span className="uppercase tracking-wide">Прогресс</span>
                    <span className="tabular-nums text-app-heading">{progress}%</span>
                </div>
                <Progress progress={progress} status={barStatus} />
            </div>

            <div className="mt-3 flex items-center justify-between gap-2 border-t border-app-border-muted pt-3">
                <span className="shrink-0 text-[11px] font-medium uppercase tracking-wide text-app-muted">
                    Участники · {project.participantCount ?? 0}
                </span>
                {members.length > 0 ? (
                    <div className="origin-right scale-90">
                        <AvatarGroup avatars={avatars} names={names} maxVisible={4} />
                    </div>
                ) : null}
            </div>
        </div>
    );
};

const ProjectsSkeleton = () => (
    <div className="animate-pulse space-y-6">
        <div className="h-4 w-40 rounded-md bg-app-border" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((k) => (
                <div key={k} className="h-44 rounded-xl bg-app-border/80" />
            ))}
        </div>
    </div>
);

export const ProjectsOverview = () => {
    useUserAuth();
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await axiosInstance.get(API_PATHS.PROJECTS.LIST);
                setProjects(Array.isArray(res.data) ? res.data : []);
            } catch (e) {
                console.error(e);
                toast.error("Не удалось загрузить проекты");
                setProjects([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return (
        <div className="my-5">
                <div className="overflow-hidden rounded-2xl border border-app-border bg-app-surface shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                    <header className="border-b border-app-border bg-app-surface px-6 pb-6 pt-7 md:px-8">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div className="min-w-0">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-app-muted">
                                    Портфель
                                </p>
                                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-app-heading md:text-[1.85rem] md:leading-tight">
                                    Проекты
                                </h1>
                                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-app-muted">
                                    Сроки, статусы и прогресс по задачам в одном обзоре
                                </p>
                            </div>
                            {user?.role === "admin" ? (
                                <button
                                    type="button"
                                    className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-primary/25 transition-colors hover:bg-primary-hover sm:self-auto"
                                    onClick={() => navigate("/admin/create-project")}
                                >
                                    Создать проект
                                </button>
                            ) : null}
                        </div>
                    </header>

                    <div className="bg-app-canvas/50 px-6 py-6 md:px-8 md:py-8">
                        {loading ? (
                            <ProjectsSkeleton />
                        ) : projects.length === 0 ? (
                            <div className="flex w-full flex-col items-center px-4 py-14 text-center md:py-16">
                                <div
                                    className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-app-surface text-app-muted shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-app-border/60"
                                    aria-hidden
                                >
                                    <LuFolders className="h-8 w-8" strokeWidth={1.5} />
                                </div>
                                <h3 className="text-base font-semibold text-app-heading">
                                    Проектов пока нет
                                </h3>
                                <p className="mt-2 max-w-sm text-sm leading-relaxed text-app-muted">
                                    Здесь появятся карточки со сроками и прогрессом по задачам.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-3">
                                {projects.map((p) => (
                                    <ProjectCard key={p._id} project={p} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
    );
};
