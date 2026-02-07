import assert from "node:assert/strict";
import test from "node:test";

import { ensureUserWorkspace } from "../../lib/auth/ensure-user-workspace";
import { createCampaignForWorkspace } from "../../lib/campaigns/campaign-crud";
import { generateIcpProfileForWorkspace } from "../../lib/icp/generate-icp-profile";
import {
  SpecialistInterviewNotFoundError,
  answerSpecialistInterviewSession,
  completeSpecialistInterviewSession,
  startSpecialistInterviewSession,
} from "../../lib/icp/specialist-interview";
import { prisma } from "../../lib/prisma";
import { canRunIntegrationDbTests, ensureIntegrationEnv } from "./test-env";

ensureIntegrationEnv();
const canRun = canRunIntegrationDbTests();

if (!canRun) {
  test("icp specialist interview integration", { skip: "DATABASE_URL is missing or placeholder." }, () => {});
} else {
  test("runs specialist interview flow and creates a new active specialist ICP version", async () => {
    const ownerEmail = `icp-specialist-owner-${Date.now()}@example.com`;
    const otherEmail = `icp-specialist-other-${Date.now()}@example.com`;

    try {
      const ownerWorkspace = await ensureUserWorkspace({
        email: ownerEmail,
        name: "ICP Specialist Owner",
      });
      const otherWorkspace = await ensureUserWorkspace({
        email: otherEmail,
        name: "ICP Specialist Other",
      });

      const campaign = await createCampaignForWorkspace({
        workspaceId: ownerWorkspace.workspaceId,
        name: "ICP Specialist Campaign",
      });

      const generated = await generateIcpProfileForWorkspace({
        workspaceId: ownerWorkspace.workspaceId,
        sourceType: "WEBSITE_URL",
        sourceValue: "https://leadbitz.com",
        campaignId: campaign.id,
      });

      const baseVersionId = generated.icpVersionId ?? "";
      assert.ok(baseVersionId);

      const started = await startSpecialistInterviewSession({
        workspaceId: ownerWorkspace.workspaceId,
        campaignId: campaign.id,
        icpVersionId: baseVersionId,
      });

      assert.ok(started.sessionId);
      assert.equal(started.questions.length, 5);

      const partialAnswerResult = await answerSpecialistInterviewSession({
        workspaceId: ownerWorkspace.workspaceId,
        sessionId: started.sessionId,
        answers: {
          targetBuyerRole: "Head of Sales",
          bestFitCompanySignals: "Outbound team in place, poor reply rates",
        },
      });

      assert.equal(partialAnswerResult.done, false);
      assert.equal(partialAnswerResult.nextQuestions.length, 3);

      const finalAnswerResult = await answerSpecialistInterviewSession({
        workspaceId: ownerWorkspace.workspaceId,
        sessionId: started.sessionId,
        answers: {
          criticalPains: "Low reply rates; poor sender reputation",
          mustAvoidSegments: "B2C-only companies",
          proofPoints: "Operator-reviewed AI; deliverability safeguards",
        },
      });

      assert.equal(finalAnswerResult.done, true);
      assert.equal(finalAnswerResult.nextQuestions.length, 0);

      const completed = await completeSpecialistInterviewSession({
        workspaceId: ownerWorkspace.workspaceId,
        sessionId: started.sessionId,
      });

      assert.ok(completed.icpVersionId);
      assert.ok(completed.diffSummary.length > 0);

      const createdVersion = await prisma.icpVersion.findUnique({
        where: {
          id: completed.icpVersionId,
        },
        select: {
          workspaceId: true,
          campaignId: true,
          source: true,
          isActive: true,
          icpJson: true,
        },
      });

      assert.ok(createdVersion);
      if (!createdVersion) {
        throw new Error("Expected specialist ICP version to be created.");
      }

      assert.equal(createdVersion.workspaceId, ownerWorkspace.workspaceId);
      assert.equal(createdVersion.campaignId, campaign.id);
      assert.equal(createdVersion.source, "SPECIALIST");
      assert.equal(createdVersion.isActive, true);
      assert.ok(Array.isArray((createdVersion.icpJson as Record<string, unknown>).buyerRoles));

      const baseVersion = await prisma.icpVersion.findUnique({
        where: {
          id: baseVersionId,
        },
        select: {
          isActive: true,
        },
      });

      assert.ok(baseVersion);
      if (!baseVersion) {
        throw new Error("Expected base ICP version to exist.");
      }
      assert.equal(baseVersion.isActive, false);

      const persistedSession = await prisma.icpInterviewSession.findUnique({
        where: {
          id: started.sessionId,
        },
        select: {
          status: true,
          outputIcpJson: true,
          completedAt: true,
        },
      });

      assert.ok(persistedSession);
      if (!persistedSession) {
        throw new Error("Expected persisted specialist interview session row.");
      }
      assert.equal(persistedSession.status, "COMPLETED");
      assert.ok(persistedSession.outputIcpJson);
      assert.ok(persistedSession.completedAt);

      await assert.rejects(
        () =>
          startSpecialistInterviewSession({
            workspaceId: otherWorkspace.workspaceId,
            campaignId: campaign.id,
            icpVersionId: baseVersionId,
          }),
        (error: unknown) => {
          assert.ok(error instanceof SpecialistInterviewNotFoundError);
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

        await prisma.icpProfile.deleteMany({
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
