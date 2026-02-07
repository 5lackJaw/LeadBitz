import assert from "node:assert/strict";
import test from "node:test";

import { createCampaignForWorkspace } from "../../lib/campaigns/campaign-crud";
import { ensureUserWorkspace } from "../../lib/auth/ensure-user-workspace";
import {
  IcpDraft,
  IcpGenerationNotFoundError,
  generateIcpProfileForWorkspace,
} from "../../lib/icp/generate-icp-profile";
import { prisma } from "../../lib/prisma";
import { canRunIntegrationDbTests, ensureIntegrationEnv } from "./test-env";

ensureIntegrationEnv();
const canRun = canRunIntegrationDbTests();

if (!canRun) {
  test("icp generate integration", { skip: "DATABASE_URL is missing or placeholder." }, () => {});
} else {
  test("generates ICP using mocked AI and persists icp_profile row", async () => {
    const ownerEmail = `icp-owner-${Date.now()}@example.com`;
    const otherEmail = `icp-other-${Date.now()}@example.com`;

    const mockedIcp: IcpDraft = {
      targetIndustries: ["B2B SaaS"],
      companySizeBands: ["11-50"],
      buyerRoles: ["Founder"],
      pains: ["Low reply rates"],
      exclusions: ["Consumer apps"],
      valuePropAngles: ["Deliverability-first outbound"],
      sourceSummary: "Mocked AI summary",
    };

    try {
      const ownerWorkspace = await ensureUserWorkspace({
        email: ownerEmail,
        name: "ICP Owner",
      });

      const otherWorkspace = await ensureUserWorkspace({
        email: otherEmail,
        name: "ICP Other",
      });

      const campaign = await createCampaignForWorkspace({
        workspaceId: ownerWorkspace.workspaceId,
        name: "ICP Campaign",
      });

      let mockCalls = 0;
      const generated = await generateIcpProfileForWorkspace({
        workspaceId: ownerWorkspace.workspaceId,
        sourceType: "WEBSITE_URL",
        sourceValue: "https://leadbitz.com",
        campaignId: campaign.id,
        profileName: "Website ICP Mock",
        generateIcpDraft: async (input) => {
          mockCalls += 1;
          assert.equal(input.sourceType, "WEBSITE_URL");
          assert.equal(input.sourceValue, "https://leadbitz.com");
          return mockedIcp;
        },
      });

      assert.equal(mockCalls, 1);
      assert.equal(generated.campaignId, campaign.id);
      assert.ok(generated.icpVersionId);
      assert.deepEqual(generated.icp, mockedIcp);

      const savedProfile = await prisma.icpProfile.findUnique({
        where: {
          id: generated.icpProfileId,
        },
        select: {
          id: true,
          workspaceId: true,
          name: true,
          sourceType: true,
          sourceValue: true,
          icp: true,
        },
      });

      assert.ok(savedProfile);
      if (!savedProfile) {
        throw new Error("Expected ICP profile to be saved.");
      }
      assert.equal(savedProfile.workspaceId, ownerWorkspace.workspaceId);
      assert.equal(savedProfile.name, "Website ICP Mock");
      assert.equal(savedProfile.sourceType, "WEBSITE_URL");
      assert.equal(savedProfile.sourceValue, "https://leadbitz.com");
      assert.deepEqual(savedProfile.icp, mockedIcp);

      const updatedCampaign = await prisma.campaign.findUnique({
        where: {
          id: campaign.id,
        },
        select: {
          icpProfileId: true,
        },
      });

      assert.equal(updatedCampaign?.icpProfileId, generated.icpProfileId);

      const activeVersion = await prisma.icpVersion.findFirst({
        where: {
          campaignId: campaign.id,
          isActive: true,
        },
        select: {
          id: true,
          workspaceId: true,
          source: true,
          title: true,
          icpJson: true,
        },
      });

      assert.ok(activeVersion);
      if (!activeVersion) {
        throw new Error("Expected active ICP version for campaign.");
      }
      assert.equal(activeVersion.id, generated.icpVersionId);
      assert.equal(activeVersion.workspaceId, ownerWorkspace.workspaceId);
      assert.equal(activeVersion.source, "WEBSITE");
      assert.equal(activeVersion.title, "Website Draft");
      assert.deepEqual(activeVersion.icpJson, mockedIcp);

      await assert.rejects(
        () =>
          generateIcpProfileForWorkspace({
            workspaceId: otherWorkspace.workspaceId,
            sourceType: "PRODUCT_DESCRIPTION",
            sourceValue: "Mock description",
            campaignId: campaign.id,
            generateIcpDraft: async () => mockedIcp,
          }),
        (error: unknown) => {
          assert.ok(error instanceof IcpGenerationNotFoundError);
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
        select: { id: true },
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
