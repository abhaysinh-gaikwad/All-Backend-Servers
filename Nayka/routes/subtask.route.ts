import express, { Request, Response } from "express";
import mongoose from "mongoose";
import SubtaskModel from "../models/subtask.model";
import auth, { AuthRequest } from "./../middleware/auth.middleware";
import dotenv from "dotenv";
import TaskModel from "../models/task.model";

dotenv.config();

const subtaskRouter = express.Router();

subtaskRouter.post(
  "/:taskId",
  auth,
  async (req: AuthRequest, res: Response) => {
    try {
      const { taskId } = req.params;
      const { title, isCompleted } = req.body;
      const subtask = new SubtaskModel({ title, isCompleted, taskId });
      await subtask.save();
      const task = await TaskModel.findById(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      task.subtasks.push(subtask._id);
      await task.save();
      res.status(200).json({ msg: "Subtask created successfully", subtask });
    } catch (error) {
      console.log(error);
      res.status(500).json({ Error: "Internal server error" });
    }
  }
);

subtaskRouter.get("/:taskId", auth, async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const subtasks = await SubtaskModel.find({ taskId });
    res.status(200).json({ msg: "subtasks fetched successfully", subtasks });
  } catch (error) {
    console.log(error);
    res.status(500).json({ Error: "Internal server error" });
  }
});

subtaskRouter.patch(
  "/:subtaskId",
  auth,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?._id;
      const { subtaskId } = req.params;
      const { title, isCompleted } = req.body;

      if (!userId || !subtaskId) {
        return res
          .status(400)
          .json({ message: "User ID or Subtask ID not found in request" });
      }
      const subtaskToUpdate = await SubtaskModel.findOne({ _id: subtaskId });
      if (!subtaskToUpdate) {
        return res.status(404).json({ message: "Subtask not found" });
      }
      if (title) {
        subtaskToUpdate.title = title;
      }
      if (isCompleted !== undefined) {
        subtaskToUpdate.isCompleted = isCompleted;
      }
      await subtaskToUpdate.save();

      res.status(200).json({
        message: "Subtask updated successfully",
        subtask: subtaskToUpdate,
      });
    } catch (error) {
      console.error("Error updating subtask:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

subtaskRouter.delete(
  "/:subtaskId",
  auth,
  async (req: AuthRequest, res: Response) => {
    try {
      const { subtaskId } = req.params;
      const subtaskObjectId = new mongoose.Types.ObjectId(subtaskId);

      const subtask = await SubtaskModel.findById(subtaskObjectId);

      if (!subtask) {
        return res.status(404).json({ message: "Subtask not found" });
      }

      const task = await TaskModel.findById(subtask.taskId);

      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      task.subtasks = task.subtasks.filter(
        (subtask) => subtask.toString() !== subtaskObjectId.toString()
      );
      await task.save();

      await SubtaskModel.findByIdAndDelete(subtaskObjectId);

      res.status(200).json({ msg: "Subtask deleted successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ Error: "Internal server error" });
    }
  }
);

export default subtaskRouter;
