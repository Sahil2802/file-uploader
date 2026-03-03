import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { create, list, getOne, update, remove } from "../controllers/taskController.js";

export const taskRouter = Router();

// All task routes require authentication
taskRouter.use(requireAuth);

taskRouter.post("/",asyncHandler(create));
taskRouter.get("/",asyncHandler(list));
taskRouter.get("/:id",asyncHandler(getOne));
taskRouter.patch("/:id",asyncHandler(update));
taskRouter.delete("/:id",asyncHandler(remove));
