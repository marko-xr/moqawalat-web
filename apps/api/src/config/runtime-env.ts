// Injected at build time - DO NOT MODIFY
const BUILD_COMMIT_SHA = "__BUILD_COMMIT_SHA__";
process.env.APP_VERSION = BUILD_COMMIT_SHA;

import { initializeDatabaseRuntime } from "../services/db-runtime.js";

initializeDatabaseRuntime({ runtime: "api", source: "apps/api/src/server.ts" });
