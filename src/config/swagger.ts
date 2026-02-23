import swaggerJsdoc from "swagger-jsdoc";
import { env } from "./env.js";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Task Manager API",
      description:
        "A production-ready REST API for managing tasks with JWT authentication, rate limiting, and Zod validation.",
      version: "1.0.0",
    },
    servers: [
      {
        url: `http://localhost:${env.port}/api`,
        description: "Local Development",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        // ─── Auth Schemas ─────────────────────────────────────────────
        RegisterInput: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name:     { type: "string", example: "John Doe" },
            email:    { type: "string", format: "email", example: "john@example.com" },
            password: { type: "string", minLength: 8, example: "securePass1" },
          },
        },
        LoginInput: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email:    { type: "string", format: "email", example: "john@example.com" },
            password: { type: "string", example: "securePass1" },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            user: {
              type: "object",
              properties: {
                id:        { type: "string" },
                name:      { type: "string" },
                email:     { type: "string" },
                createdAt: { type: "string", format: "date-time" },
              },
            },
            token: { type: "string" },
          },
        },

        // ─── Task Schemas ─────────────────────────────────────────────
        CreateTaskInput: {
          type: "object",
          required: ["title"],
          properties: {
            title:       { type: "string", example: "Buy groceries" },
            description: { type: "string", example: "Milk, eggs, bread" },
            status:      { type: "string", enum: ["pending", "in-progress", "done"], default: "pending" },
            dueDate:     { type: "string", format: "date-time", example: "2026-03-01T12:00:00Z" },
          },
        },
        UpdateTaskInput: {
          type: "object",
          properties: {
            title:       { type: "string" },
            description: { type: "string" },
            status:      { type: "string", enum: ["pending", "in-progress", "done"] },
            dueDate:     { type: "string", format: "date-time" },
          },
        },
        Task: {
          type: "object",
          properties: {
            _id:         { type: "string" },
            title:       { type: "string" },
            description: { type: "string" },
            status:      { type: "string", enum: ["pending", "in-progress", "done"] },
            userId:      { type: "string" },
            dueDate:     { type: "string", format: "date-time", nullable: true },
            createdAt:   { type: "string", format: "date-time" },
            updatedAt:   { type: "string", format: "date-time" },
          },
        },
        TaskListResponse: {
          type: "object",
          properties: {
            tasks: { type: "array", items: { $ref: "#/components/schemas/Task" } },
            pagination: {
              type: "object",
              properties: {
                total:      { type: "integer" },
                page:       { type: "integer" },
                limit:      { type: "integer" },
                totalPages: { type: "integer" },
              },
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            error:   { type: "string" },
            message: { type: "string" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
