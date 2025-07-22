import { Router } from "express";
import { body } from "express-validator";
import { authController } from "../../controllers/index.js";
const router = Router();

router.post(
  "/signup",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").trim().isEmail().withMessage("Please enter a valid email"),
    body("password")
      .trim()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  authController.signup
);

router.post(
  "/login",
  [
    body("email").trim().isEmail().withMessage("Please enter a valid email"),
    body("password").trim().notEmpty().withMessage("Password is required"),
  ],
  authController.login
);

router.post(
  "/forgot-password",
  [body("email").trim().isEmail().withMessage("Please enter a valid email")],
  authController.forgotPassword
);

router.post(
  "/reset-password",
  [
    body("email").trim().isEmail().withMessage("Please enter a valid email"),
    body("newPassword")
      .trim()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  authController.resetPassword
);

export default router;
