import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

//  Input Schemas (validation + OpenAPI) 

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name cannot be empty")
      .max(100, "Name must be 100 characters or fewer"),
    email: z.string().trim().toLowerCase().email("Invalid email format"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password must be 72 characters or fewer"),
  })
  .openapi("RegisterInput");

export const loginSchema = z
  .object({
    email: z.string().trim().toLowerCase().email("Invalid email format"),
    password: z.string().min(1, "Password cannot be empty"),
  })
  .openapi("LoginInput");

//  Response Schemas (documentation only) 

export const authResponseSchema = z
  .object({
    user: z.object({
      id: z.string(),
      name: z.string(),
      email: z.string().email(),
      createdAt: z.string().datetime(),
    }),
    token: z.string(),
  })
  .openapi("AuthResponse");

export const errorSchema = z
  .object({
    error: z.string(),
    message: z.string(),
  })
  .openapi("Error");

//  Inferred Types 

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
