const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
    text: { type: String, required: true },
    completed: { type: Boolean, default: false },
});

const activityEntrySchema = new mongoose.Schema(
    {
        action: { type: String, required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        message: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
    },
    { _id: true }
);

const taskSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String },
        priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
        status: { type: String, enum: ["Pending", "In Progress", "Completed"], default: "Pending" },
        dueDate: { type: Date, required: true },
        project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
        assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        attachments: [{ type: String }],
        todoChecklist: [todoSchema],
        activity: { type: [activityEntrySchema], default: [] },
        progress: { type: Number, default: 0 }
        
    },
    { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
