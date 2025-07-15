import { useEffect, useState, useContext } from "react";
import { useUserAuth } from "../../hooks/use-user-auth.jsx";
import { UserContext } from "../../context/user-context.jsx";
import { DashboardLayout } from "../../components/layouts/dashboard-layout.jsx";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axios-instance.js";
import { API_PATHS } from "../../utils/api-paths.js";
import { addThousandsSeparator } from "../../utils/helper";
import { InfoCard } from "../../components/Cards/info-card.jsx";
import { LuArrowRight } from "react-icons/lu";
import { TaskListTable } from "../../components/task-list-table.jsx";
import { CustomPieChart } from "../../components/Charts/custom-pie-chart.jsx";
import { CustomBarChart } from "../../components/Charts/custom-bar-chart.jsx";

const COLORS = ["#8D51FF", "#00B8DB", "#7BCE00"];

export const UserDashboard = () => {
    useUserAuth();

    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    const [dashboardData, setDashboardData] = useState(null);
    const [pieChartData, setPieChartData] = useState([]);
    const [barChartData, setBarChartData] = useState([]);

    const prepareChartData = (data) => {
        const taskDistribution = data?.taskDistribution || {};
        const taskPriorityLevels = data?.taskPriorityLevels || {};

        const taskDistributionData = [
            { status: "Ожидает", count: taskDistribution?.Pending || 0 },
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
            const response = await axiosInstance.get(
                API_PATHS.TASKS.GET_USER_DASHBOARD_DATA
            );
            if (response.data) {
                setDashboardData(response.data);
                prepareChartData(response.data?.charts || {});
            }
        } catch (error) {
            console.error("Ошибка при получении данных:", error);
        }
    };

    const onSeeMore = () => {
        navigate("/admin/tasks");
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("ru-RU", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    useEffect(() => {
        getDashboardData();
    }, []);

    return (
        <DashboardLayout activeMenu="Dashboard">
            <div className="card my-5">
                <div>
                    <div className="col-span-3">
                        <h2 className="text-xl md:text-2xl">
                            Доброе утро, {user?.name}!
                        </h2>
                        <p className="text-xs md:text-[13px] text-gray-400 mt-1.5">
                            {formatDate(new Date())}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mt-5">
                    <InfoCard
                        label="Все задачи"
                        value={addThousandsSeparator(
                            dashboardData?.charts?.taskDistribution?.All || 0
                        )}
                        color="bg-primary"
                    />

                    <InfoCard
                        label="Ожидает"
                        value={addThousandsSeparator(
                            dashboardData?.charts?.taskDistribution?.Pending || 0
                        )}
                        color="bg-violet-500"
                    />

                    <InfoCard
                        label="В работе"
                        value={addThousandsSeparator(
                            dashboardData?.charts?.taskDistribution?.InProgress || 0
                        )}
                        color="bg-cyan-500"
                    />

                    <InfoCard
                        label="Завершено"
                        value={addThousandsSeparator(
                            dashboardData?.charts?.taskDistribution?.Completed || 0
                        )}
                        color="bg-lime-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4 md:my-6">
                <div>
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <h5 className="font-medium">Распределение задач</h5>
                        </div>
                        <CustomPieChart data={pieChartData} colors={COLORS} />
                    </div>
                </div>

                <div>
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <h5 className="font-medium">Уровень приоритета</h5>
                        </div>
                        <CustomBarChart data={barChartData} />
                    </div>
                </div>

                <div className="md:col-span-2">
                    <div className="card">
                        <div className="flex items-center justify-between ">
                            <h5 className="text-lg">Последние задачи</h5>
                            <button className="card-btn" onClick={onSeeMore}>
                                Посмотреть все <LuArrowRight className="text-base" />
                            </button>
                        </div>
                        <TaskListTable tableData={dashboardData?.recentTasks || []} />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};
