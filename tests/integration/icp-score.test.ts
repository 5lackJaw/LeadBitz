import assert from "node:assert/strict";
import test from "node:test";

import { ensureUserWorkspace } from "../../lib/auth/ensure-user-workspace";
import { createCampaignForWorkspace } from "../../lib/campaigns/campaign-crud";
import { generateIcpProfileForWorkspace } from "../../lib/icp/generate-icp-profile";
import {
  IcpScoringNotFoundError,
  scoreIcpVersionForWorkspace,
} from "../../lib/icp/score-icp-version";
import { prisma } from "../../lib/prisma";
import { canRunIntegrationDbTests, ensureIntegrationEnv } from "./test-env";

ensureIntegrationEnv();
const canRun = canRunIntegrationDbTests();

if (!canRun) {
  test("icp score integration", { skip: "DATABASE_URL is missing or placeholder." }, () => {});
} else {
  test("scores ICP versions, persists quality rows, and blocks cross-workspace access", async () => {
    const ownerEmail = `icp-score-owner-${Date.now()}@example.com`;
    const otherEmail = `icp-score-other-${Date.now()}@example.com`;

    try {
      const ownerWorkspace = await ensureUserWorkspace({
        email: ownerEmail,
        name: "ICP Score Owner",
      });
      const otherWorkspace = await ensureUserWorkspace({
        email: otherEmail,
        name: "ICP Score Other",
      });

      const campaign = await createCampaignForWorkspace({
        workspaceId: ownerWorkspace.workspaceId,
        name: "ICP Score Campaign",
      });

      const generated = await generateIcpProfileForWorkspace({
        workspaceId: ownerWorkspace.workspaceId,
        sourceType: "PRODUCT_DESCRIPTION",
        sourceValue: "LeadBitz orchestrates compliant outbound operations.",
        campaignId: campaign.id,
        profileName: "Scoreable ICP",
        generateIcpDraft: async () => ({
          targetIndustries: ["B2B SaaS", "Agencies"],
          companySizeBands: ["11-50", "51-200"],
          buyerRoles: ["Founder", "Head of Sales"],
          pains: ["Low reply rates", "Deliverability risk", "Pipeline inconsistency"],
          exclusions: ["Consumer-only companies"],
          valuePropAngles: ["Deliverability-first controls", "Operator-reviewed AI workflow"],
          sourceSummary:
            "Product-description draft emphasizing outbound control, safety, and workflow reliability.",
        }),
      });

      const primaryScore = await scoreIcpVersionForWorkspace({
        workspaceId: ownerWorkspace.workspaceId,
        campaignId: campaign.id,
        icpVersionId: generated.icpVersionId ?? "",
      });

      assert.equal(primaryScore.score, 100);
      assert.equal(primaryScore.tier, "HIGH");
      assert.equal(primaryScore.breakdown.length, 7);
      assert.equal(primaryScore.missingFields.length, 0);
      assert.equal(primaryScore.explanations.length, 7);
      assert.equal(primaryScore.questions.length, 0);

      const persistedPrimary = await prisma.icpQualityScore.findUnique({
        where: {
          id: primaryScore.icpQualityScoreId,
        },
        select: {
          workspaceId: true,
          campaignId: true,
          icpVersionId: true,
          scoreInt: true,
          tier: true,
          explanationsJson: true,
        },
      });

      assert.ok(persistedPrimary);
      if (!persistedPrimary) {
        throw new Error("Expected persisted ICP quality score row.");
      }
      assert.equal(persistedPrimary.workspaceId, ownerWorkspace.workspaceId);
      assert.equal(persistedPrimary.campaignId, campaign.id);
      assert.equal(persistedPrimary.icpVersionId, generated.icpVersionId);
      assert.equal(persistedPrimary.scoreInt, 100);
      assert.equal(persistedPrimary.tier, "HIGH");
      assert.equal((persistedPrimary.explanationsJson as unknown[] | null)?.length ?? 0, 7);

      const sparseVersion = await prisma.icpVersion.create({
        data: {
          workspaceId: ownerWorkspace.workspaceId,
          campaignId: campaign.id,
          source: "MANUAL",
          title: "Sparse ICP",
          icpJson: {
            targetIndustries: ["B2B SaaS"],
            companySizeBands: [],
            buyerRoles: ["Founder"],
            pains: ["Single pain only"],
            exclusions: [],
            valuePropAngles: [],
            sourceSummary: "Too short",
          },
          isActive: false,
        },
        select: {
          id: true,
        },
      });

      const sparseScore = await scoreIcpVersionForWorkspace({
        workspaceId: ownerWorkspace.workspaceId,
        campaignId: campaign.id,
        icpVersionId: sparseVersion.id,
      });

      assert.equal(sparseScore.tier, "INSUFFICIENT");
      assert.ok(sparseScore.missingFields.length > 0);
      assert.ok(sparseScore.questions.length > 0);

      await assert.rejects(
        () =>
          scoreIcpVersionForWorkspace({
            workspaceId: otherWorkspace.workspaceId,
            campaignId: campaign.id,
            icpVersionId: generated.icpVersionId ?? "",
          }),
        (error: unknown) => {
          assert.ok(error instanceof IcpScoringNotFoundError);
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
