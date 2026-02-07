import { IcpInterviewSessionStatus, IcpVersionSource } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type InterviewQuestion = {
  key: string;
  label: string;
  placeholder: string;
};

const SPECIALIST_QUESTIONS: InterviewQuestion[] = [
  {
    key: "targetBuyerRole",
    label: "Who is the primary buyer role/title for this campaign?",
    placeholder: "Head of Sales",
  },
  {
    key: "bestFitCompanySignals",
    label: "Which company signals indicate a strong fit?",
    placeholder: "Outbound team in place, CRM maturity, deliverability issues",
  },
  {
    key: "criticalPains",
    label: "What are the top pains this ICP must experience?",
    placeholder: "Low reply rates; sender reputation risk; inconsistent outbound process",
  },
  {
    key: "mustAvoidSegments",
    label: "Which segments should be excluded even if they match surface traits?",
    placeholder: "B2C-only companies; high-volume spam operators",
  },
  {
    key: "proofPoints",
    label: "What proof points should messaging emphasize?",
    placeholder: "Operator-reviewed AI flow; deliverability controls; audit visibility",
  },
];

export class SpecialistInterviewValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SpecialistInterviewValidationError";
  }
}

export class SpecialistInterviewNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SpecialistInterviewNotFoundError";
  }
}

function validateRequiredText(value: string, fieldName: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new SpecialistInterviewValidationError(`${fieldName} is required.`);
  }
  return normalized;
}

function normalizeAnswerMap(input: unknown): Record<string, string> {
  if (!input || typeof input !== "object") {
    throw new SpecialistInterviewValidationError("Answers payload must be an object.");
  }

  const payload = input as Record<string, unknown>;
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (typeof value === "string") {
      const cleaned = value.trim();
      if (cleaned) {
        normalized[key] = cleaned;
      }
    }
  }

  return normalized;
}

