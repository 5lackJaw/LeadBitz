"use client";

import { CampaignStatus } from "@prisma/client";
import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";

type CampaignViewModel = {
  id: string;
  inboxConnectionId: string | null;
  name: string;
  status: CampaignStatus;
  messagingRules: string | null;
  discoveryRules: string | null;
  wizardState: unknown;
  icpProfileId: string | null;
  icpProfileName: string | null;
  createdAt: string;
  updatedAt: string;
};

type CampaignsClientProps = {
  initialCampaigns: CampaignViewModel[];
};

type CampaignApiResponse = {
  campaign?: CampaignViewModel;
  error?: string;
};

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

function getStatusClassName(status: CampaignStatus): string {
  if (status === CampaignStatus.ACTIVE || status === CampaignStatus.COMPLETED) {
    return "lb-status lb-status-success";
  }

  if (status === CampaignStatus.PAUSED) {
    return "lb-status lb-status-warning";
  }

  if (status === CampaignStatus.ARCHIVED) {
    return "lb-status lb-status-danger";
  }

  return "lb-status lb-status-info";
}

export function CampaignsClient({ initialCampaigns }: CampaignsClientProps) {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [newCampaignName, setNewCampaignName] = useState("");
  const [renameValues, setRenameValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(initialCampaigns.map((campaign) => [campaign.id, campaign.name])),
  );
  const [isCreating, setIsCreating] = useState(false);
  const [renamingCampaignId, setRenamingCampaignId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasCampaigns = campaigns.length > 0;

  const campaignCountLabel = useMemo(() => {
    if (!hasCampaigns) {
      return "No campaigns yet";
    }

    if (campaigns.length === 1) {
      return "1 campaign";
    }

    return `${campaigns.length} campaigns`;
  }, [campaigns.length, hasCampaigns]);

  async function onCreateCampaign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage(null);
    setErrorMessage(null);
    setIsCreating(true);

    try {
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name: newCampaignName,
        }),
      });

      const data = (await response.json()) as CampaignApiResponse;

      if (!response.ok || !data.campaign) {
        throw new Error(data.error ?? "Failed to create campaign.");
      }

      const created = data.campaign;
      setCampaigns((current) => [created, ...current]);
      setRenameValues((current) => ({
        ...current,
        [created.id]: created.name,
      }));
      setNewCampaignName("");
      setStatusMessage("Campaign created.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to create campaign.");
    } finally {
      setIsCreating(false);
    }
  }

  async function onRenameCampaign(event: FormEvent<HTMLFormElement>, campaignId: string) {
    event.preventDefault();
    setStatusMessage(null);
    setErrorMessage(null);
    setRenamingCampaignId(campaignId);

    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name: renameValues[campaignId] ?? "",
        }),
      });

      const data = (await response.json()) as CampaignApiResponse;

      if (!response.ok || !data.campaign) {
        throw new Error(data.error ?? "Failed to rename campaign.");
      }

      const renamedCampaign = data.campaign;

      setCampaigns((current) =>
        current.map((campaign) => (campaign.id === campaignId ? renamedCampaign : campaign)),
      );
      setRenameValues((current) => ({
        ...current,
        [campaignId]: renamedCampaign.name,
      }));
      setStatusMessage("Campaign renamed.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to rename campaign.");
    } finally {
      setRenamingCampaignId(null);
    }
  }

  return (
    <>
      <section className="lb-panel">
        <div className="lb-row">
          <div>
            <h1 className="lb-title">Campaigns</h1>
            <p className="lb-subtitle">Create and manage draft campaigns for your workspace.</p>
          </div>
          <div className="lb-row" style={{ justifyContent: "flex-end", gap: "12px" }}>
            <span className="lb-status lb-status-info" aria-label="Campaign count">
              {campaignCountLabel}
            </span>
            <Link className="lb-button lb-button-secondary" href="/app/campaigns/new">
              Open wizard
            </Link>
          </div>
        </div>
        <form
          onSubmit={onCreateCampaign}
          className="lb-form-grid"
          style={{ marginTop: "16px", gridTemplateColumns: "1fr auto" }}
        >
          <label className="lb-field">
            <span className="lb-label">Campaign name</span>
            <input
              className="lb-input"
              name="campaignName"
              type="text"
              value={newCampaignName}
              onChange={(event) => setNewCampaignName(event.target.value)}
              placeholder="Q2 founder outbound"
              maxLength={120}
              required
            />
          </label>
          <button className="lb-button lb-button-primary" type="submit" disabled={isCreating}>
            {isCreating ? "Creating..." : "Create campaign"}
          </button>
        </form>
        {statusMessage ? (
          <p className="lb-alert lb-alert-success" role="status" style={{ marginTop: "12px" }}>
            {statusMessage}
          </p>
        ) : null}
        {errorMessage ? (
          <p className="lb-alert lb-alert-danger" role="alert" style={{ marginTop: "12px" }}>
            {errorMessage}
          </p>
        ) : null}
      </section>

      <section className="lb-table-wrap">
        <table className="lb-table">
          <thead>
            <tr>
              <th scope="col">Campaign</th>
              <th scope="col">Status</th>
              <th scope="col">Updated</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {hasCampaigns ? (
              campaigns.map((campaign) => {
                const isRenaming = renamingCampaignId === campaign.id;

                return (
                  <tr key={campaign.id}>
                    <td>
                      <form
                        onSubmit={(event) => onRenameCampaign(event, campaign.id)}
                        className="lb-row"
                        style={{ justifyContent: "flex-start", gap: "8px", flexWrap: "nowrap" }}
                      >
                        <input
                          className="lb-input"
                          aria-label={`Rename ${campaign.name}`}
                          value={renameValues[campaign.id] ?? campaign.name}
                          onChange={(event) =>
                            setRenameValues((current) => ({
                              ...current,
                              [campaign.id]: event.target.value,
                            }))
                          }
                          maxLength={120}
                          required
                        />
                        <button className="lb-button lb-button-secondary" type="submit" disabled={isRenaming}>
                          {isRenaming ? "Saving..." : "Rename"}
                        </button>
                      </form>
                    </td>
                    <td>
                      <span className={getStatusClassName(campaign.status)}>{campaign.status}</span>
                    </td>
                    <td>{dateTimeFormatter.format(new Date(campaign.updatedAt))}</td>
                    <td>
                      <div className="lb-row" style={{ justifyContent: "flex-start", gap: "8px" }}>
                        <Link className="lb-link lb-link-accent" href={`/app/campaigns/${campaign.id}`}>
                          Open
                        </Link>
                        <Link className="lb-link" href={`/app/campaigns/new?campaignId=${campaign.id}`} prefetch={false}>
                          Resume wizard
                        </Link>
                        <code style={{ fontFamily: "var(--font-ui-mono)", color: "var(--ui-fg-muted)" }}>
                          {campaign.id.slice(0, 8)}
                        </code>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} style={{ color: "var(--ui-fg-secondary)" }}>
                  No campaigns created yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </>
  );
}
