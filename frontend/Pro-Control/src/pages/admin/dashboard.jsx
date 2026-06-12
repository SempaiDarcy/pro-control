import { useEffect, useState, useContext } from "react";
import { useUserAuth } from "../../hooks/use-user-auth.jsx";
import { UserContext } from "../../context/user-context.jsx";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axios-instance.js";
import { API_PATHS } from "../../utils/api-paths.js";

import moment from "moment/min/moment-with-locales";

import { addThousandsSeparator } from "../../utils/helper";
import { AdminKpiCard } from "../../components/dashboard/admin-kpi-card.jsx";
import { LuArrowRight } from "react-icons/lu";
import { TaskListTable } from "../../components/task-list-table.jsx";
import { CustomPieChart } from "../../components/charts/custom-pie-chart.jsx";
import { CustomBarChart } from "../../components/charts/custom-bar-chart.jsx";
import {
    DashboardTaskTrendChart,
    buildMonthlyTrendFromRecentTasks,
} from "../../components/charts/dashboard-task-trend-chart.jsx";

const PIE_COLORS = ["#7c3aed", "#0ea5e9", "#10b981"];

const dashCard =
    "rounded-xl border border-zinc-200/90 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]";

export const Dashboard = () => {
    useUserAuth();

    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    const [dashboardData, setDashboardData] = useState(null);
    const [pieChartData, setPieChartData] = useState([]);
    const [barChartData, setBarChartData] = useState([]);
    const [trendData, setTrendData] = useState([]);

    const prepareChartData = (data) => {
        const taskDistribution = data?.taskDistribution || null;
        const taskPriorityLevels = data?.taskPriorityLevels || null;

        const taskDistributionData = [
            { status: "В ожидании", count: taskDistribution?.Pending || 0 },
            { status: "В работе", count: taskDistribution?.InProgress || 0 },
            { status: "Завершено", count: taskDistribution?.Completed || 0 },
        ];

        setPieChartData(taskDistributionData);

        const PriorityLevelData = [
            { priority: "Низкий", count: taskPriorityLevels?.Low || 0 },
            { priority: "Средний", count: taskPriorityLevels?.Medium || 0 },
            { priority: "Высокий", count: taskPriorityLevels?.High || 0 },
        ];

        setBarChartData(PriorityLevelData);
    };

    const getDashboardData = async () => {
        try {
            const response = await axiosInstance.get(API_PATHS.TASKS.GET_DASHBOARD_DATA);
            if (response.data) {
                setDashboardData(response.data);
                prepareChartData(response.data?.charts || null);
                setTrendData(
                    buildMonthlyTrendFromRecentTasks(
                        response.data?.taskTrendSource || response.data?.recentTasks || []
                    )
                );
            }
        } catch (error) {
            console.error("Ошибка при получении данных:", error);
        }
    };

    const onSeeMore = () => {
        navigate("/admin/tasks");
    };

    useEffect(() => {
        getDashboardData();
    }, []);

    const totalAll = dashboardData?.charts?.taskDistribution?.All ?? 0;
    const pending = dashboardData?.charts?.taskDistribution?.Pending ?? 0;
    const inProgress = dashboardData?.charts?.taskDistribution?.InProgress ?? 0;
    const completed = dashboardData?.charts?.taskDistribution?.Completed ?? 0;

    const pct = (n) => (totalAll > 0 ? Math.round((n / totalAll) * 100) : 0);

    return (
        <>
            <section className="mb-8">
                <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-[1.65rem]">
                    Здравствуйте, {user?.name}!
                </h2>
                <p className="mt-2 text-sm text-zinc-500">
                    {moment().locale("ru").format("dddd, D MMMM YYYY, HH:mm")}
                </p>
            </section>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <AdminKpiCard
                    accent="total"
                    label="Всего задач"
                    value={addThousandsSeparator(totalAll)}
                    footerPrimary="Активные записи в системе"
                />
                <AdminKpiCard
                    accent="pending"
                    label="В ожидании"
                    value={addThousandsSeparator(pending)}
                    actionBadge={`${pct(pending)}%`}
                    footerPrimary="От всех задач"
                />
                <AdminKpiCard
                    accent="inProgress"
                    label="В работе"
                    value={addThousandsSeparator(inProgress)}
                    actionBadge={`${pct(inProgress)}%`}
                    footerPrimary="От всех задач"
                />
                <AdminKpiCard
                    accent="completed"
                    label="Завершено"
                    value={addThousandsSeparator(completed)}
                    actionBadge={`${pct(completed)}%`}
                    footerPrimary="От всех задач"
                />
            </section>

            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className={dashCard}>
                    <div className="mb-2">
                        <h3 className="text-sm font-semibold tracking-tight text-zinc-900">
                            Распределение задач
                        </h3>
                        <p className="mt-0.5 text-xs text-zinc-500">По статусам исполнения</p>
                    </div>
                    <CustomPieChart
                        data={pieChartData}
                        colors={PIE_COLORS}
                        centerTotal={totalAll}
                        legendVariant="dashboard"
                    />
                </div>

                <div className={dashCard}>
                    <div className="mb-2">
                        <h3 className="text-sm font-semibold tracking-tight text-zinc-900">
                            Приоритеты задач
                        </h3>
                        <p className="mt-0.5 text-xs text-zinc-500">Низкий, средний и высокий</p>
                    </div>
                    <CustomBarChart data={barChartData} variant="soft" />
                </div>

                <div className={`${dashCard} lg:col-span-2`}>
                    <div className="mb-1">
                        <h3 className="text-sm font-semibold tracking-tight text-zinc-900">
                            Динамика задач
                        </h3>
                        <p className="mt-0.5 text-xs text-zinc-500">
                            Создано и завершено по месяцам (по всем задачам, окно — 6 месяцев)
                        </p>
                    </div>
                    <DashboardTaskTrendChart data={trendData} />
                </div>

                <div className={`${dashCard} lg:col-span-2`}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-sm font-semibold tracking-tight text-zinc-900">
                                Последние задачи
                            </h3>
                            <p className="mt-0.5 text-xs text-zinc-500">Недавно созданные записи</p>
                        </div>
                        <button
                            type="button"
                            className="card-btn inline-flex cursor-pointer shrink-0"
                            onClick={onSeeMore}
                        >
                            Смотреть все <LuArrowRight className="text-base" />
                        </button>
                    </div>

                    <TaskListTable
                        tableData={dashboardData?.recentTasks || []}
                        tone="adminOverview"
                    />
                </div>
            </div>
        </>
    );
};
