const Task = require("../models/Task");
const User = require("../models/User");
const excelJS = require("exceljs");

// @desc    Export all tasks as an Excel file
// @route   GET /api/reports/export/tasks
// @access  Private (Admin)
const exportTasksReport = async (req, res) => {
    try {
        const tasks = await Task.find().populate("assignedTo", "name email");

        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet("Tasks Report");

        worksheet.columns = [
            {header: "ID задачи", key: "_id", width: 25},
            {header: "Название", key: "title", width: 30},
            {header: "Описание", key: "description", width: 50},
            {header: "Приоритет", key: "priority", width: 15},
            {header: "Статус", key: "status", width: 20},
            {header: "Срок", key: "dueDate", width: 20},
            {header: "Назначено", key: "assignedTo", width: 30},
        ];

        tasks.forEach((task) => {
            let assignedTo;

            if (Array.isArray(task.assignedTo)) {
                assignedTo = task.assignedTo
                    .map((user) => `${user.name} (${user.email})`)
                    .join(", ");
            } else if (task.assignedTo) {
                assignedTo = `${task.assignedTo.name} (${task.assignedTo.email})`;
            } else {
                assignedTo = "Не назначено";
            }

            worksheet.addRow({
                _id: task._id,
                title: task.title,
                description: task.description,
                priority:
                    task.priority === "High"
                        ? "Высокий"
                        : task.priority === "Medium"
                            ? "Средний"
                            : task.priority === "Low"
                                ? "Низкий"
                                : task.priority,
                status:
                    task.status === "Completed"
                        ? "Завершено"
                        : task.status === "Pending"
                            ? "Ожидает"
                            : task.status === "In Progress"
                                ? "В процессе"
                                : task.status,
                dueDate: task.dueDate?.toISOString().split("T")[0] || "",
                assignedTo,
            });
        });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            'attachment; filename="tasks_report.xlsx"'
        );

        return workbook.xlsx.write(res).then(() => {
            res.end();
        });
    } catch (error) {
        res.status(500).json({message: "Ошибка при экспорте задач", error: error.message});
    }
};

// @desc    Export user-task report as an Excel file
// @route   GET /api/reports/export/users
// @access  Private (Admin)
const exportUsersReport = async (req, res) => {
    try {
        const users = await User.find().select("name email _id").lean();
        const userTasks = await Task.find().populate(
            "assignedTo",
            "name email _id"
        );

        const userTaskMap = {};
        users.forEach((user) => {
            userTaskMap[user._id] = {
                name: user.name,
                email: user.email,
                taskCount: 0,
                pendingTasks: 0,
                inProgressTasks: 0,
                completedTasks: 0,
            };
        });

        userTasks.forEach((task) => {
            if (Array.isArray(task.assignedTo)) {
                task.assignedTo.forEach((assignedUser) => {
                    const u = userTaskMap[assignedUser._id];
                    if (u) {
                        u.taskCount += 1;
                        if (task.status === "Pending") u.pendingTasks += 1;
                        else if (task.status === "In Progress") u.inProgressTasks += 1;
                        else if (task.status === "Completed") u.completedTasks += 1;
                    }
                });
            } else if (task.assignedTo && userTaskMap[task.assignedTo._id]) {
                const u = userTaskMap[task.assignedTo._id];
                u.taskCount += 1;
                if (task.status === "Pending") u.pendingTasks += 1;
                else if (task.status === "In Progress") u.inProgressTasks += 1;
                else if (task.status === "Completed") u.completedTasks += 1;
            }
        });

        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet("Отчёт по пользователям");

        worksheet.columns = [
            {header: "Имя пользователя", key: "name", width: 30},
            {header: "Email", key: "email", width: 40},
            {header: "Всего задач", key: "taskCount", width: 20},
            {header: "Ожидают", key: "pendingTasks", width: 20},
            {header: "В процессе", key: "inProgressTasks", width: 20},
            {header: "Завершено", key: "completedTasks", width: 20},
        ];

        Object.values(userTaskMap).forEach((user) => {
            worksheet.addRow(user);
        });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            'attachment; filename="users_report.xlsx"'
        );

        return workbook.xlsx.write(res).then(() => {
            res.end();
        });
    } catch (error) {
        res.status(500).json({message: "Ошибка при экспорте пользователей", error: error.message});
    }
};

module.exports = {
    exportTasksReport,
    exportUsersReport,
};
