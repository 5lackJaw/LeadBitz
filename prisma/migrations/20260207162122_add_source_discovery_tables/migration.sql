-- CreateEnum
CREATE TYPE "SourceConnectorType" AS ENUM ('LICENSED_PROVIDER', 'CRM');

-- CreateEnum
CREATE TYPE "SourceRunStatus" AS ENUM ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'PARTIAL');

-- CreateEnum
CREATE TYPE "CandidateVerificationStatus" AS ENUM ('VERIFIED', 'RISKY', 'INVALID', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "CandidateStatus" AS ENUM ('NEW', 'APPROVED', 'REJECTED', 'SUPPRESSED');

-- CreateTable
CREATE TABLE "source_connectors" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "type" "SourceConnectorType" NOT NULL,
    "provider_key" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "config_json" JSONB,
    "allowed_usage_note" TEXT,
    "last_healthcheck_at" TIMESTAMP(3),
    "last_error_code" TEXT,
    "last_error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "source_connectors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "source_runs" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "connector_id" TEXT NOT NULL,
    "run_label" TEXT,
    "icp_profile_id" TEXT,
    "query_json" JSONB,
    "status" "SourceRunStatus" NOT NULL,
    "stats_json" JSONB,
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "source_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidates" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "source_run_id" TEXT NOT NULL,
    "person_provider_id" TEXT,
    "company_provider_id" TEXT,
    "email" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "title" TEXT,
    "seniority" TEXT,
    "department" TEXT,
    "company_name" TEXT,
    "company_domain" TEXT,
    "company_website" TEXT,
    "location_json" JSONB,
    "confidence_score" DECIMAL(3,2),
    "verification_status" "CandidateVerificationStatus" NOT NULL DEFAULT 'UNKNOWN',
    "status" "CandidateStatus" NOT NULL DEFAULT 'NEW',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_verifications" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "provider_key" TEXT NOT NULL,
    "status" "CandidateVerificationStatus" NOT NULL,
    "details_json" JSONB,
    "checked_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "source_connectors_workspace_id_idx" ON "source_connectors"("workspace_id");

-- CreateIndex
CREATE INDEX "source_connectors_workspace_id_enabled_idx" ON "source_connectors"("workspace_id", "enabled");

-- CreateIndex
CREATE INDEX "source_runs_workspace_id_idx" ON "source_runs"("workspace_id");

-- CreateIndex
CREATE INDEX "source_runs_campaign_id_idx" ON "source_runs"("campaign_id");

-- CreateIndex
CREATE INDEX "source_runs_connector_id_idx" ON "source_runs"("connector_id");

-- CreateIndex
CREATE INDEX "source_runs_status_idx" ON "source_runs"("status");

-- CreateIndex
CREATE INDEX "candidates_workspace_id_idx" ON "candidates"("workspace_id");

-- CreateIndex
CREATE INDEX "candidates_campaign_id_idx" ON "candidates"("campaign_id");

-- CreateIndex
CREATE INDEX "candidates_source_run_id_idx" ON "candidates"("source_run_id");

-- CreateIndex
CREATE INDEX "candidates_email_idx" ON "candidates"("email");

-- CreateIndex
CREATE INDEX "candidates_verification_status_idx" ON "candidates"("verification_status");

-- CreateIndex
CREATE INDEX "email_verifications_workspace_id_idx" ON "email_verifications"("workspace_id");

-- CreateIndex
CREATE INDEX "email_verifications_email_idx" ON "email_verifications"("email");

-- CreateIndex
CREATE INDEX "email_verifications_workspace_id_email_idx" ON "email_verifications"("workspace_id", "email");

-- AddForeignKey
ALTER TABLE "source_connectors" ADD CONSTRAINT "source_connectors_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "source_runs" ADD CONSTRAINT "source_runs_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "source_runs" ADD CONSTRAINT "source_runs_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "source_runs" ADD CONSTRAINT "source_runs_connector_id_fkey" FOREIGN KEY ("connector_id") REFERENCES "source_connectors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_source_run_id_fkey" FOREIGN KEY ("source_run_id") REFERENCES "source_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_verifications" ADD CONSTRAINT "email_verifications_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
