const mongoose = require("mongoose");
const Task = require("../models/Task");
const Project = require("../models/Project");

const isUserAssignedToTask = (task, userId) =>
    task.assignedTo.some((u) => {
        const id = u?._id != null ? u._id.toString() : u.toString();
        return id === userId.toString();
    });

const statusLabelRu = (status) => {
    const map = {
        Pending: "Ожидает",
        "In Progress": "В работе",
        Completed: "Завершено",
    };
    return map[status] || status;
};

const populateTaskDetail = (query) =>
    query
        .populate("assignedTo", "name email profileImageUrl")
        .populate("project", "title status")
        .populate({ path: "activity.user", select: "name email profileImageUrl" });

const TASK_STATUSES = ["Pending", "In Progress", "Completed"];

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const taskFilterParts = (req, { includeStatusFromQuery }) => {
    const parts = [];
    const { q, priority, project, assignedTo, overdue, status } = req.query;

    if (req.user.role !== "admin") {
        parts.push({ assignedTo: req.user._id });
    }

    if (req.user.role === "admin" && assignedTo && mongoose.Types.ObjectId.isValid(assignedTo)) {
        parts.push({ assignedTo: new mongoose.Types.ObjectId(assignedTo) });
    }

    const qTrim = q != null ? String(q).trim() : "";
    if (qTrim) {
        const safe = escapeRegex(qTrim);
        parts.push({
            $or: [
                { title: new RegExp(safe, "i") },
                { description: new RegExp(safe, "i") },
            ],
        });
    }

    if (priority && ["Low", "Medium", "High"].includes(priority)) {
        parts.push({ priority });
    }

    if (project && mongoose.Types.ObjectId.isValid(project)) {
        parts.push({ project: new mongoose.Types.ObjectId(project) });
    }

    if (overdue === "true" || overdue === true) {
        parts.push({ status: { $ne: "Completed" } });
        parts.push({ dueDate: { $lt: new Date() } });
    }

    if (includeStatusFromQuery && status && TASK_STATUSES.includes(status)) {
        parts.push({ status });
    }

    return parts;
};

const partsToMongoFilter = (parts) => {
    if (parts.length === 0) return {};
    if (parts.length === 1) return parts[0];
    return { $and: parts };
};

