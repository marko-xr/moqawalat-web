import fs from "node:fs/promises";
import path from "node:path";
import { initializeDatabaseRuntime } from "../apps/api/src/services/db-runtime.js";
import { disconnectPrisma, ensurePrismaConnection, prisma } from "../apps/api/src/services/prisma.js";
import { isServiceFallbackImage } from "../apps/api/src/services/service-media-fallback.js";

type ReplacementEntry = {
  id: string;
  slug: string;
  previousCoverImage: string | null;
  nextCoverImage: string;
  previousGalleryCount: number;
  nextGalleryCount: number;
};

type ReplacementSummary = {
  dryRun: boolean;
  poolSize: number;
  scanned: number;
  affected: number;
  updated: ReplacementEntry[];
};

initializeDatabaseRuntime({ runtime: "script", source: "scripts/replaceServiceFallbackImages.ts" });

function parseDryRunFlag(value: string | undefined): boolean {
  if (!value) {
    return true;
  }

  const normalized = value.trim().toLowerCase();
  return !(normalized === "false" || normalized === "0" || normalized === "no");
}

function hashSeed(value: string): number {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}

async function readUploadPool(): Promise<string[]> {
  const uploadsDir = path.resolve(process.cwd(), "apps", "api", "uploads");
  const names = await fs.readdir(uploadsDir);

  const imageNames = names
    .filter((name) => /\.(jpg|jpeg|png|webp|avif)$/i.test(name))
    .sort((a, b) => a.localeCompare(b));

  const withSizes = await Promise.all(
    imageNames.map(async (name) => {
      const filePath = path.join(uploadsDir, name);
      const stat = await fs.stat(filePath);
      return { name, size: stat.size };
    })
  );

  const sortedBySize = withSizes.sort((a, b) => b.size - a.size || a.name.localeCompare(b.name));
  return sortedBySize.map((item) => `/uploads/${item.name}`);
}

function pickRealGallery(seed: string, pool: string[], count = 5): string[] {
  const safeCount = Math.max(5, count);
  const start = hashSeed(seed || "service") % pool.length;

  const selected: string[] = [];
  for (let offset = 0; selected.length < safeCount; offset += 1) {
    const next = pool[(start + offset) % pool.length];
    if (!selected.includes(next)) {
      selected.push(next);
    }
  }

  return selected;
}

async function main() {
  await ensurePrismaConnection();

  const dryRun = parseDryRunFlag(process.env.DRY_RUN);
  const uploadPool = await readUploadPool();

  if (uploadPool.length < 5) {
    throw new Error("At least 5 uploaded images are required in apps/api/uploads to replace fallback service media.");
  }

  const services = await prisma.service.findMany({
    select: {
      id: true,
      slug: true,
      coverImage: true,
      gallery: true
    },
    orderBy: { createdAt: "asc" }
  });

  const summary: ReplacementSummary = {
    dryRun,
    poolSize: uploadPool.length,
    scanned: services.length,
    affected: 0,
    updated: []
  };

  for (const service of services) {
    const gallery = Array.isArray(service.gallery) ? service.gallery : [];
    const usesFallbackGallery = gallery.some((item) => isServiceFallbackImage(item));
    const usesFallbackCover = isServiceFallbackImage(service.coverImage || "");

    if (!usesFallbackGallery && !usesFallbackCover) {
      continue;
    }

    const replacementGallery = pickRealGallery(`${service.slug}|${service.id}`, uploadPool, 5);
    const replacementCover = replacementGallery[0];

    if (!dryRun) {
      await prisma.service.update({
        where: { id: service.id },
        data: {
          coverImage: replacementCover,
          gallery: replacementGallery
        }
      });
    }

    summary.affected += 1;
    summary.updated.push({
      id: service.id,
      slug: service.slug,
      previousCoverImage: service.coverImage,
      nextCoverImage: replacementCover,
      previousGalleryCount: gallery.length,
      nextGalleryCount: replacementGallery.length
    });
  }

  console.log("\nReplacement summary:");
  console.log(JSON.stringify(summary, null, 2));

  if (dryRun) {
    console.log("\nDry run only. No updates were applied.");
  } else {
    console.log("\nFallback service images were replaced with real uploaded images.");
  }
}

main()
  .catch((error) => {
    console.error("Service image replacement failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectPrisma();
  });
