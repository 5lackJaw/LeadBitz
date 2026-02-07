import assert from "node:assert/strict";
import test from "node:test";

import { ensureUserWorkspace } from "../../lib/auth/ensure-user-workspace";
import { createCampaignForWorkspace } from "../../lib/campaigns/campaign-crud";
import { prisma } from "../../lib/prisma";
import { createSourceConnectorForWorkspace, updateSourceConnectorForWorkspace } from "../../lib/sources/source-connectors";
import {
  SourceConnectorDisabledError,
  SourceRunNotFoundError,
  SourceRunValidationError,
  createDiscoveryRunForWorkspace,
} from "../../lib/sources/source-runs";
import { canRunIntegrationDbTests, ensureIntegrationEnv } from "./test-env";

ensureIntegrationEnv();
const canRun = canRunIntegrationDbTests();

if (!canRun) {
  test("discovery run create integration", { skip: "DATABASE_URL is missing or placeholder." }, () => {});
} else {
  test("creates queued discovery runs and enforces enabled connector validation", async () => {
    const ownerEmail = `source-run-owner-${Date.now()}@example.com`;
    const otherEmail = `source-run-other-${Date.now()}@example.com`;

    try {
      const ownerWorkspace = await ensureUserWorkspace({
        email: ownerEmail,
        name: "Source Run Owner",
      });
      const otherWorkspace = await ensureUserWorkspace({
        email: otherEmail,
        name: "Source Run Other",
      });

      const campaign = await createCampaignForWorkspace({
        workspaceId: ownerWorkspace.workspaceId,
        name: "Discovery Run Campaign",
      });

      const connector = await createSourceConnectorForWorkspace({
        workspaceId: ownerWorkspace.workspaceId,
        type: "LICENSED_PROVIDER",
        providerKey: "pdl",
        config: { apiKeyRef: "vercel_env:PDL_API_KEY" },
      });

      await assert.rejects(
        () =>
          createDiscoveryRunForWorkspace({
            workspaceId: ownerWorkspace.workspaceId,
            campaignId: campaign.id,
            connectorId: connector.id,
            filters: { industry: ["B2B SaaS"] },
            limit: 0,
          }),
        (error: unknown) => {
          assert.ok(error instanceof SourceRunValidationError);
          return true;
        },
      );

      const sourceRun = await createDiscoveryRunForWorkspace({
        workspaceId: ownerWorkspace.workspaceId,
        campaignId: campaign.id,
        connectorId: connector.id,
        filters: {
          industry: ["B2B SaaS"],
          geoCountry: ["US"],
        },
        limit: 250,
        runLabel: "Initial seed run",
      });

      assert.equal(sourceRun.status, "QUEUED");
      assert.equal(sourceRun.campaignId, campaign.id);
      assert.equal(sourceRun.connectorId, connector.id);
      assert.equal(sourceRun.runLabel, "Initial seed run");
      assert.deepEqual(sourceRun.queryJson, {
        filters: {
          industry: ["B2B SaaS"],
          geoCountry: ["US"],
        },
        limit: 250,
      });

      await assert.rejects(
        () =>
          createDiscoveryRunForWorkspace({
            workspaceId: otherWorkspace.workspaceId,
            campaignId: campaign.id,
            connectorId: connector.id,
          }),
        (error: unknown) => {
          assert.ok(error instanceof SourceRunNotFoundError);
          return true;
        },
      );

      await updateSourceConnectorForWorkspace({
        workspaceId: ownerWorkspace.workspaceId,
        sourceConnectorId: connector.id,
        enabled: false,
      });

      await assert.rejects(
        () =>
          createDiscoveryRunForWorkspace({
            workspaceId: ownerWorkspace.workspaceId,
            campaignId: campaign.id,
            connectorId: connector.id,
          }),
        (error: unknown) => {
          assert.ok(error instanceof SourceConnectorDisabledError);
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
        await prisma.sourceRun.deleteMany({
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

        await prisma.campaign.deleteMany({
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
