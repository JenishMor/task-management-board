import mongoose from "mongoose";
import { IUser } from "./User.js";
import { IBoard } from "./Board.js";

export type TaskStatus = "todo" | "in_progress" | "completed" | "blocked";

export interface ITask {
  title: string;
  description?: string;
  status: TaskStatus;
  board: mongoose.Types.ObjectId | IBoard;
  owner: mongoose.Types.ObjectId | IUser;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new mongoose.Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["todo", "in_progress", "completed", "blocked"],
      default: "todo",
    },
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for ordering tasks within a status column
taskSchema.index({ board: 1, status: 1, order: 1 });

export const Task = mongoose.model<ITask>("Task", taskSchema);
