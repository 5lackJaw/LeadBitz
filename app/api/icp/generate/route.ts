import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import {
  PrimaryWorkspaceLookupError,
  getPrimaryWorkspaceForUserEmail,
} from "@/lib/auth/get-primary-workspace";
import {
  IcpGenerationNotFoundError,
  IcpGenerationValidationError,
  generateIcpProfileForWorkspace,
} from "@/lib/icp/generate-icp-profile";
import { validateWizardStep1Input, WizardStep1ValidationError } from "@/lib/campaigns/wizard-step1";

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

  const payload = parsedBody as Partial<{
    websiteUrl: string;
    productDescription: string;
    campaignId: string;
    profileName: string;
  }>;

  try {
    const validatedStep1Input = validateWizardStep1Input({
      websiteUrl: payload.websiteUrl,
      productDescription: payload.productDescription,
    });

    const sourceValue = validatedStep1Input.websiteUrl ?? validatedStep1Input.productDescription ?? "";

    const generated = await generateIcpProfileForWorkspace({
      workspaceId: workspaceResult.workspaceId,
      sourceType: validatedStep1Input.sourceType,
      sourceValue,
      campaignId: payload.campaignId,
      profileName: payload.profileName,
    });

    return NextResponse.json(
      {
        icpProfileId: generated.icpProfileId,
        icp: generated.icp,
        sourceType: validatedStep1Input.sourceType,
        sourceValue,
        campaignId: generated.campaignId,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof WizardStep1ValidationError || error instanceof IcpGenerationValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof IcpGenerationNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ error: "Failed to generate ICP profile." }, { status: 500 });
  }
}
