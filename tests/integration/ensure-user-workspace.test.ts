import assert from "node:assert/strict";
import test from "node:test";

import { ensureUserWorkspace } from "../../lib/auth/ensure-user-workspace";
import { prisma } from "../../lib/prisma";
import { canRunIntegrationDbTests, ensureIntegrationEnv } from "./test-env";

ensureIntegrationEnv();
const canRun = canRunIntegrationDbTests();

if (!canRun) {
  test("ensureUserWorkspace integration", { skip: "DATABASE_URL is missing or placeholder." }, () => {});
} else {
  test("creates a workspace on first login and reuses it on subsequent logins", async () => {
    const email = `workspace-autoprovision-${Date.now()}@example.com`;

    try {
      const firstResult = await ensureUserWorkspace({
        email,
        name: "Integration Operator",
      });

      const secondResult = await ensureUserWorkspace({
        email,
        name: "Integration Operator Updated",
      });

      assert.equal(firstResult.workspaceCreated, true);
      assert.equal(secondResult.workspaceCreated, false);
      assert.equal(firstResult.userId, secondResult.userId);
      assert.equal(firstResult.workspaceId, secondResult.workspaceId);

      const userCount = await prisma.user.count({ where: { email } });
      const workspaceCount = await prisma.workspace.count({
        where: { ownerId: firstResult.userId },
      });

      assert.equal(userCount, 1);
      assert.equal(workspaceCount, 1);
    } finally {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });

      if (user) {
        await prisma.workspace.deleteMany({ where: { ownerId: user.id } });
        await prisma.user.delete({ where: { id: user.id } });
      }
    }
  });
}

test.after(async () => {
  await prisma.$disconnect();
});
