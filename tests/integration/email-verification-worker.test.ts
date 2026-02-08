import assert from "node:assert/strict";
import test from "node:test";

import { CandidateStatus, CandidateVerificationStatus } from "@prisma/client";

import { ensureUserWorkspace } from "../../lib/auth/ensure-user-workspace";
import { createCampaignForWorkspace } from "../../lib/campaigns/campaign-crud";
import { prisma } from "../../lib/prisma";
import { verifyCandidateEmailsForSourceRun } from "../../lib/sources/email-verification-worker";
import { createSourceConnectorForWorkspace } from "../../lib/sources/source-connectors";
import { createDiscoveryRunForWorkspace } from "../../lib/sources/source-runs";
import { canRunIntegrationDbTests, ensureIntegrationEnv } from "./test-env";

ensureIntegrationEnv();
const canRun = canRunIntegrationDbTests();

if (!canRun) {
  test("email verification worker integration", { skip: "DATABASE_URL is missing or placeholder." }, () => {});
} else {
  test("writes email verification rows and updates candidate verification status", async () => {
    const ownerEmail = `verification-worker-owner-${Date.now()}@example.com`;

    try {
      const workspace = await ensureUserWorkspace({
        email: ownerEmail,
        name: "Verification Worker Owner",
      });

      const campaign = await createCampaignForWorkspace({
        workspaceId: workspace.workspaceId,
        name: "Verification Campaign",
      });

      const connector = await createSourceConnectorForWorkspace({
        workspaceId: workspace.workspaceId,
        type: "LICENSED_PROVIDER",
        providerKey: "pdl",
        config: {
          apiKey: "mock-provider-key",
        },
      });

      const sourceRun = await createDiscoveryRunForWorkspace({
        workspaceId: workspace.workspaceId,
        campaignId: campaign.id,
        connectorId: connector.id,
        filters: {
          industry: ["B2B SaaS"],
        },
        limit: 10,
      });

      await prisma.candidate.createMany({
        data: [
          {
            workspaceId: workspace.workspaceId,
            campaignId: campaign.id,
            sourceRunId: sourceRun.id,
            email: "verified@example.com",
            verificationStatus: CandidateVerificationStatus.UNKNOWN,
            status: CandidateStatus.NEW,
          },
          {
            workspaceId: workspace.workspaceId,
            campaignId: campaign.id,
            sourceRunId: sourceRun.id,
            email: "risky@example.com",
            verificationStatus: CandidateVerificationStatus.UNKNOWN,
            status: CandidateStatus.NEW,
          },
          {
            workspaceId: workspace.workspaceId,
            campaignId: campaign.id,
            sourceRunId: sourceRun.id,
            email: "unknown@example.com",
            verificationStatus: CandidateVerificationStatus.UNKNOWN,
            status: CandidateStatus.NEW,
          },
        ],
      });

      const stats = await verifyCandidateEmailsForSourceRun({
        sourceRunId: sourceRun.id,
        verifier: {
          providerKey: "mock-verifier",
          async verifyBatch(emails) {
            const checkedAt = new Date();

            return emails
              .filter((email) => email !== "unknown@example.com")
              .map((email) => ({
                email,
                checkedAt,
                status:
                  email === "verified@example.com"
                    ? CandidateVerificationStatus.VERIFIED
                    : CandidateVerificationStatus.RISKY,
                details: {
                  source: "mock",
                  email,
                },
              }));
          },
        },
      });

      assert.deepEqual(stats, {
        sourceRunId: sourceRun.id,
        emailsQueued: 3,
        verificationRowsWritten: 3,
        candidatesUpdated: 3,
      });

      const verificationRows = await prisma.emailVerification.findMany({
        where: {
          workspaceId: workspace.workspaceId,
        },
        orderBy: {
          email: "asc",
        },
      });

      assert.equal(verificationRows.length, 3);
      assert.equal(verificationRows[0]?.email, "risky@example.com");
      assert.equal(verificationRows[0]?.status, CandidateVerificationStatus.RISKY);
      assert.equal(verificationRows[1]?.email, "unknown@example.com");
      assert.equal(verificationRows[1]?.status, CandidateVerificationStatus.UNKNOWN);
      assert.equal(verificationRows[2]?.email, "verified@example.com");
      assert.equal(verificationRows[2]?.status, CandidateVerificationStatus.VERIFIED);

      const candidates = await prisma.candidate.findMany({
        where: {
          sourceRunId: sourceRun.id,
        },
        orderBy: {
          email: "asc",
        },
      });

      assert.equal(candidates.length, 3);
      assert.equal(candidates[0]?.email, "risky@example.com");
      assert.equal(candidates[0]?.verificationStatus, CandidateVerificationStatus.RISKY);
      assert.equal(candidates[1]?.email, "unknown@example.com");
      assert.equal(candidates[1]?.verificationStatus, CandidateVerificationStatus.UNKNOWN);
      assert.equal(candidates[2]?.email, "verified@example.com");
      assert.equal(candidates[2]?.verificationStatus, CandidateVerificationStatus.VERIFIED);
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
