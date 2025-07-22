import { Router } from "express";
import { body } from "express-validator";
import { protect } from "../../middleware/auth.js";
import { taskController } from "../../controllers/index.js";

const router = Router();

router.use(protect);

router.post(
  "/",
  [
    body("title").trim().notEmpty().withMessage("Task title is required"),
    body("description").optional().trim(),
    body("boardId").notEmpty().withMessage("Board ID is required"),
  ],
  taskController.createTask
);

router.get("/:boardId", taskController.getTasks);

router.patch(
  "/:id",
  [
    body("title")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Task title cannot be empty"),
    body("description").optional().trim(),
  ],
  taskController.updateTask
);

router.delete("/:id", taskController.deleteTask);

router.post(
  "/move",
  [
    body("taskId").notEmpty().withMessage("Task ID is required"),
    body("newStatus")
      .isIn(["todo", "in_progress", "completed", "blocked"])
      .withMessage("Invalid status"),
    body("newOrder").isNumeric().withMessage("Order must be a number"),
  ],
  taskController.moveTask
);

export default router;
