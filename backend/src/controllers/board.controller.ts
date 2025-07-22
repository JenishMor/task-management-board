import { Request, Response } from "express";
import { Board } from "../models/Board.js";

export const createBoard = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const board = await Board.create({
      name,
      description,
      owner: req.user._id,
    });

    res.status(201).json(board);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getBoards = async (req: Request, res: Response) => {
  try {
    const boards = await Board.find({ owner: req.user._id }).sort("-createdAt");
    res.json(boards);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getBoard = async (req: Request, res: Response) => {
  try {
    const board = await Board.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    res.json(board);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBoard = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const board = await Board.findOneAndUpdate(
      {
        _id: req.params.id,
        owner: req.user._id,
      },
      {
        name,
        description,
      },
      { new: true }
    );

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    res.json(board);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBoard = async (req: Request, res: Response) => {
  try {
    const board = await Board.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    res.json({ message: "Board deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
