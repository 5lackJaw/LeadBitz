import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { getPrimaryWorkspaceForUserEmail } from "@/lib/auth/get-primary-workspace";

const SETTINGS_SECTIONS = [
  {
    href: "/app/settings/inboxes",
    label: "Inbox settings",
    description: "Connect inboxes and update sending limits.",
  },
  {
    href: "/app/settings/sources",
    label: "Sources registry",
    description: "Manage licensed source connectors and enablement.",
  },
];

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const workspace = await getPrimaryWorkspaceForUserEmail(session.user.email);

  return (
    <section className="lb-shell-stack">
      <section className="lb-panel">
        <h1 className="lb-title">Settings</h1>
        <p className="lb-subtitle">Workspace: {workspace.workspaceName}</p>
      </section>

      <section className="lb-settings-card-grid">
        {SETTINGS_SECTIONS.map((section) => (
          <article className="lb-panel" key={section.href}>
            <h2 className="lb-title" style={{ fontSize: "20px", lineHeight: "28px" }}>
              {section.label}
            </h2>
            <p className="lb-subtitle">{section.description}</p>
            <Link className="lb-link lb-link-accent" href={section.href}>
              Open
            </Link>
          </article>
        ))}
      </section>
    </section>
  );
}
