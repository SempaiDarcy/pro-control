import React, { useMemo } from "react";

const formatDateTime = (value) => {
    if (!value) return "—";
    const d = new Date(value);
    return d.toLocaleString("ru-RU", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

export const TaskActivitySection = ({ entries }) => {
    const sorted = useMemo(() => {
        if (!Array.isArray(entries) || entries.length === 0) return [];
        return [...entries].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
    }, [entries]);

    return (
        <div className="mt-6 border-t border-gray-100 pt-4">
            <label className="text-xs font-medium text-slate-500">Активность</label>
            {sorted.length === 0 ? (
                <p className="text-[13px] text-gray-500 mt-2">История пока пуста.</p>
            ) : (
                <ul className="mt-3 space-y-3">
                    {sorted.map((item) => (
                        <li
                            key={item._id}
                            className="pb-3 border-b border-gray-50 last:border-0 last:pb-0"
                        >
                            <p className="text-[13px] text-gray-800">{item.message}</p>
                            <p className="text-[11px] text-gray-500 mt-1">
                                {item.user?.name || "Пользователь"} ·{" "}
                                {formatDateTime(item.createdAt)}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
