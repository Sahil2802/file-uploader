import rateLimit from "express-rate-limit";

// Strict limiter for auth endpoints (brute-force protection)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                   // max 5 attempts per window
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "TOO_MANY_REQUESTS", message: "Too many attempts, please try again later." },
  skip: () => process.env.NODE_ENV === "test",
});

// General limiter for all other API routes
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,            // max 100 requests per minute
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "TOO_MANY_REQUESTS", message: "Too many requests, please slow down." },
  skip: () => process.env.NODE_ENV === "test",
});
