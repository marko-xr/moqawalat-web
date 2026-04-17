import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { BUILD_COMMIT_SHA } from "./generated/build-version.js";

const DB_CONNECT_TIMEOUT_MS = Number(process.env.DB_CONNECT_TIMEOUT_MS || 10000);

function hasEnv(name: string) {
  return Boolean(process.env[name]?.trim());
}

function isManagedRuntime() {
  return Boolean(
    process.env.RAILWAY_ENVIRONMENT ||
      process.env.RAILWAY_PROJECT_ID ||
      process.env.RAILWAY_SERVICE_ID
  );
}

function registerGlobalErrorHandlers() {
  process.on("uncaughtException", (error) => {
    console.error("uncaughtException:", error);
  });

  process.on("unhandledRejection", (reason) => {
    console.error("unhandledRejection:", reason);
  });
}

function loadEnvironmentFiles() {
  if (isManagedRuntime()) {
    console.info("Managed runtime detected; skipping local .env file loading");
    return;
  }

  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  const apiRoot = path.resolve(moduleDir, "..");
  const repoRoot = path.resolve(apiRoot, "..", "..");
  const candidates = [path.join(apiRoot, ".env"), path.join(repoRoot, ".env")];

  for (const envFile of candidates) {
    if (fs.existsSync(envFile)) {
      dotenv.config({ path: envFile, override: false });
    }
  }
}

function logStartupContext() {
  console.log("Starting server...");
  console.log("NODE_ENV:", process.env.NODE_ENV || "undefined");
  console.log("CLOUDINARY_CLOUD_NAME present:", hasEnv("CLOUDINARY_CLOUD_NAME"));
  console.log("CLOUDINARY_API_KEY present:", hasEnv("CLOUDINARY_API_KEY"));
  console.log("CLOUDINARY_API_SECRET present:", hasEnv("CLOUDINARY_API_SECRET"));
  console.log("DATABASE_URL present:", hasEnv("DATABASE_URL"));
}

function validateCloudinaryConfiguration() {
  if (!hasEnv("CLOUDINARY_CLOUD_NAME") || !hasEnv("CLOUDINARY_API_KEY") || !hasEnv("CLOUDINARY_API_SECRET")) {
    console.warn("Cloudinary env variables are missing; upload endpoints will return configuration errors until configured");
  }
}

async function connectDatabaseWithTimeout(ensurePrismaConnection: () => Promise<void>) {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`Database connection timeout after ${DB_CONNECT_TIMEOUT_MS}ms`)), DB_CONNECT_TIMEOUT_MS);
  });

  try {
    console.log(`Connecting to database (timeout ${DB_CONNECT_TIMEOUT_MS}ms)...`);
    await Promise.race([ensurePrismaConnection(), timeoutPromise]);
    console.log("Database connection established");
  } catch (error) {
    console.error("Database connection failed:", error);
  }
}

async function bootstrap() {
  registerGlobalErrorHandlers();
  loadEnvironmentFiles();
  logStartupContext();
  validateCloudinaryConfiguration();

  if (!process.env.APP_VERSION || !process.env.APP_VERSION.trim()) {
    process.env.APP_VERSION = BUILD_COMMIT_SHA;
  }

  const PORT = process.env.PORT || 3000;
  const { app } = await import("./app.js");
  const { ensurePrismaConnection } = await import("./services/prisma.js");

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on ${PORT}`);
  });

  void connectDatabaseWithTimeout(ensurePrismaConnection);
}

bootstrap().catch((error) => {
  console.error("API startup failed:", error);
  process.exit(1);
});
