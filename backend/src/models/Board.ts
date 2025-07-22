import mongoose from "mongoose";
import { IUser } from "./User.js";

export interface IBoard {
  name: string;
  description?: string;
  owner: mongoose.Types.ObjectId | IUser;
  createdAt: Date;
  updatedAt: Date;
}

const boardSchema = new mongoose.Schema<IBoard>(
  {
    name: {
      type: String,
      required: [true, "Board name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Board = mongoose.model<IBoard>("Board", boardSchema);
