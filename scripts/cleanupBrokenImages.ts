import { initializeDatabaseRuntime } from "../apps/api/src/services/db-runtime.js";
import { disconnectPrisma, ensurePrismaConnection, prisma } from "../apps/api/src/services/prisma.js";

type AffectedRecord = {
  model: "service" | "service_seo" | "project" | "blog" | "lead";
  id: string;
  cleanedFields: string[];
  cleanedUrlCount: number;
};

type CleanupStats = {
  dryRun: boolean;
  totalRecordsScanned: number;
  totalImageValuesScanned: number;
  totalCleanedUrls: number;
  totalAffectedRecords: number;
  affectedRecords: AffectedRecord[];
};

const CLOUDINARY_PREFIX = "https://res.cloudinary.com/";

initializeDatabaseRuntime({ runtime: "script", source: "scripts/cleanupBrokenImages.ts" });

function parseDryRunFlag(value: string | undefined): boolean {
  if (!value) {
    return true;
  }

  const normalized = value.trim().toLowerCase();

  if (normalized === "false" || normalized === "0" || normalized === "no") {
    return false;
  }

  return true;
}

function isInvalidImageUrl(value: string): boolean {
  const normalized = value.trim();

  if (!normalized) {
    return true;
  }

  if (normalized.startsWith("/uploads/") || normalized.startsWith("uploads/")) {
    return false;
  }

  if (normalized.startsWith("/images/services/")) {
    return false;
  }

  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    return false;
  }

  return !normalized.startsWith(CLOUDINARY_PREFIX);
}

function cleanSingleImage(value: string | null): { nextValue: string | null; scanned: number; cleaned: number } {
  if (!value) {
    return { nextValue: value, scanned: 0, cleaned: 0 };
  }

  if (isInvalidImageUrl(value)) {
    return { nextValue: null, scanned: 1, cleaned: 1 };
  }

  return { nextValue: value, scanned: 1, cleaned: 0 };
}

function cleanImageArray(values: string[]): { nextValue: string[]; scanned: number; cleaned: number } {
  if (!Array.isArray(values) || values.length === 0) {
    return { nextValue: Array.isArray(values) ? values : [], scanned: 0, cleaned: 0 };
  }

  let cleaned = 0;
  const nextValue = values.filter((item) => {
    const invalid = isInvalidImageUrl(item);

    if (invalid) {
      cleaned += 1;
      return false;
    }

    return true;
  });

  return { nextValue, scanned: values.length, cleaned };
}

