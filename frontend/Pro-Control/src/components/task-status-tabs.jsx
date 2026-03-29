export const TaskStatusTabs = ({
    tabs,
    activeTab,
    setActiveTab,
    wrapperClassName = "my-2",
}) => {
    return (
        <div className={wrapperClassName}>
            <div
                className="flex w-full flex-wrap gap-1 rounded-xl border border-app-border bg-app-border-muted p-1 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] sm:flex-nowrap"
                role="tablist"
            >
                {tabs.map((tab) => {
                    const active = activeTab === tab.label;
                    return (
                        <button
                            key={tab.label}
                            type="button"
                            role="tab"
                            aria-selected={active}
                            className={`flex min-w-0 flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all sm:flex-initial sm:px-4 ${
                                active
                                    ? "bg-app-surface text-app-heading shadow-sm ring-1 ring-black/[0.06]"
                                    : "text-app-muted hover:bg-app-surface/70 hover:text-app-heading"
                            } cursor-pointer`}
                            onClick={() => setActiveTab(tab.label)}
                        >
                            <span className="truncate">{tab.label}</span>
                            <span
                                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${
                                    active
                                        ? "bg-primary text-white"
                                        : "bg-app-border text-app-muted"
                                }`}
                            >
                                {tab.count}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
