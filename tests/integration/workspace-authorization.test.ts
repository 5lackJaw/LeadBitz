import assert from "node:assert/strict";
import test from "node:test";

import { ensureUserWorkspace } from "../../lib/auth/ensure-user-workspace";
import {
  WorkspaceAuthorizationError,
  requireWorkspaceAccess,
} from "../../lib/auth/require-workspace-access";
import { prisma } from "../../lib/prisma";
import { canRunIntegrationDbTests, ensureIntegrationEnv } from "./test-env";

ensureIntegrationEnv();
const canRun = canRunIntegrationDbTests();

if (!canRun) {
  test(
    "workspace authorization integration",
    { skip: "DATABASE_URL is missing or placeholder." },
    () => {},
  );
} else {
  test("allows same-workspace access and blocks cross-workspace access", async () => {
    const ownerEmail = `workspace-owner-${Date.now()}@example.com`;
    const otherEmail = `workspace-other-${Date.now()}@example.com`;

    try {
      const ownerWorkspace = await ensureUserWorkspace({
        email: ownerEmail,
        name: "Owner User",
      });

      const otherWorkspace = await ensureUserWorkspace({
        email: otherEmail,
        name: "Other User",
      });

      const authorizedWorkspace = await requireWorkspaceAccess({
        workspaceId: ownerWorkspace.workspaceId,
        userEmail: ownerEmail,
      });

      assert.equal(authorizedWorkspace.workspaceId, ownerWorkspace.workspaceId);
      assert.equal(authorizedWorkspace.ownerUserId, ownerWorkspace.userId);

      await assert.rejects(
        () =>
          requireWorkspaceAccess({
            workspaceId: otherWorkspace.workspaceId,
            userEmail: ownerEmail,
          }),
        (error: unknown) => {
          assert.ok(error instanceof WorkspaceAuthorizationError);
          assert.equal(error.code, "FORBIDDEN");
          return true;
        },
      );
    } finally {
      const users = await prisma.user.findMany({
        where: {
          email: {
            in: [ownerEmail, otherEmail],
          },
        },
        select: { id: true },
      });

      const userIds = users.map((user) => user.id);

      if (userIds.length) {
        await prisma.workspace.deleteMany({
          where: {
            ownerId: {
              in: userIds,
            },
          },
        });

        await prisma.user.deleteMany({
          where: {
            id: {
              in: userIds,
            },
          },
        });
      }
    }
  });
}

test.after(async () => {
  await prisma.$disconnect();
});
