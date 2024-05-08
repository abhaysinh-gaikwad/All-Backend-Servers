"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const subtask_model_1 = __importDefault(require("../models/subtask.model"));
const auth_middleware_1 = __importDefault(require("./../middleware/auth.middleware"));
const dotenv_1 = __importDefault(require("dotenv"));
const task_model_1 = __importDefault(require("../models/task.model"));
dotenv_1.default.config();
const subtaskRouter = express_1.default.Router();
subtaskRouter.post("/:taskId", auth_middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { taskId } = req.params;
        const { title, isCompleted } = req.body;
        const subtask = new subtask_model_1.default({ title, isCompleted, taskId });
        yield subtask.save();
        const task = yield task_model_1.default.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        task.subtasks.push(subtask._id);
        yield task.save();
        res.status(200).json({ msg: "Subtask created successfully", subtask });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ Error: "Internal server error" });
    }
}));
subtaskRouter.get("/:taskId", auth_middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { taskId } = req.params;
        const subtasks = yield subtask_model_1.default.find({ taskId });
        res.status(200).json({ msg: "subtasks fetched successfully", subtasks });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ Error: "Internal server error" });
    }
}));
subtaskRouter.patch("/:subtaskId", auth_middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const { subtaskId } = req.params;
        const { title, isCompleted } = req.body;
        if (!userId || !subtaskId) {
            return res
                .status(400)
                .json({ message: "User ID or Subtask ID not found in request" });
        }
        const subtaskToUpdate = yield subtask_model_1.default.findOne({ _id: subtaskId });
        if (!subtaskToUpdate) {
            return res.status(404).json({ message: "Subtask not found" });
        }
        if (title) {
            subtaskToUpdate.title = title;
        }
        if (isCompleted !== undefined) {
            subtaskToUpdate.isCompleted = isCompleted;
        }
        yield subtaskToUpdate.save();
        res.status(200).json({
            message: "Subtask updated successfully",
            subtask: subtaskToUpdate,
        });
    }
    catch (error) {
        console.error("Error updating subtask:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
subtaskRouter.delete("/:subtaskId", auth_middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { subtaskId } = req.params;
        const subtaskObjectId = new mongoose_1.default.Types.ObjectId(subtaskId);
        const subtask = yield subtask_model_1.default.findById(subtaskObjectId);
        if (!subtask) {
            return res.status(404).json({ message: "Subtask not found" });
        }
        const task = yield task_model_1.default.findById(subtask.taskId);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        task.subtasks = task.subtasks.filter((subtask) => subtask.toString() !== subtaskObjectId.toString());
        yield task.save();
        yield subtask_model_1.default.findByIdAndDelete(subtaskObjectId);
        res.status(200).json({ msg: "Subtask deleted successfully" });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ Error: "Internal server error" });
    }
}));
exports.default = subtaskRouter;
