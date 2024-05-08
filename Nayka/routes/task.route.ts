import express, { Request, Response } from "express";
import TaskModel from "./../models/task.model";
import mongoose from "mongoose";
import auth, { AuthRequest } from "./../middleware/auth.middleware";
import dotenv from "dotenv";
import BoardModel from "../models/board.model";
import SubtaskModel from "../models/subtask.model";

dotenv.config();

const taskRouter = express.Router();

taskRouter.post("/:boardId", auth, async (req: Request, res: Response) => {
  const { title, description, status, subtaskId } = req.body;
  const { boardId } = req.params;
  try {
    const task = new TaskModel({
      title,
      description,
      status,
      subtaskId,
      boardId,
    });
    await task.save();

    const board = await BoardModel.findById(boardId);
    if (!board) {
      res.status(404).json({ message: "Board not found" });
    }
    board?.tasks.push(task._id);
    await board?.save();
    res.status(200).json({ msg: "task created successfully", task });
  } catch (error) {
    console.log(error);
    res.status(500).json({ Error: "Internal server error" });
  }
});

taskRouter.get("/:boardId", auth, async (req: AuthRequest, res: Response) => {
  try {
    const { boardId } = req.params;
    const tasks = await TaskModel.find({ boardId });
    res.status(200).json({ msg: "Tasks fetched successfully", tasks });
  } catch (error) {
    console.log(error);
    res.status(500).json({ Error: "Internal server error" });
  }
});

taskRouter.patch("/:taskId", auth, async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const { title, description, status } = req.body;

    if (!taskId) {
      return res.status(400).json({ message: " Task ID not found in request" });
    }

    const taskToUpdate = await TaskModel.findOne({ _id: taskId });

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

    await taskToUpdate.save();

    res
      .status(200)
      .json({ message: "Task updated successfully", task: taskToUpdate });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

taskRouter.delete("/:taskId", auth, async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;

    const taskObjectId = new mongoose.Types.ObjectId(taskId);

    const task = await TaskModel.findById(taskObjectId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const board = await BoardModel.findOne({ tasks: taskObjectId });

    if (!board) {
      return res.status(404).json({ message: "Board not found for the task" });
    }

    board.tasks = board.tasks.filter((task) => task.toHexString() !== taskId);
    await board.save();

    await TaskModel.deleteOne({ _id: taskObjectId });

    await SubtaskModel.deleteMany({ taskId: taskObjectId });

    res.status(200).json({ message: "Task deleted successfully", task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ Error: "Internal server error" });
  }
});

export default taskRouter;
