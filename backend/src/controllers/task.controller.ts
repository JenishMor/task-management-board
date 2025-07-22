import { Request, Response } from "express";
import { Task, TaskStatus } from "../models/Task.js";
import { Board } from "../models/Board.js";

export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, description, boardId } = req.body;

    // Verify board exists and user owns it
    const board = await Board.findOne({
      _id: boardId,
      owner: req.user._id,
    });

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    // Get highest order in the status column
    const maxOrderTask = await Task.findOne({
      board: boardId,
      status: "todo",
    }).sort("-order");

    const order = maxOrderTask ? maxOrderTask.order + 1 : 0;

    const task = await Task.create({
      title,
      description,
      board: boardId,
      owner: req.user._id,
      order,
    });

    res.status(201).json(task);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getTasks = async (req: Request, res: Response) => {
  try {
    const { boardId } = req.params;

    // Verify board exists and user owns it
    const board = await Board.findOne({
      _id: boardId,
      owner: req.user._id,
    });

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    const tasks = await Task.find({ board: boardId }).sort("order");
    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;
    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        owner: req.user._id,
      },
      {
        title,
        description,
      },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Reorder remaining tasks
    await Task.updateMany(
      {
        board: task.board,
        status: task.status,
        order: { $gt: task.order },
      },
      { $inc: { order: -1 } }
    );

    res.json({ message: "Task deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const moveTask = async (req: Request, res: Response) => {
  try {
    const { taskId, newStatus, newOrder } = req.body;

    const task = await Task.findOne({
      _id: taskId,
      owner: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const oldStatus = task.status;
    const oldOrder = task.order;

    // Update orders in the old status column
    if (oldStatus === newStatus) {
      // Moving within the same column
      if (oldOrder < newOrder) {
        await Task.updateMany(
          {
            board: task.board,
            status: oldStatus,
            order: { $gt: oldOrder, $lte: newOrder },
          },
          { $inc: { order: -1 } }
        );
      } else {
        await Task.updateMany(
          {
            board: task.board,
            status: oldStatus,
            order: { $gte: newOrder, $lt: oldOrder },
          },
          { $inc: { order: 1 } }
        );
      }
    } else {
      // Moving to a different column
      // Update old column
      await Task.updateMany(
        {
          board: task.board,
          status: oldStatus,
          order: { $gt: oldOrder },
        },
        { $inc: { order: -1 } }
      );

      // Update new column
      await Task.updateMany(
        {
          board: task.board,
          status: newStatus,
          order: { $gte: newOrder },
        },
        { $inc: { order: 1 } }
      );
    }

    // Update the task
    task.status = newStatus as TaskStatus;
    task.order = newOrder;
    await task.save();

    res.json(task);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
