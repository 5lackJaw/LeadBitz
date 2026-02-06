import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import { ensureUserWorkspace } from "../../lib/auth/ensure-user-workspace";
import { prisma } from "../../lib/prisma";

function maybeLoadLocalEnvFile() {
  if (process.env.DATABASE_URL) {
    return;
  }

  const envPath = path.join(process.cwd(), ".env.local");

  if (!fs.existsSync(envPath)) {
    return;
  }

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    if (!key || process.env[key]) {
      continue;
    }

    let value = trimmed.slice(separatorIndex + 1).trim();
    value = value.replace(/^['"]|['"]$/g, "");
    process.env[key] = value;
  }
}

maybeLoadLocalEnvFile();

const databaseUrl = process.env.DATABASE_URL ?? "";
const looksLikePlaceholder = databaseUrl.includes("johndoe");
const canRun = Boolean(databaseUrl) && !looksLikePlaceholder;

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
