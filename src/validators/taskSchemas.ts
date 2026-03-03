import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

//  Input Schemas (validation + OpenAPI) 
// No .transform() — Mongoose natively coerces ISO strings to Dates.
// This keeps schemas pure for both validation AND OpenAPI generation.

export const createTaskSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title cannot be empty")
      .max(200, "Title must be 200 characters or fewer"),
    description: z
      .string()
      .trim()
      .max(2000, "Description must be 2000 characters or fewer")
      .optional(),
    status: z
      .enum(["pending", "in-progress", "done"])
      .default("pending"),
    dueDate: z
      .string()
      .datetime({ message: "Invalid ISO 8601 date format" })
      .optional(),
  })
  .openapi("CreateTaskInput");

export const updateTaskSchema = createTaskSchema
  .partial()
  .openapi("UpdateTaskInput");

export const taskQuerySchema = z.object({
  status: z.enum(["pending", "in-progress", "done"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(["createdAt", "dueDate", "title"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

//  Response Schemas (documentation only) 
// These describe the OUTPUT shape — different from input (has _id, timestamps, etc.)

export const taskSchema = z
  .object({
    _id: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    status: z.enum(["pending", "in-progress", "done"]),
    userId: z.string(),
    dueDate: z.string().datetime().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .openapi("Task");

export const taskListResponseSchema = z
  .object({
    tasks: z.array(taskSchema),
    pagination: z.object({
      total: z.number().int(),
      page: z.number().int(),
      limit: z.number().int(),
      totalPages: z.number().int(),
    }),
  })
  .openapi("TaskListResponse");

//  Inferred Types 

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQuery = z.infer<typeof taskQuerySchema>;
