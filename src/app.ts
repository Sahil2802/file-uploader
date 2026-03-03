import express from "express";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";
import { apiLimiter } from "./config/rateLimiters.js";
import { router } from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";

//  App Factory 

export const createApp = () => {
  const app = express();

  // Security headers
  app.use(helmet());

  // Body parsing
  app.use(express.json());

  // Rate limiting
  app.use("/api", apiLimiter);

  // API Documentation
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Routes
  app.use("/api", router);

  // Error handling
  app.use(notFound);
  app.use(errorHandler);

  return app;
};
