import assert from "node:assert/strict";
import test from "node:test";

import { ensureUserWorkspace } from "../../lib/auth/ensure-user-workspace";
import { createCampaignForWorkspace } from "../../lib/campaigns/campaign-crud";
import { generateIcpProfileForWorkspace } from "../../lib/icp/generate-icp-profile";
import {
  ProductArchetypeNotFoundError,
  classifyProductArchetypeForWorkspace,
} from "../../lib/icp/classify-product-archetype";
import { prisma } from "../../lib/prisma";
import { canRunIntegrationDbTests, ensureIntegrationEnv } from "./test-env";

ensureIntegrationEnv();
const canRun = canRunIntegrationDbTests();

if (!canRun) {
  test("icp archetype classification integration", { skip: "DATABASE_URL is missing or placeholder." }, () => {});
} else {
  test("classifies archetype, persists decision, and enforces workspace ownership", async () => {
    const ownerEmail = `icp-classify-owner-${Date.now()}@example.com`;
    const otherEmail = `icp-classify-other-${Date.now()}@example.com`;

    try {
      const ownerWorkspace = await ensureUserWorkspace({
        email: ownerEmail,
        name: "ICP Classify Owner",
      });
      const otherWorkspace = await ensureUserWorkspace({
        email: otherEmail,
        name: "ICP Classify Other",
      });

      const campaign = await createCampaignForWorkspace({
        workspaceId: ownerWorkspace.workspaceId,
        name: "ICP Classify Campaign",
      });

      const generated = await generateIcpProfileForWorkspace({
        workspaceId: ownerWorkspace.workspaceId,
        sourceType: "PRODUCT_DESCRIPTION",
        sourceValue: "LeadBitz runs outbound campaigns with deliverability controls.",
        campaignId: campaign.id,
        generateIcpDraft: async () => ({
          targetIndustries: ["B2B SaaS"],
          companySizeBands: ["11-50"],
          buyerRoles: ["Head of Sales"],
          pains: ["Low reply rates", "Deliverability risk", "Manual campaign management"],
          exclusions: ["Consumer-only companies"],
          valuePropAngles: ["Operator-controlled workflow", "Safer outbound sending"],
          sourceSummary: "Outbound campaign and deliverability workflow platform.",
        }),
      });

      const classification = await classifyProductArchetypeForWorkspace({
        workspaceId: ownerWorkspace.workspaceId,
        campaignId: campaign.id,
        icpVersionId: generated.icpVersionId,
        classify: async () => ({
          archetypeKey: "OUTBOUND_AUTOMATION_SAAS",
          confidence: 0.87,
          evidence: ["Mock classifier: outbound + deliverability signal match."],
        }),
      });

      assert.equal(classification.archetypeKey, "OUTBOUND_AUTOMATION_SAAS");
      assert.equal(classification.confidence, 0.87);
      assert.deepEqual(classification.evidence, [
        "Mock classifier: outbound + deliverability signal match.",
      ]);

      const persisted = await prisma.productArchetypeClassification.findUnique({
        where: {
          id: classification.classificationId,
        },
        select: {
          workspaceId: true,
          campaignId: true,
          archetypeKey: true,
          confidence: true,
          evidenceJson: true,
        },
      });

      assert.ok(persisted);
      if (!persisted) {
        throw new Error("Expected persisted archetype classification row.");
      }
      assert.equal(persisted.workspaceId, ownerWorkspace.workspaceId);
      assert.equal(persisted.campaignId, campaign.id);
      assert.equal(persisted.archetypeKey, "OUTBOUND_AUTOMATION_SAAS");
      assert.equal(persisted.confidence, 0.87);
      assert.deepEqual(persisted.evidenceJson, ["Mock classifier: outbound + deliverability signal match."]);

      await assert.rejects(
        () =>
          classifyProductArchetypeForWorkspace({
            workspaceId: otherWorkspace.workspaceId,
            campaignId: campaign.id,
            icpVersionId: generated.icpVersionId,
            classify: async () => ({
              archetypeKey: "OUTBOUND_AUTOMATION_SAAS",
              confidence: 0.87,
              evidence: [],
            }),
          }),
        (error: unknown) => {
          assert.ok(error instanceof ProductArchetypeNotFoundError);
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
