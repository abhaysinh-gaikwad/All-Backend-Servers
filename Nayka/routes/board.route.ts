import express, { Request, Response } from "express";
import mongoose from "mongoose";
import BoardModel from "../models/board.model";
import TaskModel from "../models/task.model";
import SubtaskModel from "../models/subtask.model";
import auth, { AuthRequest } from "./../middleware/auth.middleware";

import dotenv from "dotenv";

dotenv.config();

const boardRouter = express.Router();

boardRouter.post("/", auth, async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(400).json({ message: "User ID not found in request" });
    }

    const board = new BoardModel({ name, userId });
    await board.save();
    res.status(200).json({ msg: "Board created successfully", board });
  } catch (error) {
    console.log(error);
    res.status(500).json({ Error: "Internal server error" });
  }
});

boardRouter.get("/", auth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const boards = await BoardModel.find({ userId });
    res.status(200).json({ msg: "Boards fetched successfully", boards });
  } catch (error) {
    console.log(error);
    res.status(500).json({ Error: "Internal server error" });
  }
})

boardRouter.get("/:boardId", auth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { boardId } = req.params;

    if (!userId || !boardId) {
      return res
        .status(400)
        .json({ message: "User ID or Board ID not found in request" });
    }

    const board = await BoardModel.findOne({ _id: boardId, userId })
      .populate({
        path: "tasks",
        populate: {
          path: "subtasks",
        },
        options: {
          group: { _id: null, tasks: { $push: "$subtasks" } },
        },
      })
      .exec();

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }
    res.status(200).send(board);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Internal server error" });
  }
});

boardRouter.delete(
  "/:boardId",
  auth,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?._id;
      const { boardId } = req.params;

      if (!userId || !boardId) {
        return res
          .status(400)
          .json({ message: "User ID or Board ID not found in request" });
      }

      const deletedBoard = await BoardModel.findOneAndDelete({
        _id: boardId,
        userId,
      });

      if (!deletedBoard) {
        return res.status(404).json({ message: "Board not found" });
      }

      await TaskModel.deleteMany({ boardId: deletedBoard._id });

      await SubtaskModel.deleteMany({ taskId: { $in: deletedBoard.tasks } });

      res
        .status(200)
        .json({ message: "Board and associated data deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

boardRouter.patch(
  "/:boardId",
  auth,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?._id;
      const { boardId } = req.params;

      if (!userId || !boardId) {
        return res
          .status(400)
          .json({ message: "User ID or Board ID not found in request" });
      }

      const board = await BoardModel.findOneAndUpdate(
        { _id: boardId, userId },
        req.body,
        { new: true }
      );

      if (!board) {
        return res.status(404).json({ message: "Board not found" });
      }

      res.status(200).json({ message: "Board updated successfully", board });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default boardRouter;

// boardRouter.get('/:boardId', auth, async (req: Request, res: Response) => {
//     try {
//         const { boardId } = req.params;
//         const boardData = await BoardModel.aggregate([
//             { $match: { _id: new mongoose.Types.ObjectId(boardId) } },
//             {
//                 $lookup: {
//                     from: 'tasks',
//                     localField: 'tasks',
//                     foreignField: '_id',
//                     as: 'tasks'
//                 }
//             },
//             {
//                 $unwind: '$tasks'
//             },
//             {
//                 $lookup: {
//                     from: 'subtasks',
//                     localField: 'tasks._id',
//                     foreignField: 'taskId',
//                     as: 'tasks.subtasks'
//                 }
//             },
//             {
//                 $group: {
//                     _id: '$tasks.status',
//                     tasks: { $push: '$tasks' }
//                 }
//             },
//             {
//                 $project: {
//                     _id: 0,
//                     status: '$_id.status',
//                     tasks: 1
//                 }
//             }
//         ]);

//         if (!boardData || boardData.length === 0) {
//             return res.status(404).json({ message: 'Board not found' });
//         }

//         console.log(boardData);

//         res.status(200).json({ boardData });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ Error: 'Internal server error' });
//     }
// });
