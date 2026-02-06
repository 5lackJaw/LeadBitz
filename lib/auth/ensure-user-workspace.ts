import { prisma } from "../prisma";

type EnsureUserWorkspaceInput = {
  email: string;
  name?: string | null;
};

type EnsureUserWorkspaceResult = {
  userId: string;
  workspaceId: string;
  workspaceCreated: boolean;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function buildWorkspaceName(name: string | null | undefined, email: string): string {
  const trimmedName = name?.trim();

  if (trimmedName) {
    return `${trimmedName}'s Workspace`;
  }

  const emailPrefix = email.split("@")[0]?.trim();

  if (emailPrefix) {
    return `${emailPrefix}'s Workspace`;
  }

  return "LeadBitz Workspace";
}

export async function ensureUserWorkspace(
  input: EnsureUserWorkspaceInput,
): Promise<EnsureUserWorkspaceResult> {
  const email = normalizeEmail(input.email);

  if (!email) {
    throw new Error("Cannot provision workspace without an email.");
  }

  const normalizedName = input.name?.trim() || null;

  const user = await prisma.user.upsert({
    where: { email },
    update: normalizedName ? { name: normalizedName } : {},
    create: {
      email,
      name: normalizedName,
    },
    select: {
      id: true,
    },
  });

  const existingWorkspace = await prisma.workspace.findFirst({
    where: { ownerId: user.id },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  if (existingWorkspace) {
    return {
      userId: user.id,
      workspaceId: existingWorkspace.id,
      workspaceCreated: false,
    };
  }

  const createdWorkspace = await prisma.workspace.create({
    data: {
      ownerId: user.id,
      name: buildWorkspaceName(normalizedName, email),
    },
    select: { id: true },
  });

  return {
    userId: user.id,
    workspaceId: createdWorkspace.id,
    workspaceCreated: true,
  };
}
