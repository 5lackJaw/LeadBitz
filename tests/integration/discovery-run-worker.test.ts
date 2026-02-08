import assert from "node:assert/strict";
import test from "node:test";

import { ensureUserWorkspace } from "../../lib/auth/ensure-user-workspace";
import { createCampaignForWorkspace } from "../../lib/campaigns/campaign-crud";
import { prisma } from "../../lib/prisma";
import { executeDiscoveryRun } from "../../lib/sources/discovery-run-worker";
import { createSourceConnectorForWorkspace } from "../../lib/sources/source-connectors";
import { createDiscoveryRunForWorkspace } from "../../lib/sources/source-runs";
import { canRunIntegrationDbTests, ensureIntegrationEnv } from "./test-env";

ensureIntegrationEnv();
const canRun = canRunIntegrationDbTests();

if (!canRun) {
  test("discovery run worker integration", { skip: "DATABASE_URL is missing or placeholder." }, () => {});
} else {
  test("executes discovery run, stores candidates, and updates run stats/status", async () => {
    const ownerEmail = `discovery-worker-owner-${Date.now()}@example.com`;

    try {
      const workspace = await ensureUserWorkspace({
        email: ownerEmail,
        name: "Discovery Worker Owner",
      });

      const campaign = await createCampaignForWorkspace({
        workspaceId: workspace.workspaceId,
        name: "Discovery Worker Campaign",
      });

      const connector = await createSourceConnectorForWorkspace({
        workspaceId: workspace.workspaceId,
        type: "LICENSED_PROVIDER",
        providerKey: "pdl",
        config: { apiKey: "mock-key" },
      });

      const sourceRun = await createDiscoveryRunForWorkspace({
        workspaceId: workspace.workspaceId,
        campaignId: campaign.id,
        connectorId: connector.id,
        filters: { industry: ["B2B SaaS"] },
        limit: 3,
      });

      const stats = await executeDiscoveryRun({
        sourceRunId: sourceRun.id,
        clientFactory: async () => ({
          async fetchAllCandidates() {
            return [
              {
                personProviderId: "p1",
                firstName: "Ada",
                lastName: "Lovelace",
                fullName: "Ada Lovelace",
                email: "ada@example.com",
                title: "Founder",
                seniority: "founder",
                department: "executive",
                company: {
                  id: "c1",
                  name: "Analytical Engines",
                  domain: "analytical.engines",
                  website: "https://analytical.engines",
                },
                location: "London, UK",
              },
              {
                personProviderId: "p2",
                firstName: "NoEmail",
                lastName: "Person",
                fullName: "NoEmail Person",
                email: null,
                title: "Head of Sales",
                seniority: "head",
                department: "sales",
                company: {
                  id: "c2",
                  name: "No Email Co",
                  domain: "noemail.co",
                  website: "https://noemail.co",
                },
                location: "New York, US",
              },
            ];
          },
        }),
      });

      assert.deepEqual(stats, {
        fetched: 2,
        candidatesCreated: 1,
        approvableCandidates: 1,
        suppressedByBlocklist: 0,
        suppressedByDuplicate: 0,
        skippedMissingEmail: 1,
      });

      const persistedRun = await prisma.sourceRun.findUniqueOrThrow({
        where: {
          id: sourceRun.id,
        },
      });

      assert.equal(persistedRun.status, "COMPLETED");
      assert.deepEqual(persistedRun.statsJson, stats);
      assert.ok(persistedRun.startedAt instanceof Date);
      assert.ok(persistedRun.finishedAt instanceof Date);

      const candidates = await prisma.candidate.findMany({
        where: {
          sourceRunId: sourceRun.id,
        },
      });

      assert.equal(candidates.length, 1);
      assert.equal(candidates[0]?.email, "ada@example.com");
      assert.equal(candidates[0]?.personProviderId, "p1");
      assert.equal(candidates[0]?.status, "NEW");
      assert.equal(candidates[0]?.verificationStatus, "UNKNOWN");
    } finally {
      const users = await prisma.user.findMany({
        where: {
          email: ownerEmail,
        },
        select: {
          id: true,
        },
      });

      const userIds = users.map((user) => user.id);

      if (userIds.length > 0) {
        await prisma.candidate.deleteMany({
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
