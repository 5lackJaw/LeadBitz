import { InboxProvider } from "@prisma/client";

import { prisma } from "../prisma";

export type InboxSendingSettingsInput = {
  dailySendCap: number;
  sendWindowStartHour: number;
  sendWindowEndHour: number;
  rampUpPerDay: number;
};

export class InboxSettingsValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InboxSettingsValidationError";
  }
}

function validateInteger(value: number, name: string): number {
  if (!Number.isInteger(value)) {
    throw new InboxSettingsValidationError(`${name} must be an integer.`);
  }

  return value;
}

export function validateInboxSendingSettings(
  input: InboxSendingSettingsInput,
): InboxSendingSettingsInput {
  const dailySendCap = validateInteger(input.dailySendCap, "dailySendCap");
  const sendWindowStartHour = validateInteger(input.sendWindowStartHour, "sendWindowStartHour");
  const sendWindowEndHour = validateInteger(input.sendWindowEndHour, "sendWindowEndHour");
  const rampUpPerDay = validateInteger(input.rampUpPerDay, "rampUpPerDay");

  if (dailySendCap < 1 || dailySendCap > 500) {
    throw new InboxSettingsValidationError("dailySendCap must be between 1 and 500.");
  }

  if (sendWindowStartHour < 0 || sendWindowStartHour > 23) {
    throw new InboxSettingsValidationError("sendWindowStartHour must be between 0 and 23.");
  }

  if (sendWindowEndHour < 1 || sendWindowEndHour > 24) {
    throw new InboxSettingsValidationError("sendWindowEndHour must be between 1 and 24.");
  }

  if (sendWindowStartHour >= sendWindowEndHour) {
    throw new InboxSettingsValidationError(
      "sendWindowStartHour must be less than sendWindowEndHour.",
    );
  }

  if (rampUpPerDay < 1 || rampUpPerDay > 100) {
    throw new InboxSettingsValidationError("rampUpPerDay must be between 1 and 100.");
  }

  return {
    dailySendCap,
    sendWindowStartHour,
    sendWindowEndHour,
    rampUpPerDay,
  };
}

type UpdateInboxSendingSettingsInput = InboxSendingSettingsInput & {
  inboxConnectionId: string;
};

export async function updateInboxSendingSettings(input: UpdateInboxSendingSettingsInput) {
  const inboxConnectionId = input.inboxConnectionId.trim();

  if (!inboxConnectionId) {
    throw new InboxSettingsValidationError("inboxConnectionId is required.");
  }

  const settings = validateInboxSendingSettings(input);

  const existingConnection = await prisma.inboxConnection.findUnique({
    where: {
      id: inboxConnectionId,
    },
    select: {
      id: true,
      provider: true,
      workspaceId: true,
    },
  });

  if (!existingConnection) {
    throw new InboxSettingsValidationError("Inbox connection was not found.");
  }

  if (existingConnection.provider !== InboxProvider.GMAIL) {
    throw new InboxSettingsValidationError("Only Gmail inbox settings are supported in this flow.");
  }

  return prisma.inboxConnection.update({
    where: {
      id: inboxConnectionId,
    },
    data: {
      dailySendCap: settings.dailySendCap,
      sendWindowStartHour: settings.sendWindowStartHour,
      sendWindowEndHour: settings.sendWindowEndHour,
      rampUpPerDay: settings.rampUpPerDay,
    },
    select: {
      id: true,
      provider: true,
      workspaceId: true,
      dailySendCap: true,
      sendWindowStartHour: true,
      sendWindowEndHour: true,
      rampUpPerDay: true,
    },
  });
}
