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
const task_model_1 = __importDefault(require("./../models/task.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const auth_middleware_1 = __importDefault(require("./../middleware/auth.middleware"));
const dotenv_1 = __importDefault(require("dotenv"));
const board_model_1 = __importDefault(require("../models/board.model"));
const subtask_model_1 = __importDefault(require("../models/subtask.model"));
dotenv_1.default.config();
const taskRouter = express_1.default.Router();
taskRouter.post("/:boardId", auth_middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, description, status, subtaskId } = req.body;
    const { boardId } = req.params;
    try {
        const task = new task_model_1.default({
            title,
            description,
            status,
            subtaskId,
            boardId,
        });
        yield task.save();
        const board = yield board_model_1.default.findById(boardId);
        if (!board) {
            res.status(404).json({ message: "Board not found" });
        }
        board === null || board === void 0 ? void 0 : board.tasks.push(task._id);
        yield (board === null || board === void 0 ? void 0 : board.save());
        res.status(200).json({ msg: "task created successfully", task });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ Error: "Internal server error" });
    }
}));
taskRouter.get("/:boardId", auth_middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { boardId } = req.params;
        const tasks = yield task_model_1.default.find({ boardId });
        res.status(200).json({ msg: "Tasks fetched successfully", tasks });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ Error: "Internal server error" });
    }
}));
taskRouter.patch("/:taskId", auth_middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { taskId } = req.params;
        const { title, description, status } = req.body;
        if (!taskId) {
            return res.status(400).json({ message: " Task ID not found in request" });
        }
        const taskToUpdate = yield task_model_1.default.findOne({ _id: taskId });
        if (!taskToUpdate) {
            return res.status(404).json({ message: "Task not found" });
        }
        if (title) {
            taskToUpdate.title = title;
        }
        if (description) {
            taskToUpdate.description = description;
        }
        if (status) {
            taskToUpdate.status = status;
        }
        yield taskToUpdate.save();
        res
            .status(200)
            .json({ message: "Task updated successfully", task: taskToUpdate });
    }
    catch (error) {
        console.error("Error updating task:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
taskRouter.delete("/:taskId", auth_middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { taskId } = req.params;
        const taskObjectId = new mongoose_1.default.Types.ObjectId(taskId);
        const task = yield task_model_1.default.findById(taskObjectId);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        const board = yield board_model_1.default.findOne({ tasks: taskObjectId });
        if (!board) {
            return res.status(404).json({ message: "Board not found for the task" });
        }
        board.tasks = board.tasks.filter((task) => task.toHexString() !== taskId);
        yield board.save();
        yield task_model_1.default.deleteOne({ _id: taskObjectId });
        yield subtask_model_1.default.deleteMany({ taskId: taskObjectId });
        res.status(200).json({ message: "Task deleted successfully", task });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ Error: "Internal server error" });
    }
}));
exports.default = taskRouter;
