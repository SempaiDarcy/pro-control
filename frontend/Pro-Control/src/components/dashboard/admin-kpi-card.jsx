/**
 * KPI admin overview: светлая карточка (как overview reference), тонкая цветная полоска слева
 * в тон с task-card / статусами: primary (все), violet (ожидание), sky (в работе), emerald (завершено).
 */
const ACCENT_BAR = {
    total: "bg-primary/55",
    pending: "bg-violet-500/55",
    inProgress: "bg-sky-500/55",
    completed: "bg-emerald-500/55",
};

export function AdminKpiCard({
    label,
    value,
    actionBadge = null,
    footerPrimary,
    footerMuted = null,
    accent = "total",
    className = "",
}) {
    const hasAction = actionBadge != null && actionBadge !== "";
    const accentClass = ACCENT_BAR[accent] ?? ACCENT_BAR.total;

    return (
        <div
            data-slot="card"
            className={`@container/card flex overflow-hidden rounded-xl border border-zinc-200/90 bg-white text-zinc-950 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ${className}`}
        >
            <div
                className="flex w-5 shrink-0 flex-col items-center py-6"
                aria-hidden
            >
                <span
                    className={`mt-0.5 h-[3.25rem] w-[2.5px] shrink-0 rounded-full ${accentClass}`}
                />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-4 py-6 pr-6">
                <div
                    className={`grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 ${
                        hasAction ? "grid-cols-[1fr_auto]" : ""
                    }`}
                >
                <div data-slot="card-description" className="text-sm text-zinc-500">
                    {label}
                </div>
                <div
                    data-slot="card-title"
                    className="col-start-1 text-2xl font-semibold tabular-nums leading-none @[280px]/card:text-3xl"
                >
                    {value}
                </div>
                {hasAction ? (
                    <div
                        data-slot="card-action"
                        className="col-start-2 row-span-2 row-start-1 self-start justify-self-end"
                    >
                        <span className="inline-flex items-center rounded-md border border-zinc-200 bg-white px-2 py-0.5 text-xs font-medium text-zinc-700 shadow-sm">
                            {actionBadge}
                        </span>
                    </div>
                ) : null}
                </div>
                {(footerPrimary || footerMuted) && (
                    <div
                        data-slot="card-footer"
                        className="flex flex-col items-start gap-1.5 text-sm text-zinc-900"
                    >
                        {footerPrimary ? (
                            <div className="line-clamp-2 font-medium leading-snug">{footerPrimary}</div>
                        ) : null}
                        {footerMuted ? (
                            <div className="text-sm text-zinc-500">{footerMuted}</div>
                        ) : null}
                    </div>
                )}
            </div>
        </div>
    );
}