async function main() {
  await ensurePrismaConnection();

  const dryRun = parseDryRunFlag(process.env.DRY_RUN);

  const stats: CleanupStats = {
    dryRun,
    totalRecordsScanned: 0,
    totalImageValuesScanned: 0,
    totalCleanedUrls: 0,
    totalAffectedRecords: 0,
    affectedRecords: []
  };

  console.log("Running cleanupBrokenImages with DRY_RUN=" + String(dryRun));

  const services = await prisma.service.findMany({
    select: {
      id: true,
      coverImage: true,
      gallery: true
    }
  });

  stats.totalRecordsScanned += services.length;

  for (const service of services) {
    const cover = cleanSingleImage(service.coverImage);
    const gallery = cleanImageArray(service.gallery);

    stats.totalImageValuesScanned += cover.scanned + gallery.scanned;

    const cleanedFields: string[] = [];
    let cleanedUrlCount = 0;

    if (cover.cleaned > 0) {
      cleanedFields.push("coverImage");
      cleanedUrlCount += cover.cleaned;
    }

    if (gallery.cleaned > 0) {
      cleanedFields.push("gallery");
      cleanedUrlCount += gallery.cleaned;
    }

    if (cleanedFields.length === 0) {
      continue;
    }

    stats.totalCleanedUrls += cleanedUrlCount;

    if (!dryRun) {
      await prisma.service.update({
        where: { id: service.id },
        data: {
          coverImage: cover.nextValue,
          gallery: gallery.nextValue
        }
      });
    }

    stats.affectedRecords.push({
      model: "service",
      id: service.id,
      cleanedFields,
      cleanedUrlCount
    });
  }

  const serviceSeoPages = await prisma.serviceSeoPage.findMany({
    select: {
      id: true,
      images: true
    }
  });

  stats.totalRecordsScanned += serviceSeoPages.length;

  for (const page of serviceSeoPages) {
    const images = cleanImageArray(page.images);
    stats.totalImageValuesScanned += images.scanned;

    if (images.cleaned === 0) {
      continue;
    }

    stats.totalCleanedUrls += images.cleaned;

    if (!dryRun) {
      await prisma.serviceSeoPage.update({
        where: { id: page.id },
        data: { images: images.nextValue }
      });
    }

    stats.affectedRecords.push({
      model: "service_seo",
      id: page.id,
      cleanedFields: ["images"],
      cleanedUrlCount: images.cleaned
    });
  }

  const projects = await prisma.project.findMany({
    select: {
      id: true,
      coverImage: true,
      beforeImage: true,
      afterImage: true,
      gallery: true
    }
  });

  stats.totalRecordsScanned += projects.length;

  for (const project of projects) {
    const cover = cleanSingleImage(project.coverImage);
    const before = cleanSingleImage(project.beforeImage);
    const after = cleanSingleImage(project.afterImage);
    const gallery = cleanImageArray(project.gallery);

    stats.totalImageValuesScanned += cover.scanned + before.scanned + after.scanned + gallery.scanned;

    const cleanedFields: string[] = [];
    let cleanedUrlCount = 0;

    if (cover.cleaned > 0) {
      cleanedFields.push("coverImage");
      cleanedUrlCount += cover.cleaned;
    }

    if (before.cleaned > 0) {
      cleanedFields.push("beforeImage");
      cleanedUrlCount += before.cleaned;
    }

    if (after.cleaned > 0) {
      cleanedFields.push("afterImage");
      cleanedUrlCount += after.cleaned;
    }

    if (gallery.cleaned > 0) {
      cleanedFields.push("gallery");
      cleanedUrlCount += gallery.cleaned;
    }

    if (cleanedFields.length === 0) {
      continue;
    }

    stats.totalCleanedUrls += cleanedUrlCount;

    if (!dryRun) {
      await prisma.project.update({
        where: { id: project.id },
        data: {
          coverImage: cover.nextValue,
          beforeImage: before.nextValue,
          afterImage: after.nextValue,
          gallery: gallery.nextValue
        }
      });
    }

    stats.affectedRecords.push({
      model: "project",
      id: project.id,
      cleanedFields,
      cleanedUrlCount
    });
  }

  const blogPosts = await prisma.blogPost.findMany({
    select: {
      id: true,
      coverImage: true
    }
  });

  stats.totalRecordsScanned += blogPosts.length;

  for (const post of blogPosts) {
    const cover = cleanSingleImage(post.coverImage);
    stats.totalImageValuesScanned += cover.scanned;

    if (cover.cleaned === 0) {
      continue;
    }

    stats.totalCleanedUrls += cover.cleaned;

    if (!dryRun) {
      await prisma.blogPost.update({
        where: { id: post.id },
        data: { coverImage: cover.nextValue }
      });
    }

    stats.affectedRecords.push({
      model: "blog",
      id: post.id,
      cleanedFields: ["coverImage"],
      cleanedUrlCount: cover.cleaned
    });
  }

  const leads = await prisma.lead.findMany({
    select: {
      id: true,
      imageUrl: true
    }
  });

  stats.totalRecordsScanned += leads.length;

  for (const lead of leads) {
    const image = cleanSingleImage(lead.imageUrl);
    stats.totalImageValuesScanned += image.scanned;

    if (image.cleaned === 0) {
      continue;
    }

    stats.totalCleanedUrls += image.cleaned;

    if (!dryRun) {
      await prisma.lead.update({
        where: { id: lead.id },
        data: { imageUrl: image.nextValue }
      });
    }

    stats.affectedRecords.push({
      model: "lead",
      id: lead.id,
      cleanedFields: ["imageUrl"],
      cleanedUrlCount: image.cleaned
    });
  }

  stats.totalAffectedRecords = stats.affectedRecords.length;

  console.log("\nCleanup summary:");
  console.log(JSON.stringify(stats, null, 2));

  if (dryRun) {
    console.log("\nDry run only. No database updates were applied.");
  } else {
    console.log("\nDatabase cleanup applied successfully.");
  }
}

main()
  .catch((error) => {
    console.error("Cleanup failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectPrisma();
  });
