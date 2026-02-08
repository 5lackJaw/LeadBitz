import assert from "node:assert/strict";
import test from "node:test";

import { ensureUserWorkspace } from "../../lib/auth/ensure-user-workspace";
import { createCampaignForWorkspace } from "../../lib/campaigns/campaign-crud";
import { importManualLeadsForWorkspace } from "../../lib/leads/manual-import";
import { prisma } from "../../lib/prisma";
import { canRunIntegrationDbTests, ensureIntegrationEnv } from "./test-env";

ensureIntegrationEnv();
const canRun = canRunIntegrationDbTests();

if (!canRun) {
  test("manual import api integration", { skip: "DATABASE_URL is missing or placeholder." }, () => {});
} else {
  test("imports manual leads with dedupe, suppression, and provenance", async () => {
    const ownerEmail = `manual-import-owner-${Date.now()}@example.com`;

    try {
      const workspace = await ensureUserWorkspace({
        email: ownerEmail,
        name: "Manual Import Owner",
      });

      const campaign = await createCampaignForWorkspace({
        workspaceId: workspace.workspaceId,
        name: "Manual Import Campaign",
      });

      const existingLeadEmail = `existing-manual-${Date.now()}@example.com`;
      const suppressedEmail = `suppressed-manual-${Date.now()}@example.com`;

      const existingLead = await prisma.lead.create({
        data: {
          workspaceId: workspace.workspaceId,
          email: existingLeadEmail,
          firstName: "Existing",
        },
      });

      await prisma.suppression.create({
        data: {
          workspaceId: workspace.workspaceId,
          email: suppressedEmail,
          reason: "UNSUBSCRIBED",
        },
      });

      const newLeadEmail = `manual-new-${Date.now()}@example.com`;
      const rows = [
        {
          email: newLeadEmail,
          firstName: "Ada",
          lastName: "Lovelace",
          title: "Founder",
          companyName: "Acme",
          companyDomain: "acme.com",
        },
        {
          email: suppressedEmail,
          firstName: "Suppressed",
        },
        {
          email: newLeadEmail,
          firstName: "Duplicate",
        },
        {
          email: "bad-email-format",
          firstName: "Invalid",
        },
        {
          email: existingLeadEmail,
          firstName: "Existing Updated",
          companyName: "Existing Co",
        },
        {
          firstName: "Missing Email",
        },
      ];

      const result = await importManualLeadsForWorkspace({
        workspaceId: workspace.workspaceId,
        campaignId: campaign.id,
        rows,
      });

      assert.equal(result.importedCount, 1);
      assert.equal(result.linkedExistingCount, 1);
      assert.equal(result.suppressedCount, 1);
      assert.equal(result.duplicateCount, 1);
      assert.equal(result.invalidCount, 2);
      assert.equal(result.outcomes.length, 6);

      const newLead = await prisma.lead.findUnique({
        where: {
          workspaceId_email: {
            workspaceId: workspace.workspaceId,
            email: newLeadEmail,
          },
        },
      });
      assert.ok(newLead);

      const campaignLeads = await prisma.campaignLead.findMany({
        where: {
          campaignId: campaign.id,
        },
      });
      assert.equal(campaignLeads.length, 2);
      assert.equal(campaignLeads.some((row) => row.leadId === existingLead.id), true);

      const leadSource = await prisma.leadSource.findUnique({
        where: {
          workspaceId_name: {
            workspaceId: workspace.workspaceId,
            name: "manual_import",
          },
        },
      });
      assert.ok(leadSource);

      const provenanceRows = await prisma.leadFieldProvenance.findMany({
        where: {
          leadSourceId: leadSource?.id,
        },
      });
      assert.equal(provenanceRows.length > 0, true);
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
