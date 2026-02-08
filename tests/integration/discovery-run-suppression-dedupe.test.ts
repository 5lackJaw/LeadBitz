import assert from "node:assert/strict";
import test from "node:test";

import { CandidateStatus } from "@prisma/client";

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
  test("discovery run suppression/dedupe integration", { skip: "DATABASE_URL is missing or placeholder." }, () => {});
} else {
  test("marks suppressed and duplicate candidates as SUPPRESSED and excludes them from approvable", async () => {
    const ownerEmail = `discovery-dedupe-owner-${Date.now()}@example.com`;

    try {
      const workspace = await ensureUserWorkspace({
        email: ownerEmail,
        name: "Discovery Dedupe Owner",
      });

      const campaign = await createCampaignForWorkspace({
        workspaceId: workspace.workspaceId,
        name: "Discovery Dedupe Campaign",
      });

      const connector = await createSourceConnectorForWorkspace({
        workspaceId: workspace.workspaceId,
        type: "LICENSED_PROVIDER",
        providerKey: "pdl",
        config: { apiKey: "mock-key" },
      });

      await prisma.suppression.create({
        data: {
          workspaceId: workspace.workspaceId,
          email: "blocked@example.com",
          reason: "unsubscribed",
        },
      });

      await prisma.lead.create({
        data: {
          workspaceId: workspace.workspaceId,
          email: "existing@example.com",
          firstName: "Existing",
        },
      });

      const priorRun = await createDiscoveryRunForWorkspace({
        workspaceId: workspace.workspaceId,
        campaignId: campaign.id,
        connectorId: connector.id,
        filters: {},
        limit: 5,
      });

      await prisma.candidate.create({
        data: {
          workspaceId: workspace.workspaceId,
          campaignId: campaign.id,
          sourceRunId: priorRun.id,
          email: "dup@example.com",
          personProviderId: "person-dup-existing",
          status: CandidateStatus.NEW,
        },
      });

      const sourceRun = await createDiscoveryRunForWorkspace({
        workspaceId: workspace.workspaceId,
        campaignId: campaign.id,
        connectorId: connector.id,
        filters: {},
        limit: 10,
      });

      const stats = await executeDiscoveryRun({
        sourceRunId: sourceRun.id,
        clientFactory: async () => ({
          async fetchAllCandidates() {
            return [
              {
                personProviderId: "p-blocked",
                firstName: "Blocked",
                lastName: "User",
                fullName: "Blocked User",
                email: "blocked@example.com",
                title: "Founder",
                seniority: "founder",
                department: "exec",
                company: { id: "c-blocked", name: "Blocked Co", domain: "blocked.co", website: "https://blocked.co" },
                location: "US",
              },
              {
                personProviderId: "p-existing",
                firstName: "Existing",
                lastName: "Lead",
                fullName: "Existing Lead",
                email: "existing@example.com",
                title: "Head of Sales",
                seniority: "head",
                department: "sales",
                company: { id: "c-existing", name: "Existing Co", domain: "existing.co", website: "https://existing.co" },
                location: "US",
              },
              {
                personProviderId: "p-dup-new",
                firstName: "Duplicate",
                lastName: "Email",
                fullName: "Duplicate Email",
                email: "dup@example.com",
                title: "VP",
                seniority: "vp",
                department: "sales",
                company: { id: "c-dup-new", name: "Dup Co", domain: "dup.co", website: "https://dup.co" },
                location: "US",
              },
              {
                personProviderId: "person-fresh",
                firstName: "Fresh",
                lastName: "One",
                fullName: "Fresh One",
                email: "fresh@example.com",
                title: "Founder",
                seniority: "founder",
                department: "exec",
                company: { id: "company-fresh", name: "Fresh Co", domain: "fresh.co", website: "https://fresh.co" },
                location: "US",
              },
              {
                personProviderId: "person-fresh-2",
                firstName: "Fresh",
                lastName: "DuplicateEmail",
                fullName: "Fresh DuplicateEmail",
                email: "fresh@example.com",
                title: "Director",
                seniority: "director",
                department: "sales",
                company: { id: "company-fresh-2", name: "Fresh Two", domain: "fresh2.co", website: "https://fresh2.co" },
                location: "US",
              },
              {
                personProviderId: "person-fresh",
                firstName: "Fresh",
                lastName: "DuplicatePerson",
                fullName: "Fresh DuplicatePerson",
                email: "persondup@example.com",
                title: "Director",
                seniority: "director",
                department: "sales",
                company: { id: "company-fresh-3", name: "Fresh Three", domain: "fresh3.co", website: "https://fresh3.co" },
                location: "US",
              },
            ];
          },
        }),
      });

      assert.deepEqual(stats, {
        fetched: 6,
        candidatesCreated: 6,
        approvableCandidates: 1,
        suppressedByBlocklist: 2,
        suppressedByDuplicate: 3,
        skippedMissingEmail: 0,
      });

      const createdRows = await prisma.candidate.findMany({
        where: {
          sourceRunId: sourceRun.id,
        },
        orderBy: {
          email: "asc",
        },
      });

      assert.equal(createdRows.length, 6);

      const statusByEmail = new Map<string, CandidateStatus[]>();
      for (const row of createdRows) {
        const existing = statusByEmail.get(row.email) ?? [];
        existing.push(row.status);
        statusByEmail.set(row.email, existing);
      }

      assert.deepEqual(statusByEmail.get("blocked@example.com"), [CandidateStatus.SUPPRESSED]);
      assert.deepEqual(statusByEmail.get("existing@example.com"), [CandidateStatus.SUPPRESSED]);
      assert.deepEqual(statusByEmail.get("dup@example.com"), [CandidateStatus.SUPPRESSED]);
      assert.deepEqual(statusByEmail.get("fresh@example.com"), [CandidateStatus.NEW, CandidateStatus.SUPPRESSED]);
      assert.deepEqual(statusByEmail.get("persondup@example.com"), [CandidateStatus.SUPPRESSED]);
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
        await prisma.emailVerification.deleteMany({
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

        await prisma.suppression.deleteMany({
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

        await prisma.lead.deleteMany({
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