// @desc    Get all tasks (Admin: all, User: only assigned tasks)
// @route   GET /api/tasks/
// @access  Private
const getTasks = async (req, res) => {
    try {
        const summaryBaseParts = taskFilterParts(req, { includeStatusFromQuery: false });
        const listParts = taskFilterParts(req, { includeStatusFromQuery: true });

        const listFilter = partsToMongoFilter(listParts);
        const sort = {};
        if (req.query.sortBy === "dueDate") {
            sort.dueDate = req.query.order === "asc" ? 1 : -1;
        }

        let query = Task.find(listFilter)
            .populate("assignedTo", "name email profileImageUrl")
            .populate("project", "title status");

        if (Object.keys(sort).length > 0) {
            query = query.sort(sort);
        }

        let tasks = await query;

        tasks = await Promise.all(
            tasks.map(async (task) => {
                const completedCount = task.todoChecklist.filter(
                    (item) => item.completed
                ).length;
                return { ...task.toObject(), completedTodoCount: completedCount };
            })
        );

        const allTasks = await Task.countDocuments(partsToMongoFilter(summaryBaseParts));

        const pendingTasks = await Task.countDocuments(
            partsToMongoFilter([...summaryBaseParts, { status: "Pending" }])
        );

        const inProgressTasks = await Task.countDocuments(
            partsToMongoFilter([...summaryBaseParts, { status: "In Progress" }])
        );

        const completedTasks = await Task.countDocuments(
            partsToMongoFilter([...summaryBaseParts, { status: "Completed" }])
        );

        res.json({
            tasks,
            statusSummary: {
                all: allTasks,
                pendingTasks,
                inProgressTasks,
                completedTasks,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
    try {
        const task = await populateTaskDetail(Task.findById(req.params.id));

        if (!task) return res.status(404).json({ message: "Task not found" });

        const isAssigned = isUserAssignedToTask(task, req.user._id);
        if (req.user.role !== "admin" && !isAssigned) {
            return res.status(403).json({ message: "Not authorized" });
        }

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Create a new task (Admin only)
// @route   POST /api/tasks/
// @access  Private (Admin)
const createTask = async (req, res) => {
    try {
        const {
            title,
            description,
            priority,
            dueDate,
            assignedTo,
            attachments,
            todoChecklist,
            project,
        } = req.body;

        if (!Array.isArray(assignedTo)) {
            return res
                .status(400)
                .json({ message: "assignedTo must be an array of user IDs" });
        }

        if (project) {
            const projectExists = await Project.findById(project);
            if (!projectExists) {
                return res.status(400).json({ message: "Invalid project" });
            }
        }

        const task = await Task.create({
            title,
            description,
            priority,
            dueDate,
            assignedTo,
            createdBy: req.user._id,
            todoChecklist,
            attachments,
            ...(project ? { project } : {}),
            activity: [
                {
                    action: "created",
                    user: req.user._id,
                    message: "Задача создана",
                },
            ],
        });

        const populated = await populateTaskDetail(Task.findById(task._id));

        res.status(201).json({ message: "Task created successfully", task: populated });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Update task details
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) return res.status(404).json({ message: "Task not found" });

        const prev = {
            title: task.title,
            description: task.description,
            priority: task.priority,
            dueDate: task.dueDate ? new Date(task.dueDate).getTime() : null,
            assignedToIds: [...task.assignedTo].map((id) => id.toString()).sort(),
            projectId: task.project ? task.project.toString() : "",
            todoStr: JSON.stringify(task.todoChecklist || []),
            attStr: JSON.stringify(task.attachments || []),
        };

        task.title = req.body.title || task.title;
        task.description = req.body.description || task.description;
        task.priority = req.body.priority || task.priority;
        task.dueDate = req.body.dueDate || task.dueDate;
        task.todoChecklist = req.body.todoChecklist || task.todoChecklist;
        task.attachments = req.body.attachments || task.attachments;

        if (req.body.assignedTo) {
            if (!Array.isArray(req.body.assignedTo)) {
                return res
                    .status(400)
                    .json({ message: "assignedTo must be an array of user IDs" });
            }
            task.assignedTo = req.body.assignedTo;
        }

        if (Object.prototype.hasOwnProperty.call(req.body, "project")) {
            const p = req.body.project;
            if (p === null || p === "") {
                task.project = null;
            } else {
                const projectExists = await Project.findById(p);
                if (!projectExists) {
                    return res.status(400).json({ message: "Invalid project" });
                }
                task.project = p;
            }
        }

        const nextAssigneeIds = [...task.assignedTo].map((id) => id.toString()).sort();
        const assigneesChanged =
            req.body.assignedTo &&
            JSON.stringify(prev.assignedToIds) !== JSON.stringify(nextAssigneeIds);

        const nextProjectId = task.project ? task.project.toString() : "";
        const projectChanged =
            Object.prototype.hasOwnProperty.call(req.body, "project") &&
            prev.projectId !== nextProjectId;

        const nextDue = task.dueDate ? new Date(task.dueDate).getTime() : null;
        const coreChanged =
            task.title !== prev.title ||
            task.description !== prev.description ||
            task.priority !== prev.priority ||
            nextDue !== prev.dueDate ||
            JSON.stringify(task.todoChecklist || []) !== prev.todoStr ||
            JSON.stringify(task.attachments || []) !== prev.attStr;

        if (!task.activity) task.activity = [];

        if (assigneesChanged) {
            task.activity.push({
                action: "assignees_changed",
                user: req.user._id,
                message: "Изменены исполнители",
            });
        }
        if (projectChanged) {
            task.activity.push({
                action: "project_changed",
                user: req.user._id,
                message: "Изменён проект",
            });
        }
        if (coreChanged) {
            task.activity.push({
                action: "updated",
                user: req.user._id,
                message: "Обновлены данные задачи",
            });
        }

        await task.save();
        const updatedTask = await populateTaskDetail(Task.findById(task._id));

        res.json({ message: "Task updated successfully", updatedTask });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Delete a task (Admin only)
// @route   DELETE /api/tasks/:id
// @access  Private (Admin)
const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) return res.status(404).json({ message: "Task not found" });

        await task.deleteOne();
        res.json({ message: "Task deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Update task status
// @route   PUT /api/tasks/:id/status
// @access  Private
const updateTaskStatus = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found" });

        const isAssigned = isUserAssignedToTask(task, req.user._id);

        if (!isAssigned && req.user.role !== "admin") {
            return res.status(403).json({ message: "Not authorized" });
        }

        const oldStatus = task.status;
        if (
            req.body.status !== undefined &&
            req.body.status !== null &&
            req.body.status !== ""
        ) {
            if (!TASK_STATUSES.includes(req.body.status)) {
                return res.status(400).json({ message: "Invalid status" });
            }
            task.status = req.body.status;
        }

        if (task.status === "Completed") {
            task.todoChecklist.forEach((item) => (item.completed = true));
            task.progress = 100;
        }

        if (!task.activity) task.activity = [];

        if (oldStatus !== task.status) {
            task.activity.push({
                action: "status_changed",
                user: req.user._id,
                message: `Статус: ${statusLabelRu(oldStatus)} → ${statusLabelRu(task.status)}`,
            });
        }

        await task.save();
        const updated = await populateTaskDetail(Task.findById(task._id));
        res.json({ message: "Task status updated", task: updated });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Update task checklist
// @route   PUT /api/tasks/:id/todo
// @access  Private
const updateTaskChecklist = async (req, res) => {
    try {
        const { todoChecklist } = req.body;
        const task = await Task.findById(req.params.id);

        if (!task) return res.status(404).json({ message: "Task not found" });

        if (!isUserAssignedToTask(task, req.user._id) && req.user.role !== "admin") {
            return res
                .status(403)
                .json({ message: "Not authorized to update checklist" });
        }

        const prevTodoStr = JSON.stringify(task.todoChecklist || []);
        task.todoChecklist = todoChecklist; // Replace with updated checklist

        // Auto-update progress based on checklist completion
        const completedCount = task.todoChecklist.filter(
            (item) => item.completed
        ).length;
        const totalItems = task.todoChecklist.length;
        task.progress =
            totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

        // Auto-mark task as completed if all items are checked
        if (task.progress === 100) {
            task.status = "Completed";
        } else if (task.progress > 0) {
            task.status = "In Progress";
        } else {
            task.status = "Pending";
        }

        if (!task.activity) task.activity = [];

        if (prevTodoStr !== JSON.stringify(task.todoChecklist || [])) {
            task.activity.push({
                action: "checklist_updated",
                user: req.user._id,
                message: "Обновлён чеклист",
            });
        }

        await task.save();
        const updatedTask = await populateTaskDetail(Task.findById(req.params.id));

        res.json({ message: "Task checklist updated", task: updatedTask });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Dashboard Data (Admin only)
// @route   GET /api/tasks/dashboard-data
// @access  Private
const getDashboardData = async (req, res) => {
    try {
        // Fetch statistics
        const totalTasks = await Task.countDocuments();
        const pendingTasks = await Task.countDocuments({ status: "Pending" });
        const completedTasks = await Task.countDocuments({ status: "Completed" });
        const overdueTasks = await Task.countDocuments({
            status: { $ne: "Completed" },
            dueDate: { $lt: new Date() },
        });

        // Ensure all possible statuses are included
        const taskStatuses = ["Pending", "In Progress", "Completed"];
        const taskDistributionRaw = await Task.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
        ]);
        const taskDistribution = taskStatuses.reduce((acc, status) => {
            const formattedKey = status.replace(/\s+/g, ""); // Remove spaces for response keys
            acc[formattedKey] =
                taskDistributionRaw.find((item) => item._id === status)?.count || 0;
            return acc;
        }, {});
        taskDistribution["All"] = totalTasks; // Add total count to taskDistribution

        // Ensure all priority levels are included
        const taskPriorities = ["Low", "Medium", "High"];
        const taskPriorityLevelsRaw = await Task.aggregate([
            {
                $group: {
                    _id: "$priority",
                    count: { $sum: 1 },
                },
            },
        ]);
        const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
            acc[priority] =
                taskPriorityLevelsRaw.find((item) => item._id === priority)?.count || 0;
            return acc;
        }, {});

        // Fetch recent 10 tasks
        const recentTasks = await Task.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select("title status priority dueDate createdAt project")
            .populate("project", "title");

        res.status(200).json({
            statistics: {
                totalTasks,
                pendingTasks,
                completedTasks,
                overdueTasks,
            },
            charts: {
                taskDistribution,
                taskPriorityLevels,
            },
            recentTasks,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Dashboard Data (User-specific)
// @route   GET /api/tasks/user-dashboard-data
// @access  Private
const getUserDashboardData = async (req, res) => {
    try {
        const userId = req.user._id; // Only fetch data for the logged-in user

        // Fetch statistics for user-specific tasks
        const totalTasks = await Task.countDocuments({ assignedTo: userId });
        const pendingTasks = await Task.countDocuments({ assignedTo: userId, status: "Pending" });
        const completedTasks = await Task.countDocuments({ assignedTo: userId, status: "Completed" });
        const overdueTasks = await Task.countDocuments({
            assignedTo: userId,
            status: { $ne: "Completed" },
            dueDate: { $lt: new Date() },
        });


        // Task distribution by status
        const taskStatuses = ["Pending", "In Progress", "Completed"];
        const taskDistributionRaw = await Task.aggregate([
            { $match: { assignedTo: userId } },
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]);

        const taskDistribution = taskStatuses.reduce((acc, status) => {
            const formattedKey = status.replace(/\s+/g, "");
            acc[formattedKey] =
                taskDistributionRaw.find((item) => item._id === status)?.count || 0;
            return acc;
        }, {});
        taskDistribution["All"] = totalTasks;

        // Task distribution by priority
        const taskPriorities = ["Low", "Medium", "High"];
        const taskPriorityLevelsRaw = await Task.aggregate([
            { $match: { assignedTo: userId } },
            { $group: { _id: "$priority", count: { $sum: 1 } } },
        ]);

        const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
            acc[priority] =
                taskPriorityLevelsRaw.find((item) => item._id === priority)?.count || 0;
            return acc;
        }, {});

        // Fetch recent 10 tasks for the logged-in user
        const recentTasks = await Task.find({ assignedTo: userId })
            .sort({ createdAt: -1 })
            .limit(10)
            .select("title status priority dueDate createdAt project")
            .populate("project", "title");

        res.status(200).json({
            statistics: {
                totalTasks,
                pendingTasks,
                completedTasks,
                overdueTasks,
            },
            charts: {
                taskDistribution,
                taskPriorityLevels,
            },
            recentTasks,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    updateTaskChecklist,
    getDashboardData,
    getUserDashboardData,
};
