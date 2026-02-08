import { prisma } from "@/lib/prisma";

export class CampaignLeadsNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CampaignLeadsNotFoundError";
  }
}

function normalizeRequiredId(value: string, fieldName: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new Error(`${fieldName} is required.`);
  }
  return normalized;
}

export type CampaignLeadListItem = {
  campaignLeadId: string;
  leadId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  title: string | null;
  companyName: string | null;
  companyDomain: string | null;
  createdAt: Date;
};

export async function listCampaignLeadsForWorkspace(input: {
  workspaceId: string;
  campaignId: string;
}): Promise<CampaignLeadListItem[]> {
  const workspaceId = normalizeRequiredId(input.workspaceId, "workspaceId");
  const campaignId = normalizeRequiredId(input.campaignId, "campaignId");

  const campaign = await prisma.campaign.findFirst({
    where: {
      id: campaignId,
      workspaceId,
    },
    select: {
      id: true,
    },
  });

  if (!campaign) {
    throw new CampaignLeadsNotFoundError("Campaign not found.");
  }

  const rows = await prisma.campaignLead.findMany({
    where: {
      campaignId,
      lead: {
        workspaceId,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      createdAt: true,
      lead: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          title: true,
          companyName: true,
          companyDomain: true,
        },
      },
    },
  });

  return rows.map((row) => ({
    campaignLeadId: row.id,
    leadId: row.lead.id,
    email: row.lead.email,
    firstName: row.lead.firstName,
    lastName: row.lead.lastName,
    title: row.lead.title,
    companyName: row.lead.companyName,
    companyDomain: row.lead.companyDomain,
    createdAt: row.createdAt,
  }));
}
