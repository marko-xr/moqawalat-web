import fs from "node:fs/promises";
import path from "node:path";
import { initializeDatabaseRuntime } from "../apps/api/src/services/db-runtime.js";
import { disconnectPrisma, ensurePrismaConnection, prisma } from "../apps/api/src/services/prisma.js";
import { cloudinary, ensureCloudinaryConfigured } from "../apps/api/src/config/cloudinary.js";

type MigrationModel = "service" | "service_seo" | "project" | "blog" | "lead";

type MigrationFailure = {
  model: MigrationModel;
  id: string;
  field: string;
  value: string;
  reason: "missing-local-file" | "cloudinary-upload-failed";
  details?: string;
};

type MigrationSummary = {
  dryRun: boolean;
  recordsScanned: number;
  recordsUpdated: number;
  localReferencesFound: number;
  migratedValues: number;
  missingLocalFiles: number;
  uploadFailures: number;
  skippedNonUploadValues: number;
  failures: MigrationFailure[];
};

const CLOUDINARY_URL_PATTERN = /^https:\/\/res\.cloudinary\.com\//i;
const SECTION_IMAGE_KEYS = ["heroImage", "beforeImage", "afterImage"] as const;

const LOCAL_UPLOAD_ROOTS = [
  path.resolve(process.cwd(), "uploads"),
  path.resolve(process.cwd(), "apps", "api", "uploads")
];

initializeDatabaseRuntime({ runtime: "script", source: "scripts/migrateUploadsToCloudinary.ts" });

function parseDryRunFlag() {
  const argDryRun = process.argv.includes("--dry-run");
  const envValue = (process.env.DRY_RUN || "").trim().toLowerCase();
  const envDryRun = envValue === "1" || envValue === "true" || envValue === "yes";

  return argDryRun || envDryRun;
}

function resolveCloudinaryFolder(model: MigrationModel) {
  switch (model) {
    case "service":
      return "moqawalat/services";
    case "service_seo":
      return "moqawalat/seo-services";
    case "project":
      return "moqawalat/projects";
    case "blog":
      return "moqawalat/blog";
    case "lead":
      return "moqawalat/leads";
    default:
      return "moqawalat/uploads";
  }
}

function extractUploadRelativePath(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("/uploads/")) {
    return trimmed.slice("/uploads/".length);
  }

  if (trimmed.startsWith("uploads/")) {
    return trimmed.slice("uploads/".length);
  }

  try {
    const parsed = new URL(trimmed);

    if (parsed.pathname.startsWith("/uploads/")) {
      return parsed.pathname.slice("/uploads/".length);
    }
  } catch {
    return null;
  }

  return null;
}

async function findLocalUploadPath(relativePath: string): Promise<string | null> {
  const safeRelativePath = relativePath
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean)
    .join(path.sep);

  if (!safeRelativePath) {
    return null;
  }

  for (const root of LOCAL_UPLOAD_ROOTS) {
    const candidate = path.join(root, safeRelativePath);

    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      // Continue searching other roots.
    }
  }

  return null;
}

async function uploadLocalFileToCloudinary(filePath: string, folder: string): Promise<string> {
  const uploadResult = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: "image",
    overwrite: false,
    unique_filename: true,
    use_filename: false
  });

  const secureUrl = String(uploadResult?.secure_url || "").trim();

  if (!secureUrl || !CLOUDINARY_URL_PATTERN.test(secureUrl)) {
    throw new Error("Cloudinary did not return a valid secure_url.");
  }

  return secureUrl;
}

async function migrateSingleValue(options: {
  value: string | null;
  model: MigrationModel;
  id: string;
  field: string;
  summary: MigrationSummary;
  dryRun: boolean;
  uploadedUrlCache: Map<string, string>;
}): Promise<string | null> {
  const { value, model, id, field, summary, dryRun, uploadedUrlCache } = options;

  if (!value) {
    return value;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return value;
  }

  if (CLOUDINARY_URL_PATTERN.test(trimmed)) {
    return trimmed;
  }

  const relativePath = extractUploadRelativePath(trimmed);
  if (!relativePath) {
    summary.skippedNonUploadValues += 1;
    return trimmed;
  }

  summary.localReferencesFound += 1;

  if (uploadedUrlCache.has(relativePath)) {
    summary.migratedValues += 1;
    return uploadedUrlCache.get(relativePath) || trimmed;
  }

  const localFilePath = await findLocalUploadPath(relativePath);

  if (!localFilePath) {
    summary.missingLocalFiles += 1;
    summary.failures.push({
      model,
      id,
      field,
      value: trimmed,
      reason: "missing-local-file"
    });

    return trimmed;
  }

  if (dryRun) {
    return trimmed;
  }

  try {
    const cloudinaryUrl = await uploadLocalFileToCloudinary(localFilePath, resolveCloudinaryFolder(model));
    uploadedUrlCache.set(relativePath, cloudinaryUrl);
    summary.migratedValues += 1;
    return cloudinaryUrl;
  } catch (error) {
    summary.uploadFailures += 1;
    summary.failures.push({
      model,
      id,
      field,
      value: trimmed,
      reason: "cloudinary-upload-failed",
      details: error instanceof Error ? error.message : String(error)
    });

    return trimmed;
  }
}

