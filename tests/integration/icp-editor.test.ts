import assert from "node:assert/strict";
import test from "node:test";

import { ensureUserWorkspace } from "../../lib/auth/ensure-user-workspace";
import { createCampaignForWorkspace } from "../../lib/campaigns/campaign-crud";
import { generateIcpProfileForWorkspace } from "../../lib/icp/generate-icp-profile";
import {
  IcpProfileUpdateNotFoundError,
  updateIcpProfileForWorkspace,
} from "../../lib/icp/update-icp-profile";
import { prisma } from "../../lib/prisma";
import { canRunIntegrationDbTests, ensureIntegrationEnv } from "./test-env";

ensureIntegrationEnv();
const canRun = canRunIntegrationDbTests();

if (!canRun) {
  test("icp editor integration", { skip: "DATABASE_URL is missing or placeholder." }, () => {});
} else {
  test("persists ICP editor updates and blocks cross-workspace edits", async () => {
    const ownerEmail = `icp-editor-owner-${Date.now()}@example.com`;
    const otherEmail = `icp-editor-other-${Date.now()}@example.com`;

    try {
      const ownerWorkspace = await ensureUserWorkspace({
        email: ownerEmail,
        name: "ICP Editor Owner",
      });
      const otherWorkspace = await ensureUserWorkspace({
        email: otherEmail,
        name: "ICP Editor Other",
      });

      const campaign = await createCampaignForWorkspace({
        workspaceId: ownerWorkspace.workspaceId,
        name: "ICP Editor Campaign",
      });

      const generated = await generateIcpProfileForWorkspace({
        workspaceId: ownerWorkspace.workspaceId,
        sourceType: "PRODUCT_DESCRIPTION",
        sourceValue: "LeadBitz provides outbound workflow controls.",
        campaignId: campaign.id,
        profileName: "Initial ICP",
        generateIcpDraft: async () => ({
          targetIndustries: ["B2B SaaS"],
          companySizeBands: ["11-50"],
          buyerRoles: ["Founder"],
          pains: ["Inconsistent prospecting"],
          exclusions: ["Consumer-only brands"],
          valuePropAngles: ["Operator safety"],
          sourceSummary: "Initial summary",
        }),
      });

      const updated = await updateIcpProfileForWorkspace({
        workspaceId: ownerWorkspace.workspaceId,
        icpProfileId: generated.icpProfileId,
        profileName: "Updated ICP",
        icp: {
          targetIndustries: ["B2B SaaS", "Agencies"],
          companySizeBands: ["11-50", "51-200"],
          buyerRoles: ["Founder", "Head of Sales"],
          pains: ["Low reply rates", "Deliverability issues"],
          exclusions: ["Consumer-only brands"],
          valuePropAngles: ["Operator safety", "Faster launch workflow"],
          sourceSummary: "Updated summary",
        },
      });

      assert.equal(updated.name, "Updated ICP");
      assert.deepEqual(updated.icp, {
        targetIndustries: ["B2B SaaS", "Agencies"],
        companySizeBands: ["11-50", "51-200"],
        buyerRoles: ["Founder", "Head of Sales"],
        pains: ["Low reply rates", "Deliverability issues"],
        exclusions: ["Consumer-only brands"],
        valuePropAngles: ["Operator safety", "Faster launch workflow"],
        sourceSummary: "Updated summary",
      });

      await assert.rejects(
        () =>
          updateIcpProfileForWorkspace({
            workspaceId: otherWorkspace.workspaceId,
            icpProfileId: generated.icpProfileId,
            profileName: "Should fail",
            icp: {
              targetIndustries: ["Bad update"],
              companySizeBands: ["11-50"],
              buyerRoles: ["Owner"],
              pains: ["Bad data"],
              exclusions: ["none"],
              valuePropAngles: ["none"],
              sourceSummary: "Cross-workspace attempt",
            },
          }),
        (error: unknown) => {
          assert.ok(error instanceof IcpProfileUpdateNotFoundError);
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
