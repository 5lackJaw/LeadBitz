import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";

import { SignOutButton } from "./sign-out-button";

export default async function AppShellPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>LeadBitz App Shell</h1>
      <p>Signed in as {session.user.email}</p>
      <SignOutButton />
    </main>
  );
}
