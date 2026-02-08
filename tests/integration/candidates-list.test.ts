import assert from "node:assert/strict";
import test from "node:test";

import { CandidateStatus, CandidateVerificationStatus, Prisma, SourceRunStatus, SourceConnectorType } from "@prisma/client";

import { ensureUserWorkspace } from "../../lib/auth/ensure-user-workspace";
import { createCampaignForWorkspace } from "../../lib/campaigns/campaign-crud";
import { prisma } from "../../lib/prisma";
import {
  CandidateListNotFoundError,
  CandidateListValidationError,
  listCampaignCandidatesForWorkspace,
} from "../../lib/sources/candidates";
import { canRunIntegrationDbTests, ensureIntegrationEnv } from "./test-env";

ensureIntegrationEnv();
const canRun = canRunIntegrationDbTests();

if (!canRun) {
  test("candidates list integration", { skip: "DATABASE_URL is missing or placeholder." }, () => {});
} else {
  test("lists candidates with filters and cursor pagination", async () => {
    const ownerEmail = `candidates-list-owner-${Date.now()}@example.com`;
    const otherEmail = `candidates-list-other-${Date.now()}@example.com`;

    try {
      const ownerWorkspace = await ensureUserWorkspace({
        email: ownerEmail,
        name: "Candidates List Owner",
      });
      const otherWorkspace = await ensureUserWorkspace({
        email: otherEmail,
        name: "Candidates List Other",
      });

      const campaign = await createCampaignForWorkspace({
        workspaceId: ownerWorkspace.workspaceId,
        name: "Candidates Campaign",
      });
      const otherCampaign = await createCampaignForWorkspace({
        workspaceId: otherWorkspace.workspaceId,
        name: "Other Candidates Campaign",
      });

      const connector = await prisma.sourceConnector.create({
        data: {
          workspaceId: ownerWorkspace.workspaceId,
          type: SourceConnectorType.LICENSED_PROVIDER,
          providerKey: "pdl",
        },
      });
      const sourceRunOne = await prisma.sourceRun.create({
        data: {
          workspaceId: ownerWorkspace.workspaceId,
          campaignId: campaign.id,
          connectorId: connector.id,
          status: SourceRunStatus.COMPLETED,
        },
      });
      const sourceRunTwo = await prisma.sourceRun.create({
        data: {
          workspaceId: ownerWorkspace.workspaceId,
          campaignId: campaign.id,
          connectorId: connector.id,
          status: SourceRunStatus.COMPLETED,
        },
      });

      const otherConnector = await prisma.sourceConnector.create({
        data: {
          workspaceId: otherWorkspace.workspaceId,
          type: SourceConnectorType.LICENSED_PROVIDER,
          providerKey: "pdl",
        },
      });
      const otherSourceRun = await prisma.sourceRun.create({
        data: {
          workspaceId: otherWorkspace.workspaceId,
          campaignId: otherCampaign.id,
          connectorId: otherConnector.id,
          status: SourceRunStatus.COMPLETED,
        },
      });

      const timestampBase = Date.now();

      await prisma.candidate.create({
        data: {
          workspaceId: ownerWorkspace.workspaceId,
          campaignId: campaign.id,
          sourceRunId: sourceRunOne.id,
          email: `verified-founder-${timestampBase}@example.com`,
          title: "Founder",
          confidenceScore: new Prisma.Decimal("0.92"),
          verificationStatus: CandidateVerificationStatus.VERIFIED,
          status: CandidateStatus.NEW,
          createdAt: new Date(timestampBase + 1),
        },
      });
      await prisma.candidate.create({
        data: {
          workspaceId: ownerWorkspace.workspaceId,
          campaignId: campaign.id,
          sourceRunId: sourceRunOne.id,
          email: `unknown-sdr-${timestampBase}@example.com`,
          title: "Sales Development Representative",
          confidenceScore: new Prisma.Decimal("0.55"),
          verificationStatus: CandidateVerificationStatus.UNKNOWN,
          status: CandidateStatus.NEW,
          createdAt: new Date(timestampBase + 2),
        },
      });
      await prisma.candidate.create({
        data: {
          workspaceId: ownerWorkspace.workspaceId,
          campaignId: campaign.id,
          sourceRunId: sourceRunTwo.id,
          email: `risky-sales-${timestampBase}@example.com`,
          title: "Head of Sales",
          confidenceScore: new Prisma.Decimal("0.78"),
          verificationStatus: CandidateVerificationStatus.RISKY,
          status: CandidateStatus.NEW,
          createdAt: new Date(timestampBase + 3),
        },
      });
      await prisma.candidate.create({
        data: {
          workspaceId: ownerWorkspace.workspaceId,
          campaignId: campaign.id,
          sourceRunId: sourceRunTwo.id,
          email: `verified-revops-${timestampBase}@example.com`,
          title: "Revenue Operations",
          confidenceScore: new Prisma.Decimal("0.83"),
          verificationStatus: CandidateVerificationStatus.VERIFIED,
          status: CandidateStatus.NEW,
          createdAt: new Date(timestampBase + 4),
        },
      });

      await prisma.candidate.create({
        data: {
          workspaceId: otherWorkspace.workspaceId,
          campaignId: otherCampaign.id,
          sourceRunId: otherSourceRun.id,
          email: `other-workspace-${timestampBase}@example.com`,
          title: "Founder",
          confidenceScore: new Prisma.Decimal("0.99"),
          verificationStatus: CandidateVerificationStatus.VERIFIED,
          status: CandidateStatus.NEW,
          createdAt: new Date(timestampBase + 5),
        },
      });

      const firstPage = await listCampaignCandidatesForWorkspace({
        workspaceId: ownerWorkspace.workspaceId,
        campaignId: campaign.id,
        pageSize: 2,
      });

      assert.equal(firstPage.items.length, 2);
      assert.equal(firstPage.pageInfo.hasMore, true);
      assert.ok(firstPage.pageInfo.nextCursor);
      assert.equal(firstPage.items[0]?.email.includes("verified-revops"), true);
      assert.equal(firstPage.items[1]?.email.includes("risky-sales"), true);

      const secondPage = await listCampaignCandidatesForWorkspace({
        workspaceId: ownerWorkspace.workspaceId,
        campaignId: campaign.id,
        pageSize: 2,
        cursor: firstPage.pageInfo.nextCursor ?? undefined,
      });

      assert.equal(secondPage.items.length, 2);
      assert.equal(secondPage.pageInfo.hasMore, false);
      assert.equal(secondPage.pageInfo.nextCursor, null);
      assert.equal(secondPage.items[0]?.email.includes("unknown-sdr"), true);
      assert.equal(secondPage.items[1]?.email.includes("verified-founder"), true);

      const verifiedOnly = await listCampaignCandidatesForWorkspace({
        workspaceId: ownerWorkspace.workspaceId,
        campaignId: campaign.id,
        filters: {
          verificationStatus: CandidateVerificationStatus.VERIFIED,
        },
      });

      assert.equal(verifiedOnly.items.length, 2);
      assert.deepEqual(
        verifiedOnly.items.map((item) => item.verificationStatus),
        [CandidateVerificationStatus.VERIFIED, CandidateVerificationStatus.VERIFIED],
      );

      const highConfidenceOnly = await listCampaignCandidatesForWorkspace({
        workspaceId: ownerWorkspace.workspaceId,
        campaignId: campaign.id,
        filters: {
          confidenceMin: 0.8,
        },
      });
      assert.equal(highConfidenceOnly.items.length, 2);
      assert.equal(highConfidenceOnly.items.every((item) => (item.confidenceScore ?? 0) >= 0.8), true);

      const roleFiltered = await listCampaignCandidatesForWorkspace({
        workspaceId: ownerWorkspace.workspaceId,
        campaignId: campaign.id,
        filters: {
          role: "sales",
        },
      });
      assert.equal(roleFiltered.items.length, 2);
      assert.equal(
        roleFiltered.items.every((item) => (item.title ?? "").toLowerCase().includes("sales")),
        true,
      );

      const sourceRunFiltered = await listCampaignCandidatesForWorkspace({
        workspaceId: ownerWorkspace.workspaceId,
        campaignId: campaign.id,
        filters: {
          sourceRunId: sourceRunOne.id,
        },
      });
      assert.equal(sourceRunFiltered.items.length, 2);
      assert.equal(sourceRunFiltered.items.every((item) => item.sourceRunId === sourceRunOne.id), true);

      await assert.rejects(
        () =>
          listCampaignCandidatesForWorkspace({
            workspaceId: ownerWorkspace.workspaceId,
            campaignId: campaign.id,
            filters: {
              confidenceMin: 1.5,
            },
          }),
        (error: unknown) => {
          assert.ok(error instanceof CandidateListValidationError);
          return true;
        },
      );

      await assert.rejects(
        () =>
          listCampaignCandidatesForWorkspace({
            workspaceId: ownerWorkspace.workspaceId,
            campaignId: campaign.id,
            filters: {
              sourceRunId: otherSourceRun.id,
            },
          }),
        (error: unknown) => {
          assert.ok(error instanceof CandidateListNotFoundError);
          return true;
        },
      );

      await assert.rejects(
        () =>
          listCampaignCandidatesForWorkspace({
            workspaceId: ownerWorkspace.workspaceId,
            campaignId: campaign.id,
            cursor: "not-a-real-cursor",
          }),
        (error: unknown) => {
          assert.ok(error instanceof CandidateListValidationError);
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
