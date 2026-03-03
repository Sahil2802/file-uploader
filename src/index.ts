import { connectDb } from "./db/connect.js";
import { env, validateEnv } from "./config/env.js";
import { createApp } from "./app.js";
import { logger } from "./utils/logger.js";

const start = async (): Promise<void> => {
  try {
    validateEnv();
    await connectDb();
    const app = createApp();
    app.listen(env.port, () =>
      logger.info(`Server is running on port http://localhost:${env.port}`),
    );
  } catch (error) {
    logger.error("Failed to start the server", error);
    process.exit(1);
  }
};

start();
