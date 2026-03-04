import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "./src/tests/tsconfig.json",
      },
    ],
  },
  testMatch: ["**/src/tests/**/*.test.ts"],
  // Increase timeout for mongodb-memory-server startup
  testTimeout: 30000,
};

export default config;
