import { PrismaClient } from "@prisma/client";
import { initializeDatabaseRuntime, type DatabaseRuntime } from "./db-runtime.js";

function inferRuntimeFromEntryPoint(): DatabaseRuntime {
  const entryPoint = (process.argv[1] || "").toLowerCase();

  if (
    entryPoint.includes("/scripts/") ||
    entryPoint.includes("\\scripts\\") ||
    entryPoint.includes("/prisma/") ||
    entryPoint.includes("\\prisma\\")
  ) {
    return "script";
  }

  return "api";
}

initializeDatabaseRuntime({ runtime: inferRuntimeFromEntryPoint(), source: "apps/api/src/services/prisma.ts" });

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaConnectionPromise?: Promise<void>;
  prismaDisconnectPromise?: Promise<void>;
  prismaHooksRegistered?: boolean;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"]
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export async function ensurePrismaConnection() {
  if (!globalForPrisma.prismaConnectionPromise) {
    globalForPrisma.prismaConnectionPromise = prisma.$connect();
  }

  await globalForPrisma.prismaConnectionPromise;
}

export async function disconnectPrisma() {
  if (!globalForPrisma.prismaDisconnectPromise) {
    globalForPrisma.prismaDisconnectPromise = prisma.$disconnect().finally(() => {
      globalForPrisma.prismaConnectionPromise = undefined;
      globalForPrisma.prismaDisconnectPromise = undefined;
    });
  }

  await globalForPrisma.prismaDisconnectPromise;
}

if (!globalForPrisma.prismaHooksRegistered) {
  process.once("beforeExit", async () => {
    await disconnectPrisma();
  });

  globalForPrisma.prismaHooksRegistered = true;
}
