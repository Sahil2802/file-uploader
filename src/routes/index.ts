import { Router } from "express";
import { authRouter } from "./authRoutes.js";
import { taskRouter } from "./taskRoutes.js";
import { authLimiter } from "../config/rateLimiters.js";

export const router = Router();

router.use("/auth", authLimiter, authRouter);
router.use("/tasks", taskRouter);

router.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});
