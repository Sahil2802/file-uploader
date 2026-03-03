import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { env } from "./env.js";

// Import the SAME schemas used for validation — single source of truth
import {
  registerSchema,
  loginSchema,
  authResponseSchema,
  errorSchema,
} from "../validators/authSchemas.js";
import {
  createTaskSchema,
  updateTaskSchema,
  taskSchema,
  taskListResponseSchema,
} from "../validators/taskSchemas.js";

//  Registry 
// It is the central object that collects your API documentation before it is converted into an OpenAPI spec.
const registry = new OpenAPIRegistry();
// It creates an object like:
// registry = {
//   definitions: {
//      paths: {},
//      components: {},
//      schemas: {}
//   }
// }

// Security scheme
// This registers a security component called bearerAuth inside the OpenAPI registry.
const bearerAuth = registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

//  Auth Paths 
registry.registerPath({
  method: "post",
  path: "/auth/register",
  tags: ["Auth"],
  summary: "Register a new user",
  request: {
    body: {
      content: { "application/json": { schema: registerSchema } },
    },
  },
  responses: {
    201: {
      description: "User created successfully",
      content: { "application/json": { schema: authResponseSchema } },
    },
    400: {
      description: "Validation error",
      content: { "application/json": { schema: errorSchema } },
    },
    409: { description: "Email already in use" },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/login",
  tags: ["Auth"],
  summary: "Log in an existing user",
  request: {
    body: {
      content: { "application/json": { schema: loginSchema } },
    },
  },
  responses: {
    200: {
      description: "Login successful",
      content: { "application/json": { schema: authResponseSchema } },
    },
    401: {
      description: "Invalid credentials",
      content: { "application/json": { schema: errorSchema } },
    },
  },
});

//  Task Paths 

registry.registerPath({
  method: "post",
  path: "/tasks",
  tags: ["Tasks"],
  summary: "Create a new task",
  security: [{ [bearerAuth.name]: [] }],
  request: {
    body: {
      content: { "application/json": { schema: createTaskSchema } },
    },
  },
  responses: {
    201: {
      description: "Task created",
      content: { "application/json": { schema: taskSchema } },
    },
    400: {
      description: "Validation error",
      content: { "application/json": { schema: errorSchema } },
    },
    401: { description: "Unauthorized" },
  },
});

registry.registerPath({
  method: "get",
  path: "/tasks",
  tags: ["Tasks"],
  summary: "List tasks with filtering, sorting, and pagination",
  security: [{ [bearerAuth.name]: [] }],
  request: {
    query: z.object({
      status: z.enum(["pending", "in-progress", "done"]).optional(),
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(10),
      sortBy: z.enum(["createdAt", "dueDate", "title"]).default("createdAt"),
      order: z.enum(["asc", "desc"]).default("desc"),
    }),
  },
  responses: {
    200: {
      description: "Paginated list of tasks",
      content: { "application/json": { schema: taskListResponseSchema } },
    },
    401: { description: "Unauthorized" },
  },
});

registry.registerPath({
  method: "get",
  path: "/tasks/{id}",
  tags: ["Tasks"],
  summary: "Get a single task by ID",
  security: [{ [bearerAuth.name]: [] }],
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: {
      description: "Task found",
      content: { "application/json": { schema: taskSchema } },
    },
    403: { description: "Forbidden" },
    404: { description: "Task not found" },
  },
});

registry.registerPath({
  method: "patch",
  path: "/tasks/{id}",
  tags: ["Tasks"],
  summary: "Partially update a task",
  security: [{ [bearerAuth.name]: [] }],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: { "application/json": { schema: updateTaskSchema } },
    },
  },
  responses: {
    200: {
      description: "Task updated",
      content: { "application/json": { schema: taskSchema } },
    },
    403: { description: "Forbidden" },
    404: { description: "Task not found" },
  },
});

registry.registerPath({
  method: "delete",
  path: "/tasks/{id}",
  tags: ["Tasks"],
  summary: "Delete a task",
  security: [{ [bearerAuth.name]: [] }],
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    204: { description: "Task deleted" },
    403: { description: "Forbidden" },
    404: { description: "Task not found" },
  },
});

//  Generate Document 

const generator = new OpenApiGeneratorV3(registry.definitions);

export const swaggerSpec = generator.generateDocument({
  openapi: "3.0.3",
  info: {
    title: "Task Manager API",
    description:
      "A production-ready REST API for managing tasks with JWT authentication, " +
      "rate limiting, and Zod validation. Schemas are auto-generated from Zod definitions.",
    version: "1.0.0",
  },
  servers: [
    {
      url: `http://localhost:${env.port}/api`,
      description: "Local Development",
    },
  ],
});
