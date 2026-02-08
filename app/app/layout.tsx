import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { getPrimaryWorkspaceForUserEmail } from "@/lib/auth/get-primary-workspace";

import { AppShell } from "./_components/app-shell";

type AppLayoutProps = {
  children: React.ReactNode;
};

export default async function AppLayout({ children }: AppLayoutProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const workspace = await getPrimaryWorkspaceForUserEmail(session.user.email).catch(() => null);
  const userDisplayName = session.user.name?.trim() || session.user.email;

  return (
    <AppShell
      userDisplayName={userDisplayName}
      userEmail={session.user.email}
      workspaceName={workspace?.workspaceName ?? null}
    >
      {children}
    </AppShell>
  );
}
