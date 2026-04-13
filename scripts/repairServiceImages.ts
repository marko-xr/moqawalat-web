import { initializeDatabaseRuntime } from "../apps/api/src/services/db-runtime.js";
import { disconnectPrisma, ensurePrismaConnection, prisma } from "../apps/api/src/services/prisma.js";
import { isValidServiceImageUrl, resolveServiceMedia } from "../apps/api/src/services/service-media-fallback.js";

type RepairEntry = {
  id: string;
  slug: string;
  hadEmptyGallery: boolean;
  hadMissingCover: boolean;
  nextCoverImage: string;
  nextGalleryCount: number;
};

type RepairSummary = {
  dryRun: boolean;
  scanned: number;
  affected: number;
  emptyGalleryCount: number;
  missingCoverCount: number;
  updated: RepairEntry[];
};

initializeDatabaseRuntime({ runtime: "script", source: "scripts/repairServiceImages.ts" });

function parseDryRunFlag(value: string | undefined): boolean {
  if (!value) {
    return true;
  }

  const normalized = value.trim().toLowerCase();
  return !(normalized === "false" || normalized === "0" || normalized === "no");
}

async function main() {
  await ensurePrismaConnection();

  const dryRun = parseDryRunFlag(process.env.DRY_RUN);

  const services = await prisma.service.findMany({
    select: {
      id: true,
      slug: true,
      titleAr: true,
      imageUrl: true,
      coverImage: true,
      gallery: true
    },
    orderBy: { createdAt: "asc" }
  });

  const summary: RepairSummary = {
    dryRun,
    scanned: services.length,
    affected: 0,
    emptyGalleryCount: 0,
    missingCoverCount: 0,
    updated: []
  };

  for (const service of services) {
    const sanitizedGallery = Array.isArray(service.gallery)
      ? service.gallery.map((item) => String(item || "").trim()).filter((item) => isValidServiceImageUrl(item))
      : [];

    const coverCandidate = String(service.coverImage || "").trim();
    const hadEmptyGallery = sanitizedGallery.length === 0;
    const hadMissingCover = !isValidServiceImageUrl(coverCandidate);

    if (!hadEmptyGallery && !hadMissingCover) {
      continue;
    }

    const resolvedMedia = resolveServiceMedia(service);

    if (!dryRun) {
      await prisma.service.update({
        where: { id: service.id },
        data: {
          coverImage: resolvedMedia.coverImage,
          gallery: resolvedMedia.gallery
        }
      });
    }

    summary.affected += 1;
    if (hadEmptyGallery) {
      summary.emptyGalleryCount += 1;
    }
    if (hadMissingCover) {
      summary.missingCoverCount += 1;
    }

    summary.updated.push({
      id: service.id,
      slug: service.slug,
      hadEmptyGallery,
      hadMissingCover,
      nextCoverImage: resolvedMedia.coverImage,
      nextGalleryCount: resolvedMedia.gallery.length
    });
  }

  console.log("\nRepair summary:");
  console.log(JSON.stringify(summary, null, 2));

  if (dryRun) {
    console.log("\nDry run only. No updates were applied.");
  } else {
    console.log("\nService image repair completed.");
  }
}

main()
  .catch((error) => {
    console.error("Service image repair failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectPrisma();
  });
