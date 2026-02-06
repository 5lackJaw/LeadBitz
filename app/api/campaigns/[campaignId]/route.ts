import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import {
  CampaignNotFoundError,
  CampaignValidationError,
  getCampaignOverviewForWorkspace,
  updateCampaignForWorkspace,
} from "@/lib/campaigns/campaign-crud";
import {
  PrimaryWorkspaceLookupError,
  getPrimaryWorkspaceForUserEmail,
} from "@/lib/auth/get-primary-workspace";

type RouteContext = {
  params: Promise<{
    campaignId: string;
  }>;
};

type CampaignPayload = {
  id: string;
  inboxConnectionId: string | null;
  name: string;
  status: string;
  messagingRules: string | null;
  discoveryRules: string | null;
  wizardState: unknown;
  icpProfileId: string | null;
  icpProfileName: string | null;
  inboxEmail: string | null;
  icpSummary: unknown;
  createdAt: string;
  updatedAt: string;
};

function toCampaignPayload(campaign: {
  id: string;
  inboxConnectionId: string | null;
  name: string;
  status: string;
  messagingRules: string | null;
  discoveryRules: string | null;
  wizardState: unknown;
  icpProfileId: string | null;
  icpProfileName: string | null;
  createdAt: Date;
  updatedAt: Date;
  inboxEmail?: string | null;
  icpSummary?: unknown;
}): CampaignPayload {
  return {
    id: campaign.id,
    inboxConnectionId: campaign.inboxConnectionId,
    name: campaign.name,
    status: campaign.status,
    messagingRules: campaign.messagingRules,
    discoveryRules: campaign.discoveryRules,
    wizardState: campaign.wizardState,
    icpProfileId: campaign.icpProfileId,
    icpProfileName: campaign.icpProfileName,
    inboxEmail: campaign.inboxEmail ?? null,
    icpSummary: campaign.icpSummary ?? null,
    createdAt: campaign.createdAt.toISOString(),
    updatedAt: campaign.updatedAt.toISOString(),
  };
}

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

export async function GET(_request: Request, context: RouteContext) {
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
    const campaign = await getCampaignOverviewForWorkspace({
      workspaceId: workspaceResult.workspaceId,
      campaignId,
    });

    return NextResponse.json({ campaign: toCampaignPayload(campaign) });
  } catch (error) {
    if (error instanceof CampaignNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ error: "Failed to load campaign." }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaceResult = await resolveSessionWorkspace(session.user.email);
  if (workspaceResult instanceof NextResponse) {
    return workspaceResult;
  }

  const { campaignId } = await context.params;

  let parsedBody: unknown;
  try {
    parsedBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!parsedBody || typeof parsedBody !== "object") {
    return NextResponse.json({ error: "Request body must be an object." }, { status: 400 });
  }

  const payload = parsedBody as Partial<{
    name: string;
    inboxConnectionId: string | null;
    messagingRules: string | null;
    discoveryRules: string | null;
    wizardState: unknown;
  }>;

  try {
    const campaign = await updateCampaignForWorkspace({
      workspaceId: workspaceResult.workspaceId,
      campaignId,
      name: payload.name,
      inboxConnectionId: payload.inboxConnectionId,
      messagingRules: payload.messagingRules,
      discoveryRules: payload.discoveryRules,
      wizardState: payload.wizardState as Prisma.InputJsonValue | null | undefined,
    });

    return NextResponse.json({
      campaign: toCampaignPayload(campaign),
    });
  } catch (error) {
    if (error instanceof CampaignValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof CampaignNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ error: "Failed to update campaign." }, { status: 500 });
  }
}