function splitList(value: string): string[] {
  return value
    .split(/[;\n,]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

type SessionAnswersState = {
  baseIcpVersionId: string;
  responses: Record<string, string>;
};

function parseSessionAnswers(input: unknown): SessionAnswersState {
  if (!input || typeof input !== "object") {
    throw new SpecialistInterviewValidationError("Interview session answers state is invalid.");
  }

  const payload = input as Record<string, unknown>;
  const baseIcpVersionId = typeof payload.baseIcpVersionId === "string" ? payload.baseIcpVersionId : "";
  if (!baseIcpVersionId) {
    throw new SpecialistInterviewValidationError("Interview base ICP version is missing.");
  }

  const responses =
    payload.responses && typeof payload.responses === "object"
      ? (payload.responses as Record<string, unknown>)
      : {};

  const normalizedResponses: Record<string, string> = {};
  for (const [key, value] of Object.entries(responses)) {
    if (typeof value === "string" && value.trim()) {
      normalizedResponses[key] = value.trim();
    }
  }

  return {
    baseIcpVersionId,
    responses: normalizedResponses,
  };
}

function unresolvedQuestions(responses: Record<string, string>): InterviewQuestion[] {
  return SPECIALIST_QUESTIONS.filter((question) => !responses[question.key]);
}

function buildIcpFromInterview(baseIcp: unknown, responses: Record<string, string>) {
  const payload = (baseIcp && typeof baseIcp === "object" ? baseIcp : {}) as Record<string, unknown>;

  const baseBuyerRoles = Array.isArray(payload.buyerRoles)
    ? payload.buyerRoles.filter((item) => typeof item === "string").map((item) => item.trim())
    : [];
  const basePains = Array.isArray(payload.pains)
    ? payload.pains.filter((item) => typeof item === "string").map((item) => item.trim())
    : [];
  const baseExclusions = Array.isArray(payload.exclusions)
    ? payload.exclusions.filter((item) => typeof item === "string").map((item) => item.trim())
    : [];
  const baseValueAngles = Array.isArray(payload.valuePropAngles)
    ? payload.valuePropAngles.filter((item) => typeof item === "string").map((item) => item.trim())
    : [];

  const mergedBuyerRoles = unique([
    ...baseBuyerRoles,
    ...(responses.targetBuyerRole ? splitList(responses.targetBuyerRole) : []),
  ]);
  const mergedPains = unique([...basePains, ...(responses.criticalPains ? splitList(responses.criticalPains) : [])]);
  const mergedExclusions = unique([
    ...baseExclusions,
    ...(responses.mustAvoidSegments ? splitList(responses.mustAvoidSegments) : []),
  ]);
  const mergedValueAngles = unique([
    ...baseValueAngles,
    ...(responses.proofPoints ? splitList(responses.proofPoints) : []),
  ]);

  const baseSummary = typeof payload.sourceSummary === "string" ? payload.sourceSummary.trim() : "";
  const additions = [
    responses.bestFitCompanySignals ? `Best-fit signals: ${responses.bestFitCompanySignals}.` : "",
    responses.proofPoints ? `Proof points: ${responses.proofPoints}.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const sourceSummary = [baseSummary, additions].filter(Boolean).join(" ").trim();

  return {
    ...payload,
    buyerRoles: mergedBuyerRoles,
    pains: mergedPains,
    exclusions: mergedExclusions,
    valuePropAngles: mergedValueAngles,
    sourceSummary,
  };
}

function buildDiffSummary(baseIcp: unknown, improvedIcp: Record<string, unknown>): string[] {
  const base = (baseIcp && typeof baseIcp === "object" ? baseIcp : {}) as Record<string, unknown>;
  const summary: string[] = [];

  const trackedFields = ["buyerRoles", "pains", "exclusions", "valuePropAngles", "sourceSummary"];
  for (const field of trackedFields) {
    const before = JSON.stringify(base[field] ?? null);
    const after = JSON.stringify(improvedIcp[field] ?? null);
    if (before !== after) {
      summary.push(`Updated ${field}.`);
    }
  }

  return summary.length > 0 ? summary : ["No material ICP differences were detected."];
}

export async function startSpecialistInterviewSession(input: {
  workspaceId: string;
  campaignId: string;
  icpVersionId: string;
}) {
  const workspaceId = validateRequiredText(input.workspaceId, "Workspace id");
  const campaignId = validateRequiredText(input.campaignId, "Campaign id");
  const icpVersionId = validateRequiredText(input.icpVersionId, "ICP version id");

  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, workspaceId },
    select: { id: true },
  });

  if (!campaign) {
    throw new SpecialistInterviewNotFoundError("Campaign not found.");
  }

  const icpVersion = await prisma.icpVersion.findFirst({
    where: { id: icpVersionId, campaignId, workspaceId },
    select: { id: true },
  });

  if (!icpVersion) {
    throw new SpecialistInterviewNotFoundError("ICP version not found.");
  }

  const session = await prisma.icpInterviewSession.create({
    data: {
      workspaceId,
      campaignId,
      status: IcpInterviewSessionStatus.IN_PROGRESS,
      questionsJson: SPECIALIST_QUESTIONS,
      answersJson: {
        baseIcpVersionId: icpVersionId,
        responses: {},
      },
    },
    select: {
      id: true,
      questionsJson: true,
      startedAt: true,
    },
  });

  return {
    sessionId: session.id,
    questions: session.questionsJson as InterviewQuestion[],
    startedAt: session.startedAt,
  };
}

export async function answerSpecialistInterviewSession(input: {
  workspaceId: string;
  sessionId: string;
  answers: unknown;
}) {
  const workspaceId = validateRequiredText(input.workspaceId, "Workspace id");
  const sessionId = validateRequiredText(input.sessionId, "Session id");
  const nextAnswers = normalizeAnswerMap(input.answers);

  const session = await prisma.icpInterviewSession.findFirst({
    where: { id: sessionId, workspaceId },
    select: {
      id: true,
      status: true,
      answersJson: true,
    },
  });

  if (!session) {
    throw new SpecialistInterviewNotFoundError("Interview session not found.");
  }

  if (session.status !== IcpInterviewSessionStatus.IN_PROGRESS) {
    throw new SpecialistInterviewValidationError("Interview session is not in progress.");
  }

  const parsed = parseSessionAnswers(session.answersJson);
  const mergedResponses = {
    ...parsed.responses,
    ...nextAnswers,
  };

  await prisma.icpInterviewSession.update({
    where: { id: session.id },
    data: {
      answersJson: {
        baseIcpVersionId: parsed.baseIcpVersionId,
        responses: mergedResponses,
      },
    },
  });

  const nextQuestions = unresolvedQuestions(mergedResponses);
  return {
    nextQuestions,
    done: nextQuestions.length === 0,
  };
}

export async function completeSpecialistInterviewSession(input: {
  workspaceId: string;
  sessionId: string;
}) {
  const workspaceId = validateRequiredText(input.workspaceId, "Workspace id");
  const sessionId = validateRequiredText(input.sessionId, "Session id");

  return prisma.$transaction(async (tx) => {
    const session = await tx.icpInterviewSession.findFirst({
      where: { id: sessionId, workspaceId },
      select: {
        id: true,
        campaignId: true,
        status: true,
        answersJson: true,
      },
    });

    if (!session) {
      throw new SpecialistInterviewNotFoundError("Interview session not found.");
    }

    if (session.status !== IcpInterviewSessionStatus.IN_PROGRESS) {
      throw new SpecialistInterviewValidationError("Interview session is not in progress.");
    }

    const parsed = parseSessionAnswers(session.answersJson);
    const pendingQuestions = unresolvedQuestions(parsed.responses);
    if (pendingQuestions.length > 0) {
      throw new SpecialistInterviewValidationError("Complete all required interview questions first.");
    }

    const baseVersion = await tx.icpVersion.findFirst({
      where: {
        id: parsed.baseIcpVersionId,
        workspaceId,
        campaignId: session.campaignId,
      },
      select: {
        id: true,
        title: true,
        icpJson: true,
      },
    });

    if (!baseVersion) {
      throw new SpecialistInterviewNotFoundError("Base ICP version not found.");
    }

    const improvedIcp = buildIcpFromInterview(baseVersion.icpJson, parsed.responses);
    const diffSummary = buildDiffSummary(baseVersion.icpJson, improvedIcp);

    await tx.icpVersion.updateMany({
      where: {
        workspaceId,
        campaignId: session.campaignId,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    const createdVersion = await tx.icpVersion.create({
      data: {
        workspaceId,
        campaignId: session.campaignId,
        source: IcpVersionSource.SPECIALIST,
        title: "Specialist Interview Draft",
        icpJson: improvedIcp,
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    await tx.icpInterviewSession.update({
      where: {
        id: session.id,
      },
      data: {
        status: IcpInterviewSessionStatus.COMPLETED,
        outputIcpJson: improvedIcp,
        completedAt: new Date(),
      },
    });

    return {
      icpVersionId: createdVersion.id,
      diffSummary,
    };
  });
}
