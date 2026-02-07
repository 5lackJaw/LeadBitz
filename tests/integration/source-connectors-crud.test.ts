import assert from "node:assert/strict";
import test from "node:test";

import { ensureUserWorkspace } from "../../lib/auth/ensure-user-workspace";
import { prisma } from "../../lib/prisma";
import {
  SourceConnectorDisabledError,
  SourceConnectorNotFoundError,
  SourceConnectorValidationError,
  assertSourceConnectorEnabledForWorkspace,
  createSourceConnectorForWorkspace,
  listSourceConnectorsForWorkspace,
  updateSourceConnectorForWorkspace,
} from "../../lib/sources/source-connectors";
import { canRunIntegrationDbTests, ensureIntegrationEnv } from "./test-env";

ensureIntegrationEnv();
const canRun = canRunIntegrationDbTests();

if (!canRun) {
  test("source connector CRUD integration", { skip: "DATABASE_URL is missing or placeholder." }, () => {});
} else {
  test("creates and updates source connectors, and disabled connectors are blocked", async () => {
    const ownerEmail = `source-owner-${Date.now()}@example.com`;
    const otherEmail = `source-other-${Date.now()}@example.com`;

    try {
      const ownerWorkspace = await ensureUserWorkspace({
        email: ownerEmail,
        name: "Source Owner",
      });
      const otherWorkspace = await ensureUserWorkspace({
        email: otherEmail,
        name: "Source Other",
      });

      await assert.rejects(
        () =>
          createSourceConnectorForWorkspace({
            workspaceId: ownerWorkspace.workspaceId,
            type: "invalid",
            providerKey: "pdl",
          }),
        (error: unknown) => {
          assert.ok(error instanceof SourceConnectorValidationError);
          return true;
        },
      );

      const createdConnector = await createSourceConnectorForWorkspace({
        workspaceId: ownerWorkspace.workspaceId,
        type: "licensed_provider",
        providerKey: "PDL",
        config: { apiKeyRef: "vercel_env:PDR_KEY" },
        allowedUsageNote: "Only compliant B2B enrichment and discovery.",
      });

      assert.equal(createdConnector.type, "LICENSED_PROVIDER");
      assert.equal(createdConnector.providerKey, "pdl");
      assert.equal(createdConnector.enabled, true);

      const listed = await listSourceConnectorsForWorkspace(ownerWorkspace.workspaceId);
      assert.equal(listed.length, 1);
      assert.equal(listed[0]?.id, createdConnector.id);

      await assert.doesNotReject(() =>
        assertSourceConnectorEnabledForWorkspace({
          workspaceId: ownerWorkspace.workspaceId,
          sourceConnectorId: createdConnector.id,
        }),
      );

      const disabledConnector = await updateSourceConnectorForWorkspace({
        workspaceId: ownerWorkspace.workspaceId,
        sourceConnectorId: createdConnector.id,
        enabled: false,
      });

      assert.equal(disabledConnector.enabled, false);

      await assert.rejects(
        () =>
          assertSourceConnectorEnabledForWorkspace({
            workspaceId: ownerWorkspace.workspaceId,
            sourceConnectorId: createdConnector.id,
          }),
        (error: unknown) => {
          assert.ok(error instanceof SourceConnectorDisabledError);
          return true;
        },
      );

      await assert.rejects(
        () =>
          updateSourceConnectorForWorkspace({
            workspaceId: otherWorkspace.workspaceId,
            sourceConnectorId: createdConnector.id,
            enabled: true,
          }),
        (error: unknown) => {
          assert.ok(error instanceof SourceConnectorNotFoundError);
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
        select: {
          id: true,
        },
      });

      const userIds = users.map((user) => user.id);

      if (userIds.length > 0) {
        await prisma.sourceConnector.deleteMany({
          where: {
            workspace: {
              is: {
                ownerId: {
                  in: userIds,
                },
              },
            },
          },
        });

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
