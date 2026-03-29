import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/user-context.jsx";
import { DashboardLayout } from "../../components/layouts/dashboard-layout.jsx";
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
            return "text-cyan-600 bg-cyan-50 border-cyan-200/80";
        case "Completed":
            return "text-lime-700 bg-lime-50 border-lime-200/80";
        case "On Hold":
            return "text-amber-700 bg-amber-50 border-amber-200/80";
        case "Planning":
        default:
            return "text-violet-600 bg-violet-50 border-violet-200/80";
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
        <div className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm shadow-gray-100/60 flex flex-col gap-3 min-h-[200px]">
            <div className="min-w-0">
                <h3 className="text-[15px] font-medium text-gray-900 line-clamp-2 leading-snug">
                    {title}
                </h3>
                <p className="text-[13px] text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                    {desc || "Описание не заполнено"}
                </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded border ${statusBadgeClass(
                        project.status
                    )}`}
                >
                    {STATUS_LABEL[project.status] || project.status}
                </span>
                <span className="text-[11px] text-gray-500">
                    Дедлайн: {formatDue(project.dueDate)}
                </span>
            </div>
            <div className="text-[12px] text-gray-600">
                Задачи: {project.completedTaskCount ?? 0} из {project.taskCount ?? 0} завершено
            </div>
            <div>
                <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                    <span>Прогресс</span>
                    <span>{progress}%</span>
                </div>
                <Progress progress={progress} status={barStatus} />
            </div>
            <div className="mt-auto pt-1 flex items-center justify-between gap-2">
                <span className="text-[11px] text-gray-500 shrink-0">
                    Участники: {project.participantCount ?? 0}
                </span>
                {members.length > 0 ? (
                    <div className="scale-90 origin-right">
                        <AvatarGroup avatars={avatars} names={names} maxVisible={4} />
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export const ProjectsOverview = () => {
    useUserAuth();
    const { user } = useContext(UserContext);
    const menuPath = user?.role === "admin" ? "/admin/projects" : "/user/projects";

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
        <DashboardLayout activeMenu={menuPath}>
            <div className="my-5">
                <div className="mb-5">
                    <h2 className="text-xl md:text-2xl font-medium text-gray-900">Проекты</h2>
                    <p className="text-[13px] text-gray-500 mt-1">
                        Обзор проектов, сроки и прогресс по задачам
                    </p>
                </div>

                {loading ? (
                    <p className="text-sm text-gray-500">Загрузка…</p>
                ) : projects.length === 0 ? (
                    <div className="flex w-full flex-col items-center rounded-xl border border-gray-200/80 bg-white px-8 py-14 text-center shadow-sm shadow-gray-100/60">
                        <div
                            className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400"
                            aria-hidden
                        >
                            <LuFolders className="h-7 w-7" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-[15px] font-medium text-gray-900">
                            Проектов пока нет
                        </h3>
                        <p className="text-[13px] text-gray-500 mt-2 leading-relaxed">
                            Здесь появятся карточки со сроками и прогрессом по задачам.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {projects.map((p) => (
                            <ProjectCard key={p._id} project={p} />
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};
