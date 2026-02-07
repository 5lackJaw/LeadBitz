import { Prisma, SourceConnectorType } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const MAX_PROVIDER_KEY_LENGTH = 64;
const MAX_ALLOWED_USAGE_NOTE_LENGTH = 500;

export class SourceConnectorValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SourceConnectorValidationError";
  }
}

export class SourceConnectorNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SourceConnectorNotFoundError";
  }
}

export class SourceConnectorDisabledError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SourceConnectorDisabledError";
  }
}

function normalizeProviderKey(providerKey: string): string {
  return providerKey.trim().toLowerCase();
}

function normalizeAllowedUsageNote(allowedUsageNote?: string | null): string | null {
  if (allowedUsageNote == null) {
    return null;
  }

  const normalized = allowedUsageNote.trim();
  if (!normalized) {
    return null;
  }

  if (normalized.length > MAX_ALLOWED_USAGE_NOTE_LENGTH) {
    throw new SourceConnectorValidationError(
      `allowedUsageNote must be ${MAX_ALLOWED_USAGE_NOTE_LENGTH} characters or fewer.`,
    );
  }

  return normalized;
}

function normalizeConnectorType(type: string): SourceConnectorType {
  const normalized = type.trim().toUpperCase();

  if (normalized === SourceConnectorType.LICENSED_PROVIDER) {
    return SourceConnectorType.LICENSED_PROVIDER;
  }

  if (normalized === SourceConnectorType.CRM) {
    return SourceConnectorType.CRM;
  }

  if (normalized === "LICENSED_PROVIDER" || normalized === "LICENSED-PROVIDER") {
    return SourceConnectorType.LICENSED_PROVIDER;
  }

  throw new SourceConnectorValidationError("type must be LICENSED_PROVIDER or CRM.");
}

function validateConfigJson(
  configJson: unknown,
): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput {
  if (configJson === null) {
    return Prisma.JsonNull;
  }

  if (typeof configJson !== "object" || Array.isArray(configJson) || configJson === undefined) {
    throw new SourceConnectorValidationError("config must be an object when provided.");
  }

  return configJson as Prisma.InputJsonValue;
}

function validateProviderKey(providerKey: string): string {
  const normalized = normalizeProviderKey(providerKey);

  if (!normalized) {
    throw new SourceConnectorValidationError("providerKey is required.");
  }

  if (normalized.length > MAX_PROVIDER_KEY_LENGTH) {
    throw new SourceConnectorValidationError(
      `providerKey must be ${MAX_PROVIDER_KEY_LENGTH} characters or fewer.`,
    );
  }

  return normalized;
}

export type SourceConnectorSummary = {
  id: string;
  workspaceId: string;
  type: SourceConnectorType;
  providerKey: string;
  enabled: boolean;
  configJson: unknown;
  allowedUsageNote: string | null;
  lastHealthcheckAt: Date | null;
  lastErrorCode: string | null;
  lastErrorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export async function listSourceConnectorsForWorkspace(
  workspaceId: string,
): Promise<SourceConnectorSummary[]> {
  return prisma.sourceConnector.findMany({
    where: {
      workspaceId,
    },
    orderBy: [{ createdAt: "desc" }],
  });
}

export async function createSourceConnectorForWorkspace(input: {
  workspaceId: string;
  type: string;
  providerKey: string;
  config?: unknown;
  allowedUsageNote?: string | null;
}) {
  const normalizedType = normalizeConnectorType(input.type);
  const normalizedProviderKey = validateProviderKey(input.providerKey);
  const normalizedAllowedUsageNote = normalizeAllowedUsageNote(input.allowedUsageNote);

  return prisma.sourceConnector.create({
    data: {
      workspaceId: input.workspaceId,
      type: normalizedType,
      providerKey: normalizedProviderKey,
      ...(input.config !== undefined ? { configJson: validateConfigJson(input.config) } : {}),
      allowedUsageNote: normalizedAllowedUsageNote,
      enabled: true,
    },
  });
}

export async function updateSourceConnectorForWorkspace(input: {
  workspaceId: string;
  sourceConnectorId: string;
  type?: string;
  providerKey?: string;
  config?: unknown;
  allowedUsageNote?: string | null;
  enabled?: boolean;
}) {
  const existing = await prisma.sourceConnector.findFirst({
    where: {
      id: input.sourceConnectorId,
      workspaceId: input.workspaceId,
    },
    select: {
      id: true,
    },
  });

  if (!existing) {
    throw new SourceConnectorNotFoundError("Source connector was not found.");
  }

  const data: {
    type?: SourceConnectorType;
    providerKey?: string;
    configJson?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
    allowedUsageNote?: string | null;
    enabled?: boolean;
  } = {};

  if (input.type !== undefined) {
    data.type = normalizeConnectorType(input.type);
  }

  if (input.providerKey !== undefined) {
    data.providerKey = validateProviderKey(input.providerKey);
  }

  if (input.config !== undefined) {
    data.configJson = validateConfigJson(input.config);
  }

  if (input.allowedUsageNote !== undefined) {
    data.allowedUsageNote = normalizeAllowedUsageNote(input.allowedUsageNote);
  }

  if (input.enabled !== undefined) {
    data.enabled = input.enabled;
  }

  return prisma.sourceConnector.update({
    where: {
      id: existing.id,
    },
    data,
  });
}

export async function assertSourceConnectorEnabledForWorkspace(input: {
  workspaceId: string;
  sourceConnectorId: string;
}) {
  const connector = await prisma.sourceConnector.findFirst({
    where: {
      id: input.sourceConnectorId,
      workspaceId: input.workspaceId,
    },
    select: {
      id: true,
      enabled: true,
    },
  });

  if (!connector) {
    throw new SourceConnectorNotFoundError("Source connector was not found.");
  }

  if (!connector.enabled) {
    throw new SourceConnectorDisabledError(
      "Source connector is disabled. Enable it before creating a discovery run.",
    );
  }

  return connector;
}
