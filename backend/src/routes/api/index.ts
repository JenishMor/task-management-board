import { Router } from "express";
import authRoutes from "./auth.routes.js";
import boardRoutes from "./board.routes.js";
import profileRoutes from "./profile.routes.js";
import taskRoutes from "./task.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/boards", boardRoutes);
router.use("/profile", profileRoutes);
router.use("/tasks", taskRoutes);

// No api route found
router.use((req, res) => res.status(404).json("No API route found"));

export default router;
