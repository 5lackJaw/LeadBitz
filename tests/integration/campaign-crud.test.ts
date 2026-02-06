import assert from "node:assert/strict";
import test from "node:test";

import { ensureUserWorkspace } from "../../lib/auth/ensure-user-workspace";
import {
  CampaignNotFoundError,
  CampaignValidationError,
  createCampaignForWorkspace,
  listCampaignsForWorkspace,
  renameCampaignForWorkspace,
} from "../../lib/campaigns/campaign-crud";
import { prisma } from "../../lib/prisma";
import { canRunIntegrationDbTests, ensureIntegrationEnv } from "./test-env";

ensureIntegrationEnv();
const canRun = canRunIntegrationDbTests();

if (!canRun) {
  test("campaign CRUD integration", { skip: "DATABASE_URL is missing or placeholder." }, () => {});
} else {
  test("creates, lists, and renames campaigns with workspace scoping", async () => {
    const ownerEmail = `campaign-owner-${Date.now()}@example.com`;
    const otherEmail = `campaign-other-${Date.now()}@example.com`;

    try {
      const ownerWorkspace = await ensureUserWorkspace({
        email: ownerEmail,
        name: "Campaign Owner",
      });
      const otherWorkspace = await ensureUserWorkspace({
        email: otherEmail,
        name: "Campaign Other",
      });

      await assert.rejects(
        () =>
          createCampaignForWorkspace({
            workspaceId: ownerWorkspace.workspaceId,
            name: "   ",
          }),
        (error: unknown) => {
          assert.ok(error instanceof CampaignValidationError);
          return true;
        },
      );

      const createdCampaign = await createCampaignForWorkspace({
        workspaceId: ownerWorkspace.workspaceId,
        name: "  Q2 founder campaign  ",
      });

      assert.equal(createdCampaign.name, "Q2 founder campaign");

      const campaigns = await listCampaignsForWorkspace(ownerWorkspace.workspaceId);

      assert.equal(campaigns.length, 1);
      assert.equal(campaigns[0]?.id, createdCampaign.id);
      assert.equal(campaigns[0]?.name, "Q2 founder campaign");

      const renamedCampaign = await renameCampaignForWorkspace({
        workspaceId: ownerWorkspace.workspaceId,
        campaignId: createdCampaign.id,
        name: "Q2 founder campaign v2",
      });

      assert.equal(renamedCampaign.name, "Q2 founder campaign v2");

      await assert.rejects(
        () =>
          renameCampaignForWorkspace({
            workspaceId: otherWorkspace.workspaceId,
            campaignId: createdCampaign.id,
            name: "Should fail",
          }),
        (error: unknown) => {
          assert.ok(error instanceof CampaignNotFoundError);
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
