const Project = require("../models/Project");
const Task = require("../models/Task");

const canViewProject = (project, user) => {
    if (user.role === "admin") return true;
    const uid = user._id.toString();
    if (project.createdBy.toString() === uid) return true;
    return project.members.some((m) => m.toString() === uid);
};

// @desc    Create project
// @route   POST /api/projects
// @access  Private (Admin)
const createProject = async (req, res) => {
    try {
        const { title, description, status, startDate, dueDate, members } = req.body;

        if (!title || !String(title).trim()) {
            return res.status(400).json({ message: "Title is required" });
        }

        if (members !== undefined && !Array.isArray(members)) {
            return res.status(400).json({ message: "members must be an array of user IDs" });
        }
        const memberIds = Array.isArray(members) ? members : [];

        const project = await Project.create({
            title: title.trim(),
            description,
            status: status || "Planning",
            startDate: startDate || undefined,
            dueDate: dueDate || undefined,
            createdBy: req.user._id,
            members: memberIds,
        });

        const populated = await Project.findById(project._id)
            .populate("createdBy", "name email profileImageUrl")
            .populate("members", "name email profileImageUrl");

        res.status(201).json({ message: "Project created successfully", project: populated });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    List projects
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
    try {
        let query = {};
        if (req.user.role !== "admin") {
            query = {
                $or: [{ createdBy: req.user._id }, { members: req.user._id }],
            };
        }

        const projects = await Project.find(query)
            .populate("createdBy", "name email profileImageUrl")
            .populate("members", "name email profileImageUrl")
            .sort({ updatedAt: -1 });

        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate("createdBy", "name email profileImageUrl")
            .populate("members", "name email profileImageUrl");

        if (!project) return res.status(404).json({ message: "Project not found" });

        if (!canViewProject(project, req.user)) {
            return res.status(403).json({ message: "Not authorized" });
        }

        res.json(project);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Admin)
const updateProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: "Project not found" });

        const { title, description, status, startDate, dueDate, members } = req.body;

        if (title !== undefined) {
            if (!String(title).trim()) {
                return res.status(400).json({ message: "Title cannot be empty" });
            }
            project.title = title.trim();
        }
        if (description !== undefined) project.description = description;
        if (status !== undefined) project.status = status;
        if (startDate !== undefined) project.startDate = startDate || null;
        if (dueDate !== undefined) project.dueDate = dueDate || null;
        if (members !== undefined) {
            if (!Array.isArray(members)) {
                return res.status(400).json({ message: "members must be an array" });
            }
            project.members = members;
        }

        await project.save();
        const updated = await Project.findById(project._id)
            .populate("createdBy", "name email profileImageUrl")
            .populate("members", "name email profileImageUrl");

        res.json({ message: "Project updated successfully", project: updated });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Admin)
const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: "Project not found" });

        await Task.updateMany({ project: project._id }, { $unset: { project: 1 } });
        await project.deleteOne();

        res.json({ message: "Project deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
};
