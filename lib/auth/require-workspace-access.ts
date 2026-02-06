import { prisma } from "../prisma";

export type WorkspaceAuthorizationErrorCode = "UNAUTHENTICATED" | "NOT_FOUND" | "FORBIDDEN";

export class WorkspaceAuthorizationError extends Error {
  code: WorkspaceAuthorizationErrorCode;

  constructor(code: WorkspaceAuthorizationErrorCode, message: string) {
    super(message);
    this.name = "WorkspaceAuthorizationError";
    this.code = code;
  }
}

type RequireWorkspaceAccessInput = {
  workspaceId: string;
  userEmail?: string | null;
};

type AuthorizedWorkspace = {
  workspaceId: string;
  workspaceName: string;
  ownerUserId: string;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function requireWorkspaceAccess(
  input: RequireWorkspaceAccessInput,
): Promise<AuthorizedWorkspace> {
  const rawEmail = input.userEmail?.trim() ?? "";

  if (!rawEmail) {
    throw new WorkspaceAuthorizationError("UNAUTHENTICATED", "Session user email is required.");
  }

  const workspaceId = input.workspaceId.trim();

  if (!workspaceId) {
    throw new WorkspaceAuthorizationError("NOT_FOUND", "Workspace id is required.");
  }

  const user = await prisma.user.findUnique({
    where: {
      email: normalizeEmail(rawEmail),
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    throw new WorkspaceAuthorizationError("UNAUTHENTICATED", "User record does not exist.");
  }

  const workspace = await prisma.workspace.findUnique({
    where: {
      id: workspaceId,
    },
    select: {
      id: true,
      name: true,
      ownerId: true,
    },
  });

  if (!workspace) {
    throw new WorkspaceAuthorizationError("NOT_FOUND", "Workspace was not found.");
  }

  if (workspace.ownerId !== user.id) {
    throw new WorkspaceAuthorizationError(
      "FORBIDDEN",
      "User is not authorized to access this workspace.",
    );
  }

  return {
    workspaceId: workspace.id,
    workspaceName: workspace.name,
    ownerUserId: workspace.ownerId,
  };
}
