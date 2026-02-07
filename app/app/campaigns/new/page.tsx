import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { getPrimaryWorkspaceForUserEmail } from "@/lib/auth/get-primary-workspace";
import { getCampaignOverviewForWorkspace } from "@/lib/campaigns/campaign-crud";

import { WizardStep1Form } from "./wizard-step1-form";

type CampaignWizardStep1PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSingleParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string | null {
  const value = params[key];
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value) && value.length > 0) {
    return value[0] ?? null;
  }

  return null;
}

type WizardInitialState = {
  websiteUrl?: string;
  productDescription?: string;
  profileName?: string;
  generatedIcpProfileId?: string | null;
  icpEditorState?: {
    targetIndustries: string;
    companySizeBands: string;
    buyerRoles: string;
    pains: string;
    exclusions: string;
    valuePropAngles: string;
    sourceSummary: string;
  } | null;
};

export default async function CampaignWizardStep1Page({ searchParams }: CampaignWizardStep1PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const workspace = await getPrimaryWorkspaceForUserEmail(session.user.email);
  const params = searchParams ? await searchParams : {};
  const campaignId = getSingleParam(params, "campaignId");

  let initialState: WizardInitialState | undefined = undefined;
  if (campaignId) {
    const campaign = await getCampaignOverviewForWorkspace({
      workspaceId: workspace.workspaceId,
      campaignId,
    });

    if (campaign.wizardState && typeof campaign.wizardState === "object") {
      initialState = campaign.wizardState as WizardInitialState;
    }
  }

  return (
    <main className="lb-page">
      <section className="lb-container">
        <header className="lb-row">
          <div>
            <h1 className="lb-title">Campaign Wizard</h1>
            <p className="lb-subtitle">Step 1 of 5: input source</p>
            <p className="lb-subtitle">Workspace: {workspace.workspaceName}</p>
            {campaignId ? <p className="lb-subtitle">Campaign resume mode enabled.</p> : null}
          </div>
          <div className="lb-row" style={{ justifyContent: "flex-end", gap: "12px" }}>
            <Link href="/app/campaigns" className="lb-link">
              Back to campaigns
            </Link>
          </div>
        </header>

        <WizardStep1Form campaignId={campaignId} initialState={initialState} />
      </section>
    </main>
  );
}
