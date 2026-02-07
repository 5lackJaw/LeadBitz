-- CreateEnum
CREATE TYPE "IcpVersionSource" AS ENUM ('WEBSITE', 'TEMPLATE', 'SPECIALIST', 'MANUAL');

-- CreateEnum
CREATE TYPE "IcpQualityTier" AS ENUM ('HIGH', 'USABLE', 'INSUFFICIENT');

-- CreateEnum
CREATE TYPE "IcpInterviewSessionStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED');

-- CreateTable
CREATE TABLE "icp_versions" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "source" "IcpVersionSource" NOT NULL,
    "title" TEXT NOT NULL,
    "icp_json" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "icp_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "icp_quality_scores" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "icp_version_id" TEXT NOT NULL,
    "score_int" INTEGER NOT NULL,
    "tier" "IcpQualityTier" NOT NULL,
    "missing_fields_json" JSONB,
    "explanations_json" JSONB,
    "questions_json" JSONB,
    "model_meta_json" JSONB,
    "computed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "icp_quality_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_archetype_classifications" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "archetype_key" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "evidence_json" JSONB NOT NULL,
    "decided_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_archetype_classifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "icp_templates" (
    "id" TEXT NOT NULL,
    "archetype_key" TEXT NOT NULL,
    "template_version" TEXT NOT NULL,
    "required_questions_json" JSONB NOT NULL,
    "default_icp_skeleton_json" JSONB NOT NULL,
    "rubric_weights_json" JSONB NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "icp_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "icp_interview_sessions" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "status" "IcpInterviewSessionStatus" NOT NULL DEFAULT 'DRAFT',
    "questions_json" JSONB,
    "answers_json" JSONB,
    "output_icp_json" JSONB,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "icp_interview_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "icp_versions_workspace_id_idx" ON "icp_versions"("workspace_id");

-- CreateIndex
CREATE INDEX "icp_versions_campaign_id_idx" ON "icp_versions"("campaign_id");

-- CreateIndex
CREATE INDEX "icp_versions_campaign_id_is_active_idx" ON "icp_versions"("campaign_id", "is_active");

-- CreateIndex
CREATE INDEX "icp_quality_scores_workspace_id_idx" ON "icp_quality_scores"("workspace_id");

-- CreateIndex
CREATE INDEX "icp_quality_scores_campaign_id_idx" ON "icp_quality_scores"("campaign_id");

-- CreateIndex
CREATE INDEX "icp_quality_scores_icp_version_id_idx" ON "icp_quality_scores"("icp_version_id");

-- CreateIndex
CREATE INDEX "product_archetype_classifications_workspace_id_idx" ON "product_archetype_classifications"("workspace_id");

-- CreateIndex
CREATE INDEX "product_archetype_classifications_campaign_id_idx" ON "product_archetype_classifications"("campaign_id");

-- CreateIndex
CREATE INDEX "product_archetype_classifications_campaign_id_decided_at_idx" ON "product_archetype_classifications"("campaign_id", "decided_at");

-- CreateIndex
CREATE INDEX "icp_templates_enabled_idx" ON "icp_templates"("enabled");

-- CreateIndex
CREATE UNIQUE INDEX "icp_templates_archetype_key_template_version_key" ON "icp_templates"("archetype_key", "template_version");

-- CreateIndex
CREATE INDEX "icp_interview_sessions_workspace_id_idx" ON "icp_interview_sessions"("workspace_id");

-- CreateIndex
CREATE INDEX "icp_interview_sessions_campaign_id_idx" ON "icp_interview_sessions"("campaign_id");

-- CreateIndex
CREATE INDEX "icp_interview_sessions_status_idx" ON "icp_interview_sessions"("status");

-- AddForeignKey
ALTER TABLE "icp_versions" ADD CONSTRAINT "icp_versions_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "icp_versions" ADD CONSTRAINT "icp_versions_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "icp_quality_scores" ADD CONSTRAINT "icp_quality_scores_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "icp_quality_scores" ADD CONSTRAINT "icp_quality_scores_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "icp_quality_scores" ADD CONSTRAINT "icp_quality_scores_icp_version_id_fkey" FOREIGN KEY ("icp_version_id") REFERENCES "icp_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_archetype_classifications" ADD CONSTRAINT "product_archetype_classifications_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_archetype_classifications" ADD CONSTRAINT "product_archetype_classifications_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "icp_interview_sessions" ADD CONSTRAINT "icp_interview_sessions_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "icp_interview_sessions" ADD CONSTRAINT "icp_interview_sessions_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
