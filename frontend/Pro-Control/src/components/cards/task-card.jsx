import React from "react";
import { Progress } from "../progress";
import { AvatarGroup } from "../avatar-group.jsx";
import { LuPaperclip } from "react-icons/lu";

const badgeBase =
    "inline-flex items-center rounded-md px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset";

export const TaskCard = ({
    title,
    description,
    projectTitle,
    priority,
    status,
    progress,
    createdAt,
    dueDate,
    assignedTo,
    attachmentCount,
    completedTodoCount,
    todoChecklist,
    onClick,
}) => {
    const getStatusTagColor = () => {
        switch (status) {
            case "In Progress":
                return `${badgeBase} bg-sky-50/95 text-sky-900 ring-sky-600/12`;
            case "Completed":
                return `${badgeBase} bg-emerald-50/95 text-emerald-900 ring-emerald-600/12`;
            case "Pending":
            default:
                return `${badgeBase} bg-violet-50/95 text-violet-900 ring-violet-600/12`;
        }
    };

    const getPriorityTagColor = () => {
        switch (priority) {
            case "Low":
                return `${badgeBase} bg-teal-50/95 text-teal-900 ring-teal-600/12`;
            case "Medium":
                return `${badgeBase} bg-amber-50/95 text-amber-900 ring-amber-600/14`;
            case "High":
            default:
                return `${badgeBase} bg-rose-50/95 text-rose-900 ring-rose-600/14`;
        }
    };

    const getPriorityText = () => {
        switch (priority) {
            case "Low":
                return "Низкий приоритет";
            case "Medium":
                return "Средний приоритет";
            case "High":
            default:
                return "Высокий приоритет";
        }
    };

    const getStatusText = () => {
        switch (status) {
            case "In Progress":
                return "В работе";
            case "Completed":
                return "Завершено";
            case "Pending":
            default:
                return "Ожидает";
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const isOverdue =
        status !== "Completed" && dueDate && new Date(dueDate).getTime() < Date.now();

    const leftBorderClass = isOverdue
        ? "border-rose-500"
        : status === "In Progress"
          ? "border-sky-500"
          : status === "Completed"
            ? "border-emerald-500"
            : "border-violet-500";

    return (
        <div
            className={`cursor-pointer rounded-xl border bg-app-surface py-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-[box-shadow,border-color] hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] ${
                isOverdue
                    ? "border-rose-200/70 ring-1 ring-rose-100/50"
                    : "border-app-border"
            }`}
            onClick={onClick}
        >
            <div className="flex flex-wrap items-end gap-2 px-4">
                <span className={getStatusTagColor()}>{getStatusText()}</span>
                <span className={getPriorityTagColor()}>{getPriorityText()}</span>
                {isOverdue ? (
                    <span
                        className={`${badgeBase} bg-rose-50/95 text-rose-900 ring-rose-600/18`}
                    >
                        Просрочено
                    </span>
                ) : null}
            </div>

            <div className={`border-l-[3px] px-4 ${leftBorderClass}`}>
                <p className="mt-4 line-clamp-2 text-sm font-medium text-app-heading">{title}</p>

                {projectTitle ? (
                    <p className="mt-1 text-[11px] font-medium text-app-muted">
                        Проект: {projectTitle}
                    </p>
                ) : null}

                <p className="mt-1.5 line-clamp-2 text-xs leading-[18px] text-app-muted">
                    {description}
                </p>

                <p className="mb-2 mt-2 text-[13px] font-medium leading-[18px] text-app-heading/85">
                    Выполнено задач:{" "}
                    <span className="font-semibold text-app-heading">
                        {completedTodoCount} / {todoChecklist.length || 0}
                    </span>
                </p>

                <Progress progress={progress} status={status} />
            </div>

            <div className="px-4">
                <div className="my-1 flex items-center justify-between">
                    <div>
                        <label className="text-xs text-app-muted">Дата начала</label>
                        <p className="text-[13px] font-medium text-app-heading">
                            {formatDate(createdAt)}
                        </p>
                    </div>

                    <div>
                        <label className="text-xs text-app-muted">Дата сдачи</label>
                        <p
                            className={`text-[13px] font-medium ${
                                isOverdue ? "text-rose-600" : "text-app-heading"
                            }`}
                        >
                            {formatDate(dueDate)}
                        </p>
                    </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                    <AvatarGroup avatars={assignedTo || []} />

                    {attachmentCount > 0 && (
                        <div className="flex items-center gap-2 rounded-lg bg-sky-50/80 px-2.5 py-1.5 ring-1 ring-inset ring-sky-600/10">
                            <LuPaperclip className="text-sky-700" />
                            <span className="text-xs text-app-heading">{attachmentCount}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
