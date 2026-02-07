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

      const initialActiveVersion = await prisma.icpVersion.findFirst({
        where: {
          campaignId: campaign.id,
          isActive: true,
        },
        select: {
          id: true,
          source: true,
          title: true,
          icpJson: true,
        },
      });

      assert.ok(initialActiveVersion);
      if (!initialActiveVersion) {
        throw new Error("Expected initial ICP version for campaign.");
      }
      assert.equal(initialActiveVersion.source, "MANUAL");
      assert.equal(initialActiveVersion.title, "Manual Draft");

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

      const updatedActiveVersion = await prisma.icpVersion.findFirst({
        where: {
          campaignId: campaign.id,
          isActive: true,
        },
        select: {
          id: true,
          source: true,
          title: true,
          icpJson: true,
        },
      });

      assert.ok(updatedActiveVersion);
      if (!updatedActiveVersion) {
        throw new Error("Expected updated active ICP version.");
      }
      assert.equal(updatedActiveVersion.id, initialActiveVersion.id);
      assert.equal(updatedActiveVersion.source, "MANUAL");
      assert.equal(updatedActiveVersion.title, "Updated ICP");
      assert.deepEqual(updatedActiveVersion.icpJson, updated.icp);

      await prisma.icpVersion.updateMany({
        where: {
          campaignId: campaign.id,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });

      const templateVersion = await prisma.icpVersion.create({
        data: {
          workspaceId: ownerWorkspace.workspaceId,
          campaignId: campaign.id,
          source: "TEMPLATE",
          title: "Template v1",
          icpJson: {
            templateApplied: true,
          },
          isActive: true,
        },
      });

      const secondUpdate = await updateIcpProfileForWorkspace({
        workspaceId: ownerWorkspace.workspaceId,
        icpProfileId: generated.icpProfileId,
        profileName: "Manual Edit v2",
        icp: {
          targetIndustries: ["B2B SaaS", "Services"],
          companySizeBands: ["51-200", "201-500"],
          buyerRoles: ["VP Sales", "Revenue Ops"],
          pains: ["Reply quality", "Pipeline gaps", "Team bandwidth"],
          exclusions: ["Consumer-only brands"],
          valuePropAngles: ["Deliverability-first outbound", "Operator control"],
          sourceSummary: "Second update summary",
        },
      });

      const activeAfterTemplate = await prisma.icpVersion.findFirst({
        where: {
          campaignId: campaign.id,
          isActive: true,
        },
        select: {
          id: true,
          source: true,
          title: true,
          icpJson: true,
        },
      });

      assert.ok(activeAfterTemplate);
      if (!activeAfterTemplate) {
        throw new Error("Expected active manual version after template fallback.");
      }
      assert.notEqual(activeAfterTemplate.id, templateVersion.id);
      assert.notEqual(activeAfterTemplate.id, updatedActiveVersion.id);
      assert.equal(activeAfterTemplate.source, "MANUAL");
      assert.equal(activeAfterTemplate.title, "Manual Edit v2");
      assert.deepEqual(activeAfterTemplate.icpJson, secondUpdate.icp);

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
