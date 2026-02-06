-- AlterTable
ALTER TABLE "campaigns"
ADD COLUMN "inbox_connection_id" TEXT,
ADD COLUMN "messaging_rules" TEXT,
ADD COLUMN "discovery_rules" TEXT,
ADD COLUMN "wizard_state" JSONB;

-- CreateIndex
CREATE INDEX "campaigns_inbox_connection_id_idx" ON "campaigns"("inbox_connection_id");

-- AddForeignKey
ALTER TABLE "campaigns"
ADD CONSTRAINT "campaigns_inbox_connection_id_fkey"
FOREIGN KEY ("inbox_connection_id") REFERENCES "inbox_connections"("id") ON DELETE SET NULL ON UPDATE CASCADE;
