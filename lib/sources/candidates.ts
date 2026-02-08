import { CandidateStatus, CandidateVerificationStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

export class CandidateListValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CandidateListValidationError";
  }
}

export class CandidateListNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CandidateListNotFoundError";
  }
}

export type CandidateListFilters = {
  verificationStatus?: CandidateVerificationStatus;
  confidenceMin?: number;
  role?: string;
  sourceRunId?: string;
};

export type ListCampaignCandidatesInput = {
  workspaceId: string;
  campaignId: string;
  filters?: CandidateListFilters;
  pageSize?: number;
  cursor?: string;
};

export type CampaignCandidateListItem = {
  id: string;
  campaignId: string;
  sourceRunId: string;
  personProviderId: string | null;
  companyProviderId: string | null;
  email: string;
  firstName: string | null;
  lastName: string | null;
  title: string | null;
  seniority: string | null;
  department: string | null;
  companyName: string | null;
  companyDomain: string | null;
  companyWebsite: string | null;
  locationJson: unknown;
  confidenceScore: number | null;
  verificationStatus: CandidateVerificationStatus;
  status: CandidateStatus;
  createdAt: Date;
};

export type CampaignCandidateListPage = {
  items: CampaignCandidateListItem[];
  pageInfo: {
    hasMore: boolean;
    nextCursor: string | null;
    pageSize: number;
  };
};

function normalizeRequiredId(value: string, fieldName: string): string {
  const normalized = value.trim();

  if (!normalized) {
    throw new CandidateListValidationError(`${fieldName} is required.`);
  }

  return normalized;
}

function normalizePageSize(value: number | undefined): number {
  if (value === undefined) {
    return DEFAULT_PAGE_SIZE;
  }

  if (!Number.isInteger(value) || value < 1 || value > MAX_PAGE_SIZE) {
    throw new CandidateListValidationError(`pageSize must be an integer between 1 and ${MAX_PAGE_SIZE}.`);
  }

  return value;
}

function normalizeCursor(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  const normalized = value.trim();
  if (!normalized) {
    return undefined;
  }

  return normalized;
}

function normalizeFilters(filters: CandidateListFilters | undefined) {
  const where: Prisma.CandidateWhereInput = {};

  if (!filters) {
    return where;
  }

  if (filters.verificationStatus !== undefined) {
    where.verificationStatus = filters.verificationStatus;
  }

  if (filters.confidenceMin !== undefined) {
    if (
      Number.isNaN(filters.confidenceMin) ||
      typeof filters.confidenceMin !== "number" ||
      filters.confidenceMin < 0 ||
      filters.confidenceMin > 1
    ) {
      throw new CandidateListValidationError("confidenceMin must be a number between 0 and 1.");
    }

    where.confidenceScore = {
      gte: new Prisma.Decimal(filters.confidenceMin),
    };
  }

  if (filters.role !== undefined) {
    const normalizedRole = filters.role.trim();
    if (normalizedRole) {
      where.OR = [
        {
          title: {
            contains: normalizedRole,
            mode: "insensitive",
          },
        },
        {
          seniority: {
            contains: normalizedRole,
            mode: "insensitive",
          },
        },
        {
          department: {
            contains: normalizedRole,
            mode: "insensitive",
          },
        },
      ];
    }
  }

  if (filters.sourceRunId !== undefined) {
    const normalizedSourceRunId = filters.sourceRunId.trim();
    if (!normalizedSourceRunId) {
      throw new CandidateListValidationError("sourceRunId cannot be empty.");
    }
    where.sourceRunId = normalizedSourceRunId;
  }

  return where;
}

async function assertCampaignInWorkspace(input: {
  workspaceId: string;
  campaignId: string;
}) {
  const campaign = await prisma.campaign.findFirst({
    where: {
      id: input.campaignId,
      workspaceId: input.workspaceId,
    },
    select: {
      id: true,
    },
  });

  if (!campaign) {
    throw new CandidateListNotFoundError("Campaign not found.");
  }
}

