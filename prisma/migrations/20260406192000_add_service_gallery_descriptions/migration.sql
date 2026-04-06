-- Add per-image descriptions for service gallery images
ALTER TABLE "Service"
ADD COLUMN "galleryDescriptions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
