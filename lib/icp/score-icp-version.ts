import { IcpQualityTier } from "@prisma/client";

import { IcpDraft } from "./generate-icp-profile";
import {
  ICP_QUALITY_TIER_THRESHOLDS,
  IcpRubricBreakdownItem,
  IcpRubricMissingField,
  scoreIcpDraftWithRubric,
} from "./icp-quality-rubric";
import { prisma } from "../prisma";

const IMPROVEMENT_QUESTIONS: Record<IcpRubricMissingField["field"], string> = {
  targetIndustries:
    "Which specific industries (at least two) are the highest-priority fit for this campaign?",
  companySizeBands:
    "Which company size bands (at least two) are most likely to buy this product now?",
  buyerRoles:
    "Which buyer roles or titles (at least two) should this outreach prioritize?",
  pains:
    "What are the top pains (at least three) this ICP experiences that your product solves?",
  exclusions:
    "Which segment should be explicitly excluded to avoid poor-fit outreach?",
  valuePropAngles:
    "What value proposition angles (at least two) should messaging consistently emphasize?",
  sourceSummary:
    "Can you add a concise source summary with enough detail (about 60+ characters) for targeting context?",
};

export class IcpScoringValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IcpScoringValidationError";
  }
}

export class IcpScoringNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IcpScoringNotFoundError";
  }
}

function validateRequiredText(value: string, fieldName: string): string {
  const normalized = value.trim();

  if (!normalized) {
    throw new IcpScoringValidationError(`${fieldName} is required.`);
  }

  return normalized;
}

function normalizeList(input: unknown): string[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter((value) => value.length > 0);
}

function normalizeIcpDraft(input: unknown): IcpDraft {
  if (!input || typeof input !== "object") {
    throw new IcpScoringValidationError("ICP version payload must be an object.");
  }

  const payload = input as Record<string, unknown>;

  return {
    targetIndustries: normalizeList(payload.targetIndustries),
    companySizeBands: normalizeList(payload.companySizeBands),
    buyerRoles: normalizeList(payload.buyerRoles),
    pains: normalizeList(payload.pains),
    exclusions: normalizeList(payload.exclusions),
    valuePropAngles: normalizeList(payload.valuePropAngles),
    sourceSummary: typeof payload.sourceSummary === "string" ? payload.sourceSummary.trim() : "",
  };
}

function buildExplanations(breakdown: IcpRubricBreakdownItem[]): string[] {
  return breakdown.map((item) => {
    const requirementText =
      item.field === "sourceSummary"
        ? `${item.actualValueCount}/${item.minimumRequirement} characters`
        : `${item.actualValueCount}/${item.minimumRequirement} values`;

    return `${item.label}: ${item.earnedPoints}/${item.maxPoints} points (${requirementText}).`;
  });
}

function buildImprovementQuestions(missingFields: IcpRubricMissingField[]): string[] {
  return missingFields.map((field) => IMPROVEMENT_QUESTIONS[field.field]);
}

function toPrismaTier(tier: string): IcpQualityTier {
  if (tier === IcpQualityTier.HIGH) {
    return IcpQualityTier.HIGH;
  }

  if (tier === IcpQualityTier.USABLE) {
    return IcpQualityTier.USABLE;
  }

  return IcpQualityTier.INSUFFICIENT;
}

export async function scoreIcpVersionForWorkspace(input: {
  workspaceId: string;
  campaignId: string;
  icpVersionId: string;
}) {
  const workspaceId = validateRequiredText(input.workspaceId, "Workspace id");
  const campaignId = validateRequiredText(input.campaignId, "Campaign id");
  const icpVersionId = validateRequiredText(input.icpVersionId, "ICP version id");

  const icpVersion = await prisma.icpVersion.findFirst({
    where: {
      id: icpVersionId,
      workspaceId,
      campaignId,
    },
    select: {
      id: true,
      icpJson: true,
    },
  });

  if (!icpVersion) {
    throw new IcpScoringNotFoundError("ICP version not found.");
  }

  const normalizedIcp = normalizeIcpDraft(icpVersion.icpJson);
  const scored = scoreIcpDraftWithRubric(normalizedIcp);
  const explanations = buildExplanations(scored.breakdown);
  const questions = buildImprovementQuestions(scored.missingFields);
  const tier = toPrismaTier(scored.tier);

  const persistedScore = await prisma.icpQualityScore.create({
    data: {
      workspaceId,
      campaignId,
      icpVersionId,
      scoreInt: scored.score,
      tier,
      missingFieldsJson: scored.missingFields,
      explanationsJson: explanations,
      questionsJson: questions,
      modelMetaJson: {
        scorer: "deterministic_rubric_v1",
        thresholds: ICP_QUALITY_TIER_THRESHOLDS,
      },
    },
    select: {
      id: true,
      scoreInt: true,
      tier: true,
      missingFieldsJson: true,
      explanationsJson: true,
      questionsJson: true,
      computedAt: true,
    },
  });

  return {
    icpQualityScoreId: persistedScore.id,
    score: persistedScore.scoreInt,
    tier: persistedScore.tier,
    breakdown: scored.breakdown,
    missingFields: (persistedScore.missingFieldsJson ?? []) as IcpRubricMissingField[],
    explanations: (persistedScore.explanationsJson ?? []) as string[],
    questions: (persistedScore.questionsJson ?? []) as string[],
    computedAt: persistedScore.computedAt,
  };
}
