import assert from "node:assert/strict";
import test from "node:test";

import { CandidateStatus, CandidateVerificationStatus, Prisma, SourceConnectorType, SourceRunStatus } from "@prisma/client";

import { ensureUserWorkspace } from "../../lib/auth/ensure-user-workspace";
import { createCampaignForWorkspace } from "../../lib/campaigns/campaign-crud";
import { prisma } from "../../lib/prisma";
import {
  CandidateApprovalRejectionReason,
  CandidateApprovalValidationError,
  approveCandidatesWithRulesForWorkspace,
} from "../../lib/sources/candidate-approval";
import { canRunIntegrationDbTests, ensureIntegrationEnv } from "./test-env";

ensureIntegrationEnv();
const canRun = canRunIntegrationDbTests();

if (!canRun) {
  test("candidates approve rules integration", { skip: "DATABASE_URL is missing or placeholder." }, () => {});
} else {
  test("enforces verified-only defaults and invalid-email blocking for approvals", async () => {
    const ownerEmail = `candidates-approve-owner-${Date.now()}@example.com`;

    try {
      const workspace = await ensureUserWorkspace({
        email: ownerEmail,
        name: "Candidates Approve Owner",
      });

      const campaign = await createCampaignForWorkspace({
        workspaceId: workspace.workspaceId,
        name: "Candidates Approve Campaign",
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

      const verifiedCandidate = await prisma.candidate.create({
        data: {
          workspaceId: workspace.workspaceId,
          campaignId: campaign.id,
          sourceRunId: sourceRun.id,
          email: `verified-${Date.now()}@example.com`,
          verificationStatus: CandidateVerificationStatus.VERIFIED,
          status: CandidateStatus.NEW,
          confidenceScore: new Prisma.Decimal("0.91"),
        },
      });

      const riskyCandidate = await prisma.candidate.create({
        data: {
          workspaceId: workspace.workspaceId,
          campaignId: campaign.id,
          sourceRunId: sourceRun.id,
          email: `risky-${Date.now()}@example.com`,
          verificationStatus: CandidateVerificationStatus.RISKY,
          status: CandidateStatus.NEW,
          confidenceScore: new Prisma.Decimal("0.79"),
        },
      });

      const invalidCandidate = await prisma.candidate.create({
        data: {
          workspaceId: workspace.workspaceId,
          campaignId: campaign.id,
          sourceRunId: sourceRun.id,
          email: `invalid-${Date.now()}@example.com`,
          verificationStatus: CandidateVerificationStatus.INVALID,
          status: CandidateStatus.NEW,
        },
      });

      const preApprovedCandidate = await prisma.candidate.create({
        data: {
          workspaceId: workspace.workspaceId,
          campaignId: campaign.id,
          sourceRunId: sourceRun.id,
          email: `already-approved-${Date.now()}@example.com`,
          verificationStatus: CandidateVerificationStatus.VERIFIED,
          status: CandidateStatus.APPROVED,
        },
      });

      const defaultPolicyResult = await approveCandidatesWithRulesForWorkspace({
        workspaceId: workspace.workspaceId,
        campaignId: campaign.id,
        candidateIds: [
          verifiedCandidate.id,
          riskyCandidate.id,
          invalidCandidate.id,
          preApprovedCandidate.id,
          "missing-candidate-id",
        ],
      });

      assert.equal(defaultPolicyResult.approvedCount, 1);
      assert.deepEqual(defaultPolicyResult.rejected, [
        { candidateId: riskyCandidate.id, reason: CandidateApprovalRejectionReason.UNVERIFIED_EMAIL },
        { candidateId: invalidCandidate.id, reason: CandidateApprovalRejectionReason.INVALID_EMAIL },
        { candidateId: preApprovedCandidate.id, reason: CandidateApprovalRejectionReason.STATUS_NOT_NEW },
        { candidateId: "missing-candidate-id", reason: CandidateApprovalRejectionReason.CANDIDATE_NOT_FOUND },
      ]);

      const leadsAfterDefaultPolicy = await prisma.lead.findMany({
        where: {
          workspaceId: workspace.workspaceId,
          email: {
            in: [verifiedCandidate.email, riskyCandidate.email, invalidCandidate.email],
          },
        },
        orderBy: {
          email: "asc",
        },
      });
      assert.equal(leadsAfterDefaultPolicy.length, 1);
      assert.equal(leadsAfterDefaultPolicy[0]?.email, verifiedCandidate.email);

      await assert.rejects(
        () =>
          approveCandidatesWithRulesForWorkspace({
            workspaceId: workspace.workspaceId,
            campaignId: campaign.id,
            candidateIds: [riskyCandidate.id],
            allowUnverified: true,
          }),
        (error: unknown) => {
          assert.ok(error instanceof CandidateApprovalValidationError);
          return true;
        },
      );

      const allowUnverifiedResult = await approveCandidatesWithRulesForWorkspace({
        workspaceId: workspace.workspaceId,
        campaignId: campaign.id,
        candidateIds: [riskyCandidate.id, invalidCandidate.id],
        allowUnverified: true,
        confirmAllowUnverified: true,
      });

      assert.equal(allowUnverifiedResult.approvedCount, 1);
      assert.deepEqual(allowUnverifiedResult.rejected, [
        { candidateId: invalidCandidate.id, reason: CandidateApprovalRejectionReason.INVALID_EMAIL },
      ]);

      const candidateStatuses = await prisma.candidate.findMany({
        where: {
          id: {
            in: [verifiedCandidate.id, riskyCandidate.id, invalidCandidate.id],
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

      const statusByEmail = new Map(candidateStatuses.map((item) => [item.email, item.status]));
      assert.equal(statusByEmail.get(verifiedCandidate.email), CandidateStatus.APPROVED);
      assert.equal(statusByEmail.get(riskyCandidate.email), CandidateStatus.APPROVED);
      assert.equal(statusByEmail.get(invalidCandidate.email), CandidateStatus.NEW);
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
