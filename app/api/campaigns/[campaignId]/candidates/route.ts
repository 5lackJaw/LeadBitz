import { CandidateVerificationStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import {
  PrimaryWorkspaceLookupError,
  getPrimaryWorkspaceForUserEmail,
} from "@/lib/auth/get-primary-workspace";
import {
  CandidateListNotFoundError,
  CandidateListValidationError,
  listCampaignCandidatesForWorkspace,
} from "@/lib/sources/candidates";

type RouteContext = {
  params: Promise<{
    campaignId: string;
  }>;
};

type CandidatePayload = {
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
  location: unknown;
  confidenceScore: number | null;
  verificationStatus: string;
  status: string;
  createdAt: string;
};

async function resolveSessionWorkspace(userEmail: string) {
  try {
    return await getPrimaryWorkspaceForUserEmail(userEmail);
  } catch (error) {
    if (error instanceof PrimaryWorkspaceLookupError) {
      if (error.code === "UNAUTHENTICATED") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      return NextResponse.json({ error: "Workspace not found." }, { status: 404 });
    }

    return NextResponse.json({ error: "Failed to resolve workspace." }, { status: 500 });
  }
}

function parseQueryParams(request: Request) {
  const searchParams = new URL(request.url).searchParams;

  const verificationStatusRaw = searchParams.get("verificationStatus");
  const verificationStatus = verificationStatusRaw ? verificationStatusRaw.trim().toUpperCase() : undefined;
  if (verificationStatus && !(verificationStatus in CandidateVerificationStatus)) {
    throw new CandidateListValidationError(
      "verificationStatus must be one of VERIFIED, RISKY, INVALID, UNKNOWN.",
    );
  }

  const confidenceMinRaw = searchParams.get("confidenceMin");
  const confidenceMin =
    confidenceMinRaw && confidenceMinRaw.trim().length > 0 ? Number.parseFloat(confidenceMinRaw) : undefined;
  if (confidenceMinRaw && confidenceMinRaw.trim().length > 0 && Number.isNaN(confidenceMin)) {
    throw new CandidateListValidationError("confidenceMin must be a number between 0 and 1.");
  }

  const pageSizeRaw = searchParams.get("pageSize");
  const pageSize = pageSizeRaw && pageSizeRaw.trim().length > 0 ? Number.parseInt(pageSizeRaw, 10) : undefined;
  if (pageSizeRaw && pageSizeRaw.trim().length > 0 && Number.isNaN(pageSize)) {
    throw new CandidateListValidationError("pageSize must be an integer.");
  }

  return {
    verificationStatus: verificationStatus as CandidateVerificationStatus | undefined,
    confidenceMin,
    role: searchParams.get("role") ?? undefined,
    sourceRunId: searchParams.get("sourceRunId") ?? undefined,
    pageSize,
    cursor: searchParams.get("cursor") ?? undefined,
  };
}

function toCandidatePayload(candidate: {
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
  verificationStatus: string;
  status: string;
  createdAt: Date;
}): CandidatePayload {
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
    location: candidate.locationJson,
    confidenceScore: candidate.confidenceScore,
    verificationStatus: candidate.verificationStatus,
    status: candidate.status,
    createdAt: candidate.createdAt.toISOString(),
  };
}

export async function GET(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaceResult = await resolveSessionWorkspace(session.user.email);
  if (workspaceResult instanceof NextResponse) {
    return workspaceResult;
  }

  const { campaignId } = await context.params;

  try {
    const query = parseQueryParams(request);
    const page = await listCampaignCandidatesForWorkspace({
      workspaceId: workspaceResult.workspaceId,
      campaignId,
      filters: {
        verificationStatus: query.verificationStatus,
        confidenceMin: query.confidenceMin,
        role: query.role,
        sourceRunId: query.sourceRunId,
      },
      pageSize: query.pageSize,
      cursor: query.cursor,
    });

    return NextResponse.json({
      items: page.items.map(toCandidatePayload),
      pageInfo: page.pageInfo,
    });
  } catch (error) {
    if (error instanceof CandidateListValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof CandidateListNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ error: "Failed to list candidates." }, { status: 500 });
  }
}
