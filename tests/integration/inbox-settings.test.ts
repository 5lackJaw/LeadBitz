import assert from "node:assert/strict";
import test from "node:test";

import { InboxConnectionStatus, InboxProvider } from "@prisma/client";

import { ensureUserWorkspace } from "../../lib/auth/ensure-user-workspace";
import {
  InboxSettingsValidationError,
  updateInboxSendingSettings,
} from "../../lib/inbox/inbox-settings";
import { prisma } from "../../lib/prisma";
import { canRunIntegrationDbTests, ensureIntegrationEnv } from "./test-env";

ensureIntegrationEnv();
const canRun = canRunIntegrationDbTests();

if (!canRun) {
  test("inbox settings integration", { skip: "DATABASE_URL is missing or placeholder." }, () => {});
} else {
  test("persists inbox sending settings updates", async () => {
    const userEmail = `inbox-settings-${Date.now()}@example.com`;

    try {
      const workspace = await ensureUserWorkspace({
        email: userEmail,
        name: "Inbox Settings User",
      });

      const connection = await prisma.inboxConnection.create({
        data: {
          workspaceId: workspace.workspaceId,
          provider: InboxProvider.GMAIL,
          providerAccountId: `gmail-settings-${Date.now()}`,
          email: "settings-user@example.com",
          status: InboxConnectionStatus.ACTIVE,
        },
        select: { id: true },
      });

      const updated = await updateInboxSendingSettings({
        inboxConnectionId: connection.id,
        dailySendCap: 75,
        sendWindowStartHour: 8,
        sendWindowEndHour: 18,
        rampUpPerDay: 12,
      });

      assert.equal(updated.dailySendCap, 75);
      assert.equal(updated.sendWindowStartHour, 8);
      assert.equal(updated.sendWindowEndHour, 18);
      assert.equal(updated.rampUpPerDay, 12);

      await assert.rejects(
        () =>
          updateInboxSendingSettings({
            inboxConnectionId: connection.id,
            dailySendCap: 10,
            sendWindowStartHour: 19,
            sendWindowEndHour: 18,
            rampUpPerDay: 5,
          }),
        (error: unknown) => {
          assert.ok(error instanceof InboxSettingsValidationError);
          return true;
        },
      );
    } finally {
      const user = await prisma.user.findUnique({
        where: {
          email: userEmail,
        },
        select: { id: true },
      });

      if (user) {
        await prisma.inboxConnection.deleteMany({
          where: {
            workspace: {
              is: {
                ownerId: user.id,
              },
            },
          },
        });
        await prisma.workspace.deleteMany({
          where: {
            ownerId: user.id,
          },
        });
        await prisma.user.delete({
          where: {
            id: user.id,
          },
        });
      }
    }
  });
}

test.after(async () => {
  await prisma.$disconnect();
});
