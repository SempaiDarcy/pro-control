import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";

const barToneSoft = (entry) => {
    switch (entry?.priority) {
        case "Низкий":
            return "#64748b";
        case "Средний":
            return "#d97706";
        case "Высокий":
            return "#e11d48";
        default:
            return "#64748b";
    }
};

const barToneClassic = (entry) => {
    switch (entry?.priority) {
        case "Низкий":
            return "#00BC7D";
        case "Средний":
            return "#FE9900";
        case "Высокий":
            return "#FF1F57";
        default:
            return "#00BC7D";
    }
};

const BarTooltipSoft = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs shadow-md">
                <p className="font-medium text-zinc-900">{payload[0].payload.priority}</p>
                <p className="mt-1 text-zinc-600">
                    Задач:{" "}
                    <span className="font-semibold tabular-nums text-zinc-900">
                        {payload[0].payload.count}
                    </span>
                </p>
            </div>
        );
    }
    return null;
};

const BarTooltipClassic = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white shadow-md rounded-lg p-2 border border-gray-300">
                <p className="text-xs font-semibold text-purple-800 mb-1">
                    {payload[0].payload.priority}
                </p>
                <p className="text-sm text-gray-600">
                    Задач:{" "}
                    <span className="text-sm font-medium text-gray-900">
                        {payload[0].payload.count}
                    </span>
                </p>
            </div>
        );
    }
    return null;
};

export const CustomBarChart = ({ data, variant = "classic" }) => {
    const soft = variant === "soft";
    const barTone = soft ? barToneSoft : barToneClassic;
    const TooltipCmp = soft ? BarTooltipSoft : BarTooltipClassic;

    return (
        <div className={`w-full ${soft ? "mt-4" : "bg-white mt-6"}`}>
            <ResponsiveContainer width="100%" height={soft ? 280 : 300}>
                <BarChart
                    data={data}
                    barCategoryGap={soft ? "28%" : undefined}
                    margin={soft ? { top: 8, right: 8, left: -12, bottom: 0 } : undefined}
                >
                    <CartesianGrid
                        strokeDasharray={soft ? "3 6" : undefined}
                        stroke={soft ? "#e4e4e7" : "none"}
                        vertical={false}
                    />
                    <XAxis
                        dataKey="priority"
                        tick={{ fontSize: soft ? 11 : 12, fill: soft ? "#71717a" : "#555" }}
                        stroke="none"
                        tickLine={false}
                        dy={soft ? 8 : 0}
                    />
                    <YAxis
                        tick={{ fontSize: soft ? 11 : 12, fill: soft ? "#71717a" : "#555" }}
                        stroke="none"
                        tickLine={false}
                        allowDecimals={false}
                        width={soft ? 36 : undefined}
                    />
                    <Tooltip
                        content={<TooltipCmp />}
                        cursor={soft ? { fill: "rgba(24,24,27,0.04)" } : { fill: "transparent" }}
                    />
                    <Bar
                        dataKey="count"
                        nameKey="priority"
                        fill="#FF8042"
                        radius={soft ? [6, 6, 0, 0] : [10, 10, 0, 0]}
                        maxBarSize={soft ? 48 : undefined}
                    >
                        {data.map((entry, index) => (
                            <Cell key={index} fill={barTone(entry)} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
