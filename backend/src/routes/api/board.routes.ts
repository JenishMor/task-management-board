import { Router } from "express";
import { body } from "express-validator";
import { protect } from "../../middleware/auth.js";
import { boardController } from "../../controllers/index.js";

const router = Router();

router.use(protect);

router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Board name is required"),
    body("description").optional().trim(),
  ],
  boardController.createBoard
);

router.get("/", boardController.getBoards);
router.get("/:id", boardController.getBoard);

router.patch(
  "/:id",
  [
    body("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Board name cannot be empty"),
    body("description").optional().trim(),
  ],
  boardController.updateBoard
);

router.delete("/:id", boardController.deleteBoard);

export default router;
