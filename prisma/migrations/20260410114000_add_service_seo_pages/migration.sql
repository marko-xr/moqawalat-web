-- Create table for dynamic SEO service pages managed from dashboard
CREATE TABLE IF NOT EXISTS "ServiceSeoPage" (
  "id" TEXT NOT NULL,
  "serviceId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "metaTitle" TEXT,
  "metaDescription" TEXT,
  "contentSections" JSONB NOT NULL,
  "images" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "faq" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ServiceSeoPage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ServiceSeoPage_serviceId_key" ON "ServiceSeoPage"("serviceId");
CREATE UNIQUE INDEX IF NOT EXISTS "ServiceSeoPage_slug_key" ON "ServiceSeoPage"("slug");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'ServiceSeoPage_serviceId_fkey'
      AND table_name = 'ServiceSeoPage'
  ) THEN
    ALTER TABLE "ServiceSeoPage"
      ADD CONSTRAINT "ServiceSeoPage_serviceId_fkey"
      FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
