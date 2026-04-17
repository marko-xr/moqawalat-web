import { initializeDatabaseRuntime } from "../apps/api/src/services/db-runtime.js";
import { disconnectPrisma, ensurePrismaConnection, prisma } from "../apps/api/src/services/prisma.js";

type ServiceUpdatePreview = {
  id: string;
  slug: string;
  beforeCoverImage: string | null;
  afterCoverImage: string | null;
  beforeImageUrl: string | null;
  afterImageUrl: string | null;
  beforeGalleryCount: number;
  afterGalleryCount: number;
};

type MigrationSummary = {
  dryRun: boolean;
  cloudName: string;
  scanned: number;
  affected: number;
  updated: ServiceUpdatePreview[];
};

const DEFAULT_CLOUD_NAME = "dxvhj64r0";

initializeDatabaseRuntime({ runtime: "script", source: "scripts/migrateServiceUploadsToCloudinary.ts" });

function parseDryRun(value: string | undefined) {
  if (!value) {
    return true;
  }

  const normalized = value.trim().toLowerCase();
  return !(normalized === "false" || normalized === "0" || normalized === "no");
}

function toUploadsPublicId(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  if (trimmed.startsWith("/uploads/")) {
    return trimmed.slice("/uploads/".length);
  }

  if (trimmed.startsWith("uploads/")) {
    return trimmed.slice("uploads/".length);
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const parsed = new URL(trimmed);
      return toUploadsPublicId(parsed.pathname || "");
    } catch {
      return "";
    }
  }

  return "";
}

function toCloudinaryUrl(rawValue: string | null | undefined, cloudName: string) {
  if (!rawValue) {
    return null;
  }

  const trimmed = rawValue.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("https://res.cloudinary.com/")) {
    return trimmed;
  }

  const publicId = toUploadsPublicId(trimmed);
  if (!publicId) {
    return trimmed;
  }

  return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
}

function normalizeGallery(gallery: string[] | null | undefined, cloudName: string) {
  if (!Array.isArray(gallery) || gallery.length === 0) {
    return [];
  }

  const normalized = gallery
    .map((item) => toCloudinaryUrl(item, cloudName))
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0);

  return Array.from(new Set(normalized));
}

function hasChangedString(beforeValue: string | null | undefined, afterValue: string | null | undefined) {
  return String(beforeValue || "") !== String(afterValue || "");
}

function hasChangedArray(beforeValue: string[] | null | undefined, afterValue: string[]) {
  const before = Array.isArray(beforeValue) ? beforeValue : [];
  if (before.length !== afterValue.length) {
    return true;
  }

  return before.some((item, index) => item !== afterValue[index]);
}

async function main() {
  await ensurePrismaConnection();

  const dryRun = parseDryRun(process.env.DRY_RUN);
  const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || DEFAULT_CLOUD_NAME).trim() || DEFAULT_CLOUD_NAME;

  const services = await prisma.service.findMany({
    select: {
      id: true,
      slug: true,
      coverImage: true,
      imageUrl: true,
      gallery: true
    },
    orderBy: { createdAt: "asc" }
  });

  const summary: MigrationSummary = {
    dryRun,
    cloudName,
    scanned: services.length,
    affected: 0,
    updated: []
  };

  for (const service of services) {
    const nextCoverImage = toCloudinaryUrl(service.coverImage, cloudName);
    const nextImageUrl = toCloudinaryUrl(service.imageUrl, cloudName);
    const nextGallery = normalizeGallery(service.gallery, cloudName);

    const changed =
      hasChangedString(service.coverImage, nextCoverImage) ||
      hasChangedString(service.imageUrl, nextImageUrl) ||
      hasChangedArray(service.gallery, nextGallery);

    if (!changed) {
      continue;
    }

    if (!dryRun) {
      await prisma.service.update({
        where: { id: service.id },
        data: {
          coverImage: nextCoverImage,
          imageUrl: nextImageUrl,
          gallery: nextGallery
        }
      });
    }

    summary.affected += 1;
    summary.updated.push({
      id: service.id,
      slug: service.slug,
      beforeCoverImage: service.coverImage,
      afterCoverImage: nextCoverImage,
      beforeImageUrl: service.imageUrl,
      afterImageUrl: nextImageUrl,
      beforeGalleryCount: Array.isArray(service.gallery) ? service.gallery.length : 0,
      afterGalleryCount: nextGallery.length
    });
  }

  console.log("\nService uploads migration summary:");
  console.log(JSON.stringify(summary, null, 2));

  if (dryRun) {
    console.log("\nDry run mode. No database updates were applied.");
  } else {
    console.log("\nMigration completed and updates were applied.");
  }
}

main()
  .catch((error) => {
    console.error("Service uploads migration failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectPrisma();
  });
