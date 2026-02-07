import { prisma } from "../prisma";

export type ProductArchetypeClassification = {
  archetypeKey: string | null;
  confidence: number;
  evidence: string[];
};

export type ProductArchetypeClassifier = (input: {
  campaignId: string;
  icpVersionId?: string | null;
  icpVersion?: unknown;
  productProfile?: unknown;
}) => Promise<ProductArchetypeClassification> | ProductArchetypeClassification;

export class ProductArchetypeValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProductArchetypeValidationError";
  }
}

export class ProductArchetypeNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProductArchetypeNotFoundError";
  }
}

function validateRequiredText(value: string, fieldName: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new ProductArchetypeValidationError(`${fieldName} is required.`);
  }
  return normalized;
}

function normalizeEvidence(evidence: unknown): string[] {
  if (!Array.isArray(evidence)) {
    return [];
  }

  return evidence
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0)
    .slice(0, 10);
}

function clampConfidence(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(1, value));
}

function collectText(input: unknown): string {
  if (!input || typeof input !== "object") {
    return "";
  }

  const payload = input as Record<string, unknown>;
  const textParts: string[] = [];

  for (const [key, value] of Object.entries(payload)) {
    if (typeof value === "string") {
      textParts.push(`${key}:${value.toLowerCase()}`);
      continue;
    }

    if (Array.isArray(value)) {
      const list = value.filter((item) => typeof item === "string").join(" ").toLowerCase();
      if (list) {
        textParts.push(`${key}:${list}`);
      }
    }
  }

  return textParts.join(" ");
}

function defaultClassifier(input: {
  icpVersion?: unknown;
  productProfile?: unknown;
}): ProductArchetypeClassification {
  const textCorpus = `${collectText(input.icpVersion)} ${collectText(input.productProfile)}`.trim();

  const outboundSignals = ["outbound", "deliverability", "campaign", "cold email", "sales", "reply"];
  const developerSignals = ["developer", "engineering", "api", "sdk", "dev tool", "repository"];
  const verticalSignals = ["clinic", "restaurant", "construction", "legal", "agency", "real estate"];

  const scoreSignals = (signals: string[]) => signals.filter((signal) => textCorpus.includes(signal)).length;

  const outboundScore = scoreSignals(outboundSignals);
  const developerScore = scoreSignals(developerSignals);
  const verticalScore = scoreSignals(verticalSignals);

  if (outboundScore >= 2) {
    return {
      archetypeKey: "OUTBOUND_AUTOMATION_SAAS",
      confidence: clampConfidence(0.55 + outboundScore * 0.1),
      evidence: ["Detected outbound operations and campaign/deliverability language."],
    };
  }

  if (developerScore >= 2) {
    return {
      archetypeKey: "DEVELOPER_TOOLS",
      confidence: clampConfidence(0.5 + developerScore * 0.1),
      evidence: ["Detected developer/API-focused product language."],
    };
  }

  if (verticalScore >= 2) {
    return {
      archetypeKey: "VERTICAL_SAAS",
      confidence: clampConfidence(0.5 + verticalScore * 0.1),
      evidence: ["Detected vertical-industry specific ICP or product profile terms."],
    };
  }

  return {
    archetypeKey: null,
    confidence: 0.3,
    evidence: ["Insufficient signal overlap for a confident archetype classification."],
  };
}

export async function classifyProductArchetypeForWorkspace(input: {
  workspaceId: string;
  campaignId: string;
  icpVersionId?: string | null;
  productProfile?: unknown;
  classify?: ProductArchetypeClassifier;
}) {
  const workspaceId = validateRequiredText(input.workspaceId, "Workspace id");
  const campaignId = validateRequiredText(input.campaignId, "Campaign id");
  const icpVersionId = input.icpVersionId?.trim() || null;

  const campaign = await prisma.campaign.findFirst({
    where: {
      id: campaignId,
      workspaceId,
    },
    select: {
      id: true,
    },
  });

  if (!campaign) {
    throw new ProductArchetypeNotFoundError("Campaign not found.");
  }

  let icpVersionJson: unknown = null;
  if (icpVersionId) {
    const icpVersion = await prisma.icpVersion.findFirst({
      where: {
        id: icpVersionId,
        campaignId,
        workspaceId,
      },
      select: {
        icpJson: true,
      },
    });

    if (!icpVersion) {
      throw new ProductArchetypeNotFoundError("ICP version not found.");
    }

    icpVersionJson = icpVersion.icpJson;
  }

  const classifier =
    input.classify ??
    (async (payload: { icpVersion?: unknown; productProfile?: unknown }) =>
      defaultClassifier({
        icpVersion: payload.icpVersion,
        productProfile: payload.productProfile,
      }));
  const classified = await classifier({
    campaignId,
    icpVersionId,
    icpVersion: icpVersionJson,
    productProfile: input.productProfile,
  });

  const archetypeKey = classified.archetypeKey?.trim() || null;
  const confidence = clampConfidence(classified.confidence);
  const evidence = normalizeEvidence(classified.evidence);
  const persistedKey = archetypeKey ?? "UNIDENTIFIED";

  const persisted = await prisma.productArchetypeClassification.create({
    data: {
      workspaceId,
      campaignId,
      archetypeKey: persistedKey,
      confidence,
      evidenceJson: evidence,
    },
    select: {
      id: true,
      decidedAt: true,
    },
  });

  return {
    classificationId: persisted.id,
    archetypeKey,
    confidence,
    evidence,
    decidedAt: persisted.decidedAt,
  };
}
