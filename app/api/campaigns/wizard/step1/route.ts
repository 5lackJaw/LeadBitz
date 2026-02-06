import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import { validateWizardStep1Input, WizardStep1ValidationError } from "@/lib/campaigns/wizard-step1";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
  }>;

  try {
    const validated = validateWizardStep1Input({
      websiteUrl: payload.websiteUrl,
      productDescription: payload.productDescription,
    });

    return NextResponse.json({
      sourceType: validated.sourceType,
      websiteUrl: validated.websiteUrl,
      productDescription: validated.productDescription,
      nextStep: "icp",
    });
  } catch (error) {
    if (error instanceof WizardStep1ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to validate Step 1 input." }, { status: 500 });
  }
}
