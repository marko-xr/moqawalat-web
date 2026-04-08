-- Add manual display order for services
ALTER TABLE "Service"
ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- Preserve current visual order (newest first) while enabling manual ordering.
WITH ranked AS (
  SELECT "id", ROW_NUMBER() OVER (ORDER BY "createdAt" DESC) - 1 AS rn
  FROM "Service"
)
UPDATE "Service" s
SET "sortOrder" = ranked.rn
FROM ranked
WHERE ranked."id" = s."id";
