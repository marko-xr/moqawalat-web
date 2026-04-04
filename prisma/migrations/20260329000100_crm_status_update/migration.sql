-- Replace enum with the new production CRM states and map legacy values to CLOSED.
CREATE TYPE "LeadStatus_new" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'CLOSED');

ALTER TABLE "Lead"
ALTER COLUMN "status" DROP DEFAULT,
ALTER COLUMN "status" TYPE "LeadStatus_new"
USING (
	CASE
		WHEN "status"::text IN ('PROPOSAL_SENT', 'WON', 'LOST') THEN 'CLOSED'
		ELSE "status"::text
	END
)::"LeadStatus_new";

ALTER TABLE "Lead"
ALTER COLUMN "status" SET DEFAULT 'NEW';

DROP TYPE "LeadStatus";
ALTER TYPE "LeadStatus_new" RENAME TO "LeadStatus";
