import React from "react";

export const TaskListTable = ({ tableData, tone = "default" }) => {
    const isDash = tone === "adminOverview";

    const getStatusBadgeColor = (status) => {
        if (isDash) {
            switch (status) {
                case "Completed":
                    return "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600/12";
                case "Pending":
                    return "bg-violet-50 text-violet-800 ring-1 ring-violet-600/12";
                case "In Progress":
                    return "bg-sky-50 text-sky-800 ring-1 ring-sky-600/12";
                default:
                    return "bg-zinc-100 text-zinc-700 ring-1 ring-zinc-300/40";
            }
        }
        switch (status) {
            case "Completed":
                return "bg-green-100 text-green-500 border border-green-200";
            case "Pending":
                return "bg-purple-100 text-purple-500 border border-purple-200";
            case "In Progress":
                return "bg-cyan-100 text-cyan-500 border border-cyan-200";
            default:
                return "bg-gray-100 text-gray-500 border border-gray-200";
        }
    };

    const getPriorityBadgeColor = (priority) => {
        if (isDash) {
            switch (priority) {
                case "High":
                    return "bg-rose-50 text-rose-800 ring-1 ring-rose-600/14";
                case "Medium":
                    return "bg-amber-50 text-amber-900 ring-1 ring-amber-600/14";
                case "Low":
                    return "bg-slate-100 text-slate-700 ring-1 ring-slate-400/25";
                default:
                    return "bg-zinc-100 text-zinc-700 ring-1 ring-zinc-300/40";
            }
        }
        switch (priority) {
            case "High":
                return "bg-red-100 text-red-500 border border-red-200";
            case "Medium":
                return "bg-orange-100 text-orange-500 border border-orange-200";
            case "Low":
                return "bg-green-100 text-green-500 border border-green-200";
            default:
                return "bg-gray-100 text-gray-500 border border-gray-200";
        }
    };

    const translateStatus = (status) => {
        switch (status) {
            case "Completed":
                return "Завершено";
            case "Pending":
                return "В ожидании";
            case "In Progress":
                return "В работе";
            default:
                return "Неизвестно";
        }
    };

    const translatePriority = (priority) => {
        switch (priority) {
            case "High":
                return "Высокий";
            case "Medium":
                return "Средний";
            case "Low":
                return "Низкий";
            default:
                return "Неизвестный";
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "—";

        const date = new Date(dateString);
        return date.toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const thClass = isDash
        ? "py-3 px-4 text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-500"
        : "py-3 px-4 text-left text-gray-800 font-medium text-[13px]";
    const rowClass = isDash
        ? "border-t border-zinc-100 transition-colors hover:bg-zinc-50/80"
        : "border-t border-gray-200";
    const tdTitle = isDash
        ? "py-3.5 px-4 text-[13px] font-medium text-zinc-900 line-clamp-1"
        : "my-3 mx-4 text-gray-700 text-[13px] line-clamp-1 overflow-hidden";
    const tdMuted = isDash
        ? "py-3.5 px-4 text-[13px] text-zinc-600 line-clamp-1 max-w-[160px]"
        : "py-4 px-4 text-gray-600 text-[13px] line-clamp-1 max-w-[140px]";
    const badgeWrap = isDash ? "rounded-md px-2 py-0.5 text-[11px] font-semibold" : "px-2 py-1 text-xs rounded inline-block";
    const tdDate = isDash ? "py-3.5 px-4 text-[13px] tabular-nums text-zinc-600" : "py-4 px-4 text-gray-700 text-[13px] text-nowrap";

    return (
        <div
            className={
                isDash
                    ? "mt-4 overflow-x-auto rounded-lg border border-zinc-200/90"
                    : "mt-3 overflow-x-auto rounded-lg p-0"
            }
        >
            <table className="min-w-full">
                <thead className={isDash ? "border-b border-zinc-200 bg-zinc-50/70" : ""}>
                    <tr className="text-left">
                        <th className={`${thClass}${isDash ? " rounded-tl-lg" : ""}`}>Название</th>
                        <th className={`${thClass} hidden sm:table-cell`}>Проект</th>
                        <th className={thClass}>Статус</th>
                        <th className={thClass}>Приоритет</th>
                        <th
                            className={`${thClass} hidden md:table-cell${isDash ? " rounded-tr-lg" : ""}`}
                        >
                            Создано
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {tableData.map((task) => (
                        <tr key={task._id} className={rowClass}>
                            <td className={tdTitle}>{task.title}</td>
                            <td className={`${tdMuted} hidden sm:table-cell`}>
                                {task.project?.title || "—"}
                            </td>
                            <td className="py-3.5 px-4">
                                <span
                                    className={`${badgeWrap} inline-flex ${getStatusBadgeColor(task.status)}`}
                                >
                                    {translateStatus(task.status)}
                                </span>
                            </td>
                            <td className="py-3.5 px-4">
                                <span
                                    className={`${badgeWrap} inline-flex ${getPriorityBadgeColor(task.priority)}`}
                                >
                                    {translatePriority(task.priority)}
                                </span>
                            </td>
                            <td className={`${tdDate} hidden md:table-cell`}>
                                {formatDate(task.createdAt)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