async function migrateArrayValue(options: {
  values: string[];
  model: MigrationModel;
  id: string;
  field: string;
  summary: MigrationSummary;
  dryRun: boolean;
  uploadedUrlCache: Map<string, string>;
}) {
  const { values, model, id, field, summary, dryRun, uploadedUrlCache } = options;

  const migrated = await Promise.all(
    values.map((item) =>
      migrateSingleValue({
        value: item,
        model,
        id,
        field,
        summary,
        dryRun,
        uploadedUrlCache
      })
    )
  );

  return migrated;
}

function hasArrayChanged(before: string[], after: string[]) {
  if (before.length !== after.length) {
    return true;
  }

  for (let index = 0; index < before.length; index += 1) {
    if ((before[index] || "") !== (after[index] || "")) {
      return true;
    }
  }

  return false;
}

async function main() {
  const dryRun = parseDryRunFlag();

  if (!dryRun) {
    ensureCloudinaryConfigured();
  }

  await ensurePrismaConnection();

  const uploadedUrlCache = new Map<string, string>();
  const summary: MigrationSummary = {
    dryRun,
    recordsScanned: 0,
    recordsUpdated: 0,
    localReferencesFound: 0,
    migratedValues: 0,
    missingLocalFiles: 0,
    uploadFailures: 0,
    skippedNonUploadValues: 0,
    failures: []
  };

  const services = await prisma.service.findMany({
    select: {
      id: true,
      imageUrl: true,
      coverImage: true,
      gallery: true
    }
  });

  summary.recordsScanned += services.length;

  for (const item of services) {
    const nextImageUrl = await migrateSingleValue({
      value: item.imageUrl,
      model: "service",
      id: item.id,
      field: "imageUrl",
      summary,
      dryRun,
      uploadedUrlCache
    });

    const nextCoverImage = await migrateSingleValue({
      value: item.coverImage,
      model: "service",
      id: item.id,
      field: "coverImage",
      summary,
      dryRun,
      uploadedUrlCache
    });

    const nextGallery = await migrateArrayValue({
      values: Array.isArray(item.gallery) ? item.gallery : [],
      model: "service",
      id: item.id,
      field: "gallery",
      summary,
      dryRun,
      uploadedUrlCache
    });

    const changed =
      (item.imageUrl || null) !== (nextImageUrl || null) ||
      (item.coverImage || null) !== (nextCoverImage || null) ||
      hasArrayChanged(item.gallery || [], nextGallery);

    if (!changed) {
      continue;
    }

    if (!dryRun) {
      await prisma.service.update({
        where: { id: item.id },
        data: {
          imageUrl: nextImageUrl,
          coverImage: nextCoverImage,
          gallery: nextGallery
        }
      });
    }

    summary.recordsUpdated += 1;
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

  summary.recordsScanned += projects.length;

  for (const item of projects) {
    const nextCoverImage = await migrateSingleValue({
      value: item.coverImage,
      model: "project",
      id: item.id,
      field: "coverImage",
      summary,
      dryRun,
      uploadedUrlCache
    });

    const nextBeforeImage = await migrateSingleValue({
      value: item.beforeImage,
      model: "project",
      id: item.id,
      field: "beforeImage",
      summary,
      dryRun,
      uploadedUrlCache
    });

    const nextAfterImage = await migrateSingleValue({
      value: item.afterImage,
      model: "project",
      id: item.id,
      field: "afterImage",
      summary,
      dryRun,
      uploadedUrlCache
    });

    const nextGallery = await migrateArrayValue({
      values: Array.isArray(item.gallery) ? item.gallery : [],
      model: "project",
      id: item.id,
      field: "gallery",
      summary,
      dryRun,
      uploadedUrlCache
    });

    const changed =
      (item.coverImage || null) !== (nextCoverImage || null) ||
      (item.beforeImage || null) !== (nextBeforeImage || null) ||
      (item.afterImage || null) !== (nextAfterImage || null) ||
      hasArrayChanged(item.gallery || [], nextGallery);

    if (!changed) {
      continue;
    }

    if (!dryRun) {
      await prisma.project.update({
        where: { id: item.id },
        data: {
          coverImage: nextCoverImage,
          beforeImage: nextBeforeImage,
          afterImage: nextAfterImage,
          gallery: nextGallery
        }
      });
    }

    summary.recordsUpdated += 1;
  }

  const blogPosts = await prisma.blogPost.findMany({
    select: {
      id: true,
      coverImage: true
    }
  });

  summary.recordsScanned += blogPosts.length;

  for (const item of blogPosts) {
    const nextCoverImage = await migrateSingleValue({
      value: item.coverImage,
      model: "blog",
      id: item.id,
      field: "coverImage",
      summary,
      dryRun,
      uploadedUrlCache
    });

    const changed = (item.coverImage || null) !== (nextCoverImage || null);

    if (!changed) {
      continue;
    }

    if (!dryRun) {
      await prisma.blogPost.update({
        where: { id: item.id },
        data: {
          coverImage: nextCoverImage
        }
      });
    }

    summary.recordsUpdated += 1;
  }

  const leads = await prisma.lead.findMany({
    select: {
      id: true,
      imageUrl: true
    }
  });

  summary.recordsScanned += leads.length;

  for (const item of leads) {
    const nextImageUrl = await migrateSingleValue({
      value: item.imageUrl,
      model: "lead",
      id: item.id,
      field: "imageUrl",
      summary,
      dryRun,
      uploadedUrlCache
    });

    const changed = (item.imageUrl || null) !== (nextImageUrl || null);

    if (!changed) {
      continue;
    }

    if (!dryRun) {
      await prisma.lead.update({
        where: { id: item.id },
        data: {
          imageUrl: nextImageUrl
        }
      });
    }

    summary.recordsUpdated += 1;
  }

  const seoPages = await prisma.serviceSeoPage.findMany({
    select: {
      id: true,
      images: true,
      contentSections: true
    }
  });

  summary.recordsScanned += seoPages.length;

  for (const item of seoPages) {
    const nextImages = await migrateArrayValue({
      values: Array.isArray(item.images) ? item.images : [],
      model: "service_seo",
      id: item.id,
      field: "images",
      summary,
      dryRun,
      uploadedUrlCache
    });

    const contentSections =
      item.contentSections && typeof item.contentSections === "object" && !Array.isArray(item.contentSections)
        ? ({ ...(item.contentSections as Record<string, unknown>) } as Record<string, unknown>)
        : ({} as Record<string, unknown>);

    let sectionsChanged = false;

    for (const key of SECTION_IMAGE_KEYS) {
      const currentValue = typeof contentSections[key] === "string" ? String(contentSections[key]) : null;
      const nextValue = await migrateSingleValue({
        value: currentValue,
        model: "service_seo",
        id: item.id,
        field: `contentSections.${key}`,
        summary,
        dryRun,
        uploadedUrlCache
      });

      if ((currentValue || null) !== (nextValue || null)) {
        contentSections[key] = nextValue;
        sectionsChanged = true;
      }
    }

    const imagesChanged = hasArrayChanged(item.images || [], nextImages);

    if (!imagesChanged && !sectionsChanged) {
      continue;
    }

    if (!dryRun) {
      await prisma.serviceSeoPage.update({
        where: { id: item.id },
        data: {
          images: nextImages,
          contentSections
        }
      });
    }

    summary.recordsUpdated += 1;
  }

  const output = {
    ...summary,
    failures: summary.failures.slice(0, 200)
  };

  console.log("\nMigration summary:");
  console.log(JSON.stringify(output, null, 2));

  if (summary.failures.length > 200) {
    console.log(`\n${summary.failures.length - 200} additional failures omitted from output.`);
  }

  if (dryRun) {
    console.log("\nDry run mode enabled. No database updates were applied.");
  }
}

main()
  .catch((error) => {
    console.error("Upload-to-Cloudinary migration failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectPrisma();
  });
