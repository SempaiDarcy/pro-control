import React, { useMemo } from "react";
import { LuGripVertical } from "react-icons/lu";
import { AvatarGroup } from "./avatar-group.jsx";

const COLUMNS = [
    { status: "Pending", title: "Ожидает" },
    { status: "In Progress", title: "В работе" },
    { status: "Completed", title: "Завершено" },
];

const priorityClass = (priority) => {
    switch (priority) {
        case "Low":
            return "text-emerald-600 bg-emerald-50 border-emerald-200/80";
        case "Medium":
            return "text-amber-600 bg-amber-50 border-amber-200/80";
        case "High":
        default:
            return "text-rose-600 bg-rose-50 border-rose-200/80";
    }
};

const priorityLabel = (priority) => {
    switch (priority) {
        case "Low":
            return "Низкий";
        case "Medium":
            return "Средний";
        case "High":
            return "Высокий";
        default:
            return priority;
    }
};

const formatDue = (dueDate) => {
    if (!dueDate) return "—";
    return new Date(dueDate).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

const KanbanCard = ({ task, onOpen, onDragStart }) => {
    const isOverdue =
        task.status !== "Completed" &&
        task.dueDate &&
        new Date(task.dueDate).getTime() < Date.now();

    return (
        <div className="flex gap-2 mb-2 bg-white rounded-lg border border-gray-200/70 shadow-sm shadow-gray-100/80 p-2.5 hover:border-gray-300/80 transition-colors">
            <div
                className="shrink-0 pt-0.5 text-gray-400 cursor-grab active:cursor-grabbing touch-none"
                draggable
                onDragStart={(e) => onDragStart(e, task)}
                title="Перетащить"
            >
                <LuGripVertical className="w-4 h-4" />
            </div>
            <button
                type="button"
                className="flex-1 text-left min-w-0"
                onClick={() => onOpen(task)}
            >
                <p className="text-[13px] font-medium text-gray-800 line-clamp-2 leading-snug">
                    {task.title}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                    <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded border ${priorityClass(
                            task.priority
                        )}`}
                    >
                        {priorityLabel(task.priority)}
                    </span>
                    {isOverdue ? (
                        <span className="text-[10px] font-medium text-rose-600 bg-rose-50 border border-rose-200/80 px-2 py-0.5 rounded">
                            Просрочено
                        </span>
                    ) : null}
                </div>
                <p
                    className={`text-[11px] mt-1.5 ${
                        isOverdue ? "text-rose-600 font-medium" : "text-gray-500"
                    }`}
                >
                    Срок: {formatDue(task.dueDate)}
                </p>
                {task.project?.title ? (
                    <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                        Проект: {task.project.title}
                    </p>
                ) : null}
                {task.assignedTo?.length > 0 ? (
                    <div className="mt-2 scale-90 origin-left">
                        <AvatarGroup
                            avatars={task.assignedTo.map((u) => u.profileImageUrl)}
                            names={task.assignedTo.map((u) => u.name)}
                            maxVisible={4}
                        />
                    </div>
                ) : null}
            </button>
        </div>
    );
};

export const TasksKanbanBoard = ({ tasks, onTaskOpen, onTaskStatusChange }) => {
    const grouped = useMemo(() => {
        const g = { Pending: [], "In Progress": [], Completed: [] };
        (tasks || []).forEach((t) => {
            if (g[t.status]) g[t.status].push(t);
            else g.Pending.push(t);
        });
        return g;
    }, [tasks]);

    const handleDragStart = (e, task) => {
        e.dataTransfer.setData("text/taskId", task._id);
        e.dataTransfer.setData("text/fromStatus", task.status);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = async (e, newStatus) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData("text/taskId");
        const fromStatus = e.dataTransfer.getData("text/fromStatus");
        if (!taskId || fromStatus === newStatus) return;
        await onTaskStatusChange(taskId, newStatus);
    };

    return (
        <div className="flex gap-3 mt-4 overflow-x-auto pb-2 items-start">
            {COLUMNS.map((col) => (
                <div
                    key={col.status}
                    className="flex-1 min-w-[260px] max-w-md rounded-xl border border-gray-100 bg-gray-50/60 p-2"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, col.status)}
                >
                    <div className="px-2 py-2 mb-2 border-b border-gray-100/80">
                        <h3 className="text-[13px] font-medium text-gray-800">{col.title}</h3>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                            {grouped[col.status]?.length || 0} задач
                        </p>
                    </div>
                    <div className="min-h-[120px]">
                        {grouped[col.status]?.length > 0 ? (
                            grouped[col.status].map((task) => (
                                <KanbanCard
                                    key={task._id}
                                    task={task}
                                    onOpen={onTaskOpen}
                                    onDragStart={handleDragStart}
                                />
                            ))
                        ) : (
                            <div className="flex min-h-[100px] flex-col items-center justify-center rounded-lg border border-dashed border-gray-200/90 bg-white/50 px-3 py-5 text-center">
                                <p className="text-[13px] text-gray-600">Пока пусто</p>
                                <p className="mt-1 text-[11px] text-gray-500">
                                    Перетащите задачу сюда
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};
