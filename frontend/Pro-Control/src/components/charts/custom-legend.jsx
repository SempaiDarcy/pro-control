import React from "react";

export const CustomLegend = ({ payload, variant = "default" }) => {
    if (!payload?.length) return null;
    const textMuted = variant === "dashboard" ? "text-zinc-600" : "text-gray-700";

    return (
        <div className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-2 px-2">
            {payload.map((entry, index) => (
                <div key={`legend-${index}`} className="flex items-center gap-2">
                    <span
                        className="h-2 w-2 shrink-0 rounded-full ring-1 ring-black/5"
                        style={{ backgroundColor: entry.color }}
                    />
                    <span className={`text-xs font-medium ${textMuted}`}>{entry.value}</span>
                    <span className="text-xs tabular-nums text-zinc-400">
                        {entry.payload?.count != null ? entry.payload.count : ""}
                    </span>
                </div>
            ))}
        </div>
    );
};
