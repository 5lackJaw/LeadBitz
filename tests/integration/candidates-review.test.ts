import assert from "node:assert/strict";
import test from "node:test";

import { CandidateStatus, CandidateVerificationStatus, Prisma, SourceConnectorType, SourceRunStatus } from "@prisma/client";

import { ensureUserWorkspace } from "../../lib/auth/ensure-user-workspace";
import { createCampaignForWorkspace } from "../../lib/campaigns/campaign-crud";
import { prisma } from "../../lib/prisma";
import {
  CandidateReviewValidationError,
  approveCandidatesToLeadsForWorkspace,
  rejectCandidatesForWorkspace,
} from "../../lib/sources/candidate-review";
import { canRunIntegrationDbTests, ensureIntegrationEnv } from "./test-env";

ensureIntegrationEnv();
const canRun = canRunIntegrationDbTests();

if (!canRun) {
  test("candidates review integration", { skip: "DATABASE_URL is missing or placeholder." }, () => {});
} else {
  test("approves new candidates to leads and persists reject status", async () => {
    const ownerEmail = `candidates-review-owner-${Date.now()}@example.com`;

    try {
      const workspace = await ensureUserWorkspace({
        email: ownerEmail,
        name: "Candidates Review Owner",
      });

      const campaign = await createCampaignForWorkspace({
        workspaceId: workspace.workspaceId,
        name: "Candidates Review Campaign",
      });

      const connector = await prisma.sourceConnector.create({
        data: {
          workspaceId: workspace.workspaceId,
          type: SourceConnectorType.LICENSED_PROVIDER,
          providerKey: "pdl",
        },
      });

      const sourceRun = await prisma.sourceRun.create({
        data: {
          workspaceId: workspace.workspaceId,
          campaignId: campaign.id,
          connectorId: connector.id,
          status: SourceRunStatus.COMPLETED,
        },
      });

      const candidateOne = await prisma.candidate.create({
        data: {
          workspaceId: workspace.workspaceId,
          campaignId: campaign.id,
          sourceRunId: sourceRun.id,
          email: `approve-one-${Date.now()}@example.com`,
          firstName: "Ada",
          lastName: "Lovelace",
          title: "Founder",
          companyName: "A Co",
          companyDomain: "aco.com",
          confidenceScore: new Prisma.Decimal("0.90"),
          verificationStatus: CandidateVerificationStatus.VERIFIED,
          status: CandidateStatus.NEW,
        },
      });

      const candidateTwo = await prisma.candidate.create({
        data: {
          workspaceId: workspace.workspaceId,
          campaignId: campaign.id,
          sourceRunId: sourceRun.id,
          email: `approve-two-${Date.now()}@example.com`,
          firstName: "Grace",
          lastName: "Hopper",
          title: "Head of Sales",
          companyName: "B Co",
          companyDomain: "bco.com",
          confidenceScore: new Prisma.Decimal("0.84"),
          verificationStatus: CandidateVerificationStatus.RISKY,
          status: CandidateStatus.NEW,
        },
      });

      const candidateThree = await prisma.candidate.create({
        data: {
          workspaceId: workspace.workspaceId,
          campaignId: campaign.id,
          sourceRunId: sourceRun.id,
          email: `reject-three-${Date.now()}@example.com`,
          firstName: "Linus",
          title: "Revenue Operations",
          verificationStatus: CandidateVerificationStatus.UNKNOWN,
          status: CandidateStatus.NEW,
        },
      });

      const approveResult = await approveCandidatesToLeadsForWorkspace({
        workspaceId: workspace.workspaceId,
        campaignId: campaign.id,
        candidateIds: [candidateOne.id, candidateTwo.id],
      });

      assert.deepEqual(approveResult, {
        processedCount: 2,
        skippedCount: 0,
      });

      const approvedCandidates = await prisma.candidate.findMany({
        where: {
          id: {
            in: [candidateOne.id, candidateTwo.id],
          },
        },
        orderBy: {
          email: "asc",
        },
        select: {
          email: true,
          status: true,
        },
      });

      assert.equal(approvedCandidates.length, 2);
      assert.equal(approvedCandidates[0]?.status, CandidateStatus.APPROVED);
      assert.equal(approvedCandidates[1]?.status, CandidateStatus.APPROVED);

      const leads = await prisma.lead.findMany({
        where: {
          workspaceId: workspace.workspaceId,
          email: {
            in: [candidateOne.email, candidateTwo.email],
          },
        },
      });
      assert.equal(leads.length, 2);

      const campaignLeads = await prisma.campaignLead.findMany({
        where: {
          campaignId: campaign.id,
        },
      });
      assert.equal(campaignLeads.length, 2);

      const rejectResult = await rejectCandidatesForWorkspace({
        workspaceId: workspace.workspaceId,
        campaignId: campaign.id,
        candidateIds: [candidateThree.id],
      });

      assert.deepEqual(rejectResult, {
        processedCount: 1,
        skippedCount: 0,
      });

      const rejectedCandidate = await prisma.candidate.findUnique({
        where: {
          id: candidateThree.id,
        },
        select: {
          status: true,
        },
      });
      assert.equal(rejectedCandidate?.status, CandidateStatus.REJECTED);

      await assert.rejects(
        () =>
          approveCandidatesToLeadsForWorkspace({
            workspaceId: workspace.workspaceId,
            campaignId: campaign.id,
            candidateIds: [],
          }),
        (error: unknown) => {
          assert.ok(error instanceof CandidateReviewValidationError);
          return true;
        },
      );
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
