import React from "react";

export const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs shadow-md">
                <p className="font-medium text-zinc-900">{payload[0].name}</p>
                <p className="mt-1 text-zinc-600">
                    Задач:{" "}
                    <span className="font-semibold tabular-nums text-zinc-900">{payload[0].value}</span>
                </p>
            </div>
        );
    }
    return null;
};
