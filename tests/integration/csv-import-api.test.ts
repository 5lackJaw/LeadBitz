import assert from "node:assert/strict";
import test from "node:test";

import { ensureUserWorkspace } from "../../lib/auth/ensure-user-workspace";
import { createCampaignForWorkspace } from "../../lib/campaigns/campaign-crud";
import { importCsvLeadsForWorkspace } from "../../lib/leads/csv-import";
import { prisma } from "../../lib/prisma";
import { canRunIntegrationDbTests, ensureIntegrationEnv } from "./test-env";

ensureIntegrationEnv();
const canRun = canRunIntegrationDbTests();

if (!canRun) {
  test("csv import api integration", { skip: "DATABASE_URL is missing or placeholder." }, () => {});
} else {
  test("imports CSV leads with dedupe, suppression, and provenance", async () => {
    const ownerEmail = `csv-import-owner-${Date.now()}@example.com`;

    try {
      const workspace = await ensureUserWorkspace({
        email: ownerEmail,
        name: "CSV Import Owner",
      });

      const campaign = await createCampaignForWorkspace({
        workspaceId: workspace.workspaceId,
        name: "CSV Import Campaign",
      });

      const existingLeadEmail = `existing-${Date.now()}@example.com`;
      const suppressedEmail = `suppressed-${Date.now()}@example.com`;

      const existingLead = await prisma.lead.create({
        data: {
          workspaceId: workspace.workspaceId,
          email: existingLeadEmail,
          firstName: "Existing",
          lastName: "Lead",
        },
      });

      await prisma.suppression.create({
        data: {
          workspaceId: workspace.workspaceId,
          email: suppressedEmail,
          reason: "UNSUBSCRIBED",
          source: "manual",
        },
      });

      const newLeadEmail = `new-${Date.now()}@example.com`;
      const csvText = [
        "email,first name,last name,title,company,domain",
        `${newLeadEmail},Ada,Lovelace,Founder,Acme,acme.com`,
        `${suppressedEmail},Blocked,User,VP,BlockedCo,blocked.co`,
        `${newLeadEmail},Dup,User,Founder,Acme,acme.com`,
        "not-an-email,Bad,Email,Role,BadCo,bad.co",
        `${existingLeadEmail},Old,Lead,Head of Sales,OldCo,old.co`,
        ",Missing,Email,RevOps,NoEmail,noemail.co",
      ].join("\n");

      const result = await importCsvLeadsForWorkspace({
        workspaceId: workspace.workspaceId,
        campaignId: campaign.id,
        csvText,
      });

      assert.equal(result.importedCount, 1);
      assert.equal(result.linkedExistingCount, 1);
      assert.equal(result.suppressedCount, 1);
      assert.equal(result.duplicateCount, 1);
      assert.equal(result.invalidCount, 2);
      assert.equal(result.outcomes.length, 6);

      const createdLead = await prisma.lead.findUnique({
        where: {
          workspaceId_email: {
            workspaceId: workspace.workspaceId,
            email: newLeadEmail,
          },
        },
      });
      assert.ok(createdLead);

      const campaignLeads = await prisma.campaignLead.findMany({
        where: {
          campaignId: campaign.id,
        },
      });
      assert.equal(campaignLeads.length, 2);
      assert.equal(
        campaignLeads.some((row) => row.leadId === existingLead.id),
        true,
      );

      const leadSource = await prisma.leadSource.findUnique({
        where: {
          workspaceId_name: {
            workspaceId: workspace.workspaceId,
            name: "csv_import",
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
