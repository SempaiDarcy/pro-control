import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

/**
 * Тренд по дате создания (массив задач с createdAt + status).
 * Админ-дашборд передаёт taskTrendSource со всеми задачами; fallback — recentTasks.
 * Серии: создано в месяце; завершено — задачи, созданные в этом месяце, со статусом Completed.
 */
export function buildMonthlyTrendFromRecentTasks(tasks = [], monthsBack = 6) {
    const buckets = [];
    const anchor = new Date();
    anchor.setDate(1);
    anchor.setHours(0, 0, 0, 0);
    for (let i = monthsBack - 1; i >= 0; i--) {
        const d = new Date(anchor.getFullYear(), anchor.getMonth() - i, 1);
        buckets.push({
            key: `${d.getFullYear()}-${d.getMonth()}`,
            month: d.toLocaleDateString("ru-RU", { month: "short", year: "2-digit" }),
            created: 0,
            completed: 0,
        });
    }

    (tasks || []).forEach((t) => {
        if (!t?.createdAt) return;
        const c = new Date(t.createdAt);
        const k = `${c.getFullYear()}-${c.getMonth()}`;
        const b = buckets.find((x) => x.key === k);
        if (!b) return;
        b.created += 1;
        if (t.status === "Completed") b.completed += 1;
    });

    return buckets.map(({ month, created, completed }) => ({
        month,
        created,
        completed,
    }));
}

const TrendTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs shadow-md">
            <p className="font-medium text-zinc-900">{label}</p>
            {payload.map((p) => (
                <p key={p.dataKey} className="mt-1 text-zinc-600">
                    {p.name}:{" "}
                    <span className="font-semibold tabular-nums text-zinc-900">{p.value}</span>
                </p>
            ))}
        </div>
    );
};

export function DashboardTaskTrendChart({ data }) {
    const safe = Array.isArray(data) && data.length > 0 ? data : [{ month: "—", created: 0, completed: 0 }];

    return (
        <div className="mt-2 w-full">
            <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={safe} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                    <defs>
                        <linearGradient id="dashTrendCreated" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.22} />
                            <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="dashTrendDone" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 6" vertical={false} stroke="#e4e4e7" />
                    <XAxis
                        dataKey="month"
                        tick={{ fontSize: 11, fill: "#71717a" }}
                        axisLine={false}
                        tickLine={false}
                        dy={6}
                    />
                    <YAxis
                        tick={{ fontSize: 11, fill: "#71717a" }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                        width={36}
                    />
                    <Tooltip content={<TrendTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="created"
                        name="Создано"
                        stroke="#0284c7"
                        strokeWidth={2}
                        fill="url(#dashTrendCreated)"
                        dot={false}
                        activeDot={{ r: 4, strokeWidth: 0, fill: "#0284c7" }}
                    />
                    <Area
                        type="monotone"
                        dataKey="completed"
                        name="Завершено"
                        stroke="#059669"
                        strokeWidth={2}
                        fill="url(#dashTrendDone)"
                        dot={false}
                        activeDot={{ r: 4, strokeWidth: 0, fill: "#059669" }}
                    />
                </AreaChart>
            </ResponsiveContainer>
            <p className="mt-2 text-center text-[11px] text-zinc-400">
                По дате создания; завершено — среди задач, созданных в этом месяце
            </p>
        </div>
    );
}
