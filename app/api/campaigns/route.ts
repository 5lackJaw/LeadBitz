import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import {
  CampaignValidationError,
  createCampaignForWorkspace,
  listCampaignsForWorkspace,
} from "@/lib/campaigns/campaign-crud";
import {
  PrimaryWorkspaceLookupError,
  getPrimaryWorkspaceForUserEmail,
} from "@/lib/auth/get-primary-workspace";

type CampaignPayload = {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

function toCampaignPayload(campaign: {
  id: string;
  name: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}): CampaignPayload {
  return {
    id: campaign.id,
    name: campaign.name,
    status: campaign.status,
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

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaceResult = await resolveSessionWorkspace(session.user.email);
  if (workspaceResult instanceof NextResponse) {
    return workspaceResult;
  }

  const campaigns = await listCampaignsForWorkspace(workspaceResult.workspaceId);

  return NextResponse.json({
    campaigns: campaigns.map(toCampaignPayload),
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaceResult = await resolveSessionWorkspace(session.user.email);
  if (workspaceResult instanceof NextResponse) {
    return workspaceResult;
  }

  let parsedBody: unknown;
  try {
    parsedBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!parsedBody || typeof parsedBody !== "object") {
    return NextResponse.json({ error: "Request body must be an object." }, { status: 400 });
  }

  const payload = parsedBody as Partial<{ name: string }>;

  try {
    const campaign = await createCampaignForWorkspace({
      workspaceId: workspaceResult.workspaceId,
      name: payload.name ?? "",
    });

    return NextResponse.json(
      {
        campaign: toCampaignPayload(campaign),
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof CampaignValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to create campaign." }, { status: 500 });
  }
}
