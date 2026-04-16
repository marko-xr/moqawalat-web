import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

export type DatabaseRuntime = "api" | "script";
export type DatabaseMode = "DIRECT" | "INVALID";

type RuntimeState = {
  envLoaded: boolean;
  lastValidatedUrl?: string;
  loggedUrlSignature?: string;
};

const LOG_PREFIX = "[db-runtime]";

const globalForDbRuntime = globalThis as typeof globalThis & {
  __moqawalatDbRuntimeState?: RuntimeState;
};

const runtimeState: RuntimeState =
  globalForDbRuntime.__moqawalatDbRuntimeState ?? {
    envLoaded: false
  };

globalForDbRuntime.__moqawalatDbRuntimeState = runtimeState;

function uniquePaths(paths: string[]): string[] {
  return [...new Set(paths.map((value) => path.resolve(value)))];
}

function getCandidateEnvFiles(runtime: DatabaseRuntime): string[] {
  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  const apiRoot = path.resolve(moduleDir, "..", "..");
  const repoRoot = path.resolve(apiRoot, "..", "..");
  const cwd = process.cwd();

  const apiEnv = path.join(apiRoot, ".env");
  const repoEnv = path.join(repoRoot, ".env");
  const cwdEnv = path.join(cwd, ".env");
  const cwdApiEnv = path.join(cwd, "apps", "api", ".env");

  if (runtime === "api") {
    return uniquePaths([apiEnv, repoEnv, cwdEnv, cwdApiEnv]);
  }

  return uniquePaths([repoEnv, cwdEnv, apiEnv, cwdApiEnv]);
}

function loadEnvironment(runtime: DatabaseRuntime) {
  if (runtimeState.envLoaded) {
    return;
  }

  const loadedFiles: string[] = [];

  for (const envFile of getCandidateEnvFiles(runtime)) {
    if (!fs.existsSync(envFile)) {
      continue;
    }

    dotenv.config({ path: envFile, override: false });
    loadedFiles.push(envFile);
  }

  runtimeState.envLoaded = true;

  if (loadedFiles.length) {
    console.info(`${LOG_PREFIX} Loaded env files: ${loadedFiles.join(", ")}`);
  } else {
    console.warn(`${LOG_PREFIX} No .env file found. Falling back to process environment only.`);
  }
}

function classifyDatabaseUrl(databaseUrl: string): DatabaseMode {
  const normalized = databaseUrl.trim().toLowerCase();

  if (normalized.startsWith("postgresql://")) {
    return "DIRECT";
  }

  return "INVALID";
}

function maskToken(value: string): string {
  if (!value) {
    return "(none)";
  }

  if (value.length <= 2) {
    return "**";
  }

  return `${value.slice(0, 1)}***${value.slice(-1)}`;
}

function sanitizeDatabaseUrl(databaseUrl: string): string {
  try {
    const parsed = new URL(databaseUrl);
    const protocol = parsed.protocol || "postgresql:";
    const username = decodeURIComponent(parsed.username || "");
    const host = parsed.hostname || "localhost";
    const port = parsed.port || "5432";
    const databaseName = parsed.pathname.replace(/^\//, "") || "(missing-db-name)";
    const sslEnabled =
      parsed.searchParams.get("sslmode") ||
      parsed.searchParams.get("ssl") ||
      parsed.searchParams.get("tls") ||
      "unset";

    return `${protocol}//${maskToken(username)}@${host}:${port}/${databaseName}?ssl=${sslEnabled}`;
  } catch {
    return "(unparseable DATABASE_URL)";
  }
}

function throwDatabaseUrlError(databaseUrl: string, source: string): never {
  const mode = classifyDatabaseUrl(databaseUrl);
  const sanitized = sanitizeDatabaseUrl(databaseUrl);

  console.error(`${LOG_PREFIX} Active DB mode: ${mode}`);
  console.error(`${LOG_PREFIX} DATABASE_URL (sanitized): ${sanitized}`);

  throw new Error(
    `${LOG_PREFIX} Invalid DATABASE_URL protocol. Expected postgresql:// but received a different scheme. Source: ${source}`
  );
}

export function initializeDatabaseRuntime(options?: { runtime?: DatabaseRuntime; source?: string; strict?: boolean }) {
  const runtime = options?.runtime ?? "api";
  const source = options?.source ?? "unknown-source";
  const strict = options?.strict ?? true;

  loadEnvironment(runtime);

  const databaseUrl = process.env.DATABASE_URL?.trim() || "";

  if (!databaseUrl) {
    const message =
      `${LOG_PREFIX} DATABASE_URL is missing. Define a PostgreSQL connection string (postgresql://...) before starting. Source: ${source}`;

    if (strict) {
      throw new Error(message);
    }

    console.error(message);
    return {
      mode: "INVALID" as const,
      databaseUrl,
      sanitized: "(missing DATABASE_URL)"
    };
  }

  const mode = classifyDatabaseUrl(databaseUrl);

  if (mode !== "DIRECT") {
    if (strict) {
      throwDatabaseUrlError(databaseUrl, source);
    }

    console.error(
      `${LOG_PREFIX} Invalid DATABASE_URL protocol. Expected postgresql://. Source: ${source}`
    );

    return {
      mode,
      databaseUrl,
      sanitized: sanitizeDatabaseUrl(databaseUrl)
    };
  }

  runtimeState.lastValidatedUrl = databaseUrl;

  const sanitized = sanitizeDatabaseUrl(databaseUrl);
  const logSignature = `${mode}|${sanitized}`;

  if (runtimeState.loggedUrlSignature !== logSignature) {
    console.info(`${LOG_PREFIX} Active DB mode: ${mode}`);
    console.info(`${LOG_PREFIX} DATABASE_URL (sanitized): ${sanitized}`);
    runtimeState.loggedUrlSignature = logSignature;
  }

  return {
    mode,
    databaseUrl,
    sanitized
  };
}
