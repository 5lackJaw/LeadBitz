import { prisma } from "../prisma";

export class PrimaryWorkspaceLookupError extends Error {
  code: "UNAUTHENTICATED" | "NOT_FOUND";

  constructor(code: "UNAUTHENTICATED" | "NOT_FOUND", message: string) {
    super(message);
    this.name = "PrimaryWorkspaceLookupError";
    this.code = code;
  }
}

type PrimaryWorkspace = {
  userId: string;
  workspaceId: string;
  workspaceName: string;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function getPrimaryWorkspaceForUserEmail(
  userEmail?: string | null,
): Promise<PrimaryWorkspace> {
  const rawEmail = userEmail?.trim() ?? "";

  if (!rawEmail) {
    throw new PrimaryWorkspaceLookupError("UNAUTHENTICATED", "Session user email is required.");
  }

  const email = normalizeEmail(rawEmail);

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!user) {
    throw new PrimaryWorkspaceLookupError("NOT_FOUND", "User record was not found.");
  }

  const workspace = await prisma.workspace.findFirst({
    where: { ownerId: user.id },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true },
  });

  if (!workspace) {
    throw new PrimaryWorkspaceLookupError("NOT_FOUND", "Workspace was not found.");
  }

  return {
    userId: user.id,
    workspaceId: workspace.id,
    workspaceName: workspace.name,
  };
}
