const express = require("express");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
} = require("../controllers/projectController");

const router = express.Router();

router.post("/", protect, adminOnly, createProject);
router.get("/", protect, getProjects);
router.get("/:id", protect, getProjectById);
router.put("/:id", protect, adminOnly, updateProject);
router.delete("/:id", protect, adminOnly, deleteProject);

module.exports = router;
