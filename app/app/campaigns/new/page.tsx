import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { getPrimaryWorkspaceForUserEmail } from "@/lib/auth/get-primary-workspace";

import { WizardStep1Form } from "./wizard-step1-form";

export default async function CampaignWizardStep1Page() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const workspace = await getPrimaryWorkspaceForUserEmail(session.user.email);

  return (
    <main className="lb-page">
      <section className="lb-container">
        <header className="lb-row">
          <div>
            <h1 className="lb-title">Campaign Wizard</h1>
            <p className="lb-subtitle">Step 1 of 5: input source</p>
            <p className="lb-subtitle">Workspace: {workspace.workspaceName}</p>
          </div>
          <div className="lb-row" style={{ justifyContent: "flex-end", gap: "12px" }}>
            <Link href="/app/campaigns" className="lb-link">
              Back to campaigns
            </Link>
          </div>
        </header>

        <WizardStep1Form />
      </section>
    </main>
  );
}
