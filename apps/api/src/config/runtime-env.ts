import { initializeDatabaseRuntime } from "../services/db-runtime.js";

initializeDatabaseRuntime({ runtime: "api", source: "apps/api/src/server.ts" });
