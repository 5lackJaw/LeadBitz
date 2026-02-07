import assert from "node:assert/strict";
import test from "node:test";

import { ensureUserWorkspace } from "../../lib/auth/ensure-user-workspace";
import { createCampaignForWorkspace } from "../../lib/campaigns/campaign-crud";
import { generateIcpProfileForWorkspace } from "../../lib/icp/generate-icp-profile";
import {
  IcpCenterNotFoundError,
  listIcpVersionsForCampaign,
  setActiveIcpVersionForCampaign,
} from "../../lib/icp/icp-center";
import { scoreIcpVersionForWorkspace } from "../../lib/icp/score-icp-version";
import { prisma } from "../../lib/prisma";
import { canRunIntegrationDbTests, ensureIntegrationEnv } from "./test-env";

ensureIntegrationEnv();
const canRun = canRunIntegrationDbTests();

if (!canRun) {
  test("icp center integration", { skip: "DATABASE_URL is missing or placeholder." }, () => {});
} else {
  test("lists versions with latest score and allows selecting active version", async () => {
    const ownerEmail = `icp-center-owner-${Date.now()}@example.com`;
    const otherEmail = `icp-center-other-${Date.now()}@example.com`;

    try {
      const ownerWorkspace = await ensureUserWorkspace({
        email: ownerEmail,
        name: "ICP Center Owner",
      });
      const otherWorkspace = await ensureUserWorkspace({
        email: otherEmail,
        name: "ICP Center Other",
      });

      const campaign = await createCampaignForWorkspace({
        workspaceId: ownerWorkspace.workspaceId,
        name: "ICP Center Campaign",
      });

      const generated = await generateIcpProfileForWorkspace({
        workspaceId: ownerWorkspace.workspaceId,
        sourceType: "WEBSITE_URL",
        sourceValue: "https://leadbitz.com",
        campaignId: campaign.id,
      });

      const firstVersionId = generated.icpVersionId ?? "";
      assert.ok(firstVersionId);

      const secondVersion = await prisma.icpVersion.create({
        data: {
          workspaceId: ownerWorkspace.workspaceId,
          campaignId: campaign.id,
          source: "MANUAL",
          title: "Manual revision",
          icpJson: {
            targetIndustries: ["B2B SaaS", "Agencies"],
            companySizeBands: ["11-50", "51-200"],
            buyerRoles: ["Founder", "Head of Sales"],
            pains: ["Low reply rates", "Deliverability risk", "Manual campaign ops"],
            exclusions: ["B2C-only companies"],
            valuePropAngles: ["Safer outbound controls", "Operator-first workflows"],
            sourceSummary: "Manual revision for ICP center testing.",
          },
          isActive: false,
        },
        select: {
          id: true,
        },
      });

      await scoreIcpVersionForWorkspace({
        workspaceId: ownerWorkspace.workspaceId,
        campaignId: campaign.id,
        icpVersionId: secondVersion.id,
      });

      const listed = await listIcpVersionsForCampaign({
        workspaceId: ownerWorkspace.workspaceId,
        campaignId: campaign.id,
      });

      assert.equal(listed.length, 2);
      const listedSecond = listed.find((item) => item.id === secondVersion.id);
      assert.ok(listedSecond);
      if (!listedSecond) {
        throw new Error("Expected second ICP version in list.");
      }
      assert.ok(listedSecond.latestScore);
      assert.equal(typeof listedSecond.latestScore?.score, "number");

      await setActiveIcpVersionForCampaign({
        workspaceId: ownerWorkspace.workspaceId,
        campaignId: campaign.id,
        icpVersionId: secondVersion.id,
      });

      const activeVersions = await prisma.icpVersion.findMany({
        where: {
          workspaceId: ownerWorkspace.workspaceId,
          campaignId: campaign.id,
          isActive: true,
        },
        select: {
          id: true,
        },
      });

      assert.equal(activeVersions.length, 1);
      assert.equal(activeVersions[0]?.id, secondVersion.id);

      await assert.rejects(
        () =>
          setActiveIcpVersionForCampaign({
            workspaceId: otherWorkspace.workspaceId,
            campaignId: campaign.id,
            icpVersionId: secondVersion.id,
          }),
        (error: unknown) => {
          assert.ok(error instanceof IcpCenterNotFoundError);
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