async function assertSourceRunInWorkspaceCampaign(input: {
  workspaceId: string;
  campaignId: string;
  sourceRunId?: string;
}) {
  if (!input.sourceRunId) {
    return;
  }

  const sourceRun = await prisma.sourceRun.findFirst({
    where: {
      id: input.sourceRunId,
      workspaceId: input.workspaceId,
      campaignId: input.campaignId,
    },
    select: {
      id: true,
    },
  });

  if (!sourceRun) {
    throw new CandidateListNotFoundError("Source run not found.");
  }
}

function toCandidateListItem(candidate: {
  id: string;
  campaignId: string;
  sourceRunId: string;
  personProviderId: string | null;
  companyProviderId: string | null;
  email: string;
  firstName: string | null;
  lastName: string | null;
  title: string | null;
  seniority: string | null;
  department: string | null;
  companyName: string | null;
  companyDomain: string | null;
  companyWebsite: string | null;
  locationJson: unknown;
  confidenceScore: Prisma.Decimal | null;
  verificationStatus: CandidateVerificationStatus;
  status: CandidateStatus;
  createdAt: Date;
}): CampaignCandidateListItem {
  return {
    id: candidate.id,
    campaignId: candidate.campaignId,
    sourceRunId: candidate.sourceRunId,
    personProviderId: candidate.personProviderId,
    companyProviderId: candidate.companyProviderId,
    email: candidate.email,
    firstName: candidate.firstName,
    lastName: candidate.lastName,
    title: candidate.title,
    seniority: candidate.seniority,
    department: candidate.department,
    companyName: candidate.companyName,
    companyDomain: candidate.companyDomain,
    companyWebsite: candidate.companyWebsite,
    locationJson: candidate.locationJson,
    confidenceScore: candidate.confidenceScore ? Number(candidate.confidenceScore) : null,
    verificationStatus: candidate.verificationStatus,
    status: candidate.status,
    createdAt: candidate.createdAt,
  };
}

export async function listCampaignCandidatesForWorkspace(
  input: ListCampaignCandidatesInput,
): Promise<CampaignCandidateListPage> {
  const workspaceId = normalizeRequiredId(input.workspaceId, "workspaceId");
  const campaignId = normalizeRequiredId(input.campaignId, "campaignId");
  const pageSize = normalizePageSize(input.pageSize);
  const cursor = normalizeCursor(input.cursor);
  const filtersWhere = normalizeFilters(input.filters);

  await assertCampaignInWorkspace({
    workspaceId,
    campaignId,
  });
  await assertSourceRunInWorkspaceCampaign({
    workspaceId,
    campaignId,
    sourceRunId: input.filters?.sourceRunId,
  });

  const where: Prisma.CandidateWhereInput = {
    workspaceId,
    campaignId,
    ...filtersWhere,
  };

  if (cursor) {
    const cursorCandidate = await prisma.candidate.findFirst({
      where: {
        id: cursor,
        workspaceId,
        campaignId,
      },
      select: {
        id: true,
      },
    });

    if (!cursorCandidate) {
      throw new CandidateListValidationError("cursor is invalid.");
    }
  }

  const queryResult = await prisma.candidate.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: pageSize + 1,
    ...(cursor
      ? {
          cursor: {
            id: cursor,
          },
          skip: 1,
        }
      : {}),
    select: {
      id: true,
      campaignId: true,
      sourceRunId: true,
      personProviderId: true,
      companyProviderId: true,
      email: true,
      firstName: true,
      lastName: true,
      title: true,
      seniority: true,
      department: true,
      companyName: true,
      companyDomain: true,
      companyWebsite: true,
      locationJson: true,
      confidenceScore: true,
      verificationStatus: true,
      status: true,
      createdAt: true,
    },
  });

  const hasMore = queryResult.length > pageSize;
  const visibleItems = hasMore ? queryResult.slice(0, pageSize) : queryResult;

  return {
    items: visibleItems.map(toCandidateListItem),
    pageInfo: {
      hasMore,
      nextCursor: hasMore ? visibleItems[visibleItems.length - 1]?.id ?? null : null,
      pageSize,
    },
  };
}
