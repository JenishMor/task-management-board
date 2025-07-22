import express from "express";

function errorHandler(
  err: any,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
}

export default errorHandler;
