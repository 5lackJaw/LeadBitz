"use client";

import { CampaignStatus, InboxConnectionStatus } from "@prisma/client";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

type CampaignOverviewViewModel = {
  id: string;
  name: string;
  status: CampaignStatus;
  inboxConnectionId: string | null;
  inboxEmail: string | null;
  messagingRules: string | null;
  discoveryRules: string | null;
  icpProfileId: string | null;
  icpProfileName: string | null;
  icpSummary: unknown;
  updatedAt: string;
};

type InboxOption = {
  id: string;
  email: string;
  status: InboxConnectionStatus;
};

type CampaignOverviewClientProps = {
  campaign: CampaignOverviewViewModel;
  inboxConnections: InboxOption[];
};

type CampaignApiResponse = {
  campaign?: {
    id: string;
    inboxConnectionId: string | null;
    name: string;
    status: CampaignStatus;
    messagingRules: string | null;
    discoveryRules: string | null;
    wizardState: unknown;
    icpProfileId: string | null;
    icpProfileName: string | null;
    inboxEmail: string | null;
    icpSummary: unknown;
    createdAt: string;
    updatedAt: string;
  };
  error?: string;
};

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

function isIcpSummaryObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export function CampaignOverviewClient({ campaign, inboxConnections }: CampaignOverviewClientProps) {
  const [name, setName] = useState(campaign.name);
  const [inboxConnectionId, setInboxConnectionId] = useState(campaign.inboxConnectionId ?? "");
  const [messagingRules, setMessagingRules] = useState(campaign.messagingRules ?? "");
  const [discoveryRules, setDiscoveryRules] = useState(campaign.discoveryRules ?? "");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const lifecycleStatuses = useMemo(
    () => [CampaignStatus.DRAFT, CampaignStatus.ACTIVE, CampaignStatus.PAUSED, CampaignStatus.COMPLETED],
    [],
  );

  const icpSummary = isIcpSummaryObject(campaign.icpSummary) ? campaign.icpSummary : null;

  async function onSaveControls(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage(null);
    setErrorMessage(null);
    setIsSaving(true);

    try {
      const response = await fetch(`/api/campaigns/${campaign.id}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name,
          inboxConnectionId: inboxConnectionId || null,
          messagingRules,
          discoveryRules,
        }),
      });

      const data = (await response.json()) as CampaignApiResponse;

      if (!response.ok || !data.campaign) {
        throw new Error(data.error ?? "Failed to save campaign controls.");
      }

      setName(data.campaign.name);
      setInboxConnectionId(data.campaign.inboxConnectionId ?? "");
      setMessagingRules(data.campaign.messagingRules ?? "");
      setDiscoveryRules(data.campaign.discoveryRules ?? "");
      setStatusMessage("Campaign controls saved.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to save campaign controls.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <section className="lb-panel">
        <div className="lb-row">
          <div>
            <h2 className="lb-title" style={{ fontSize: "20px", lineHeight: "28px" }}>
              {name}
            </h2>
            <p className="lb-subtitle">
              Status: <span className={getStatusClassName(campaign.status)}>{campaign.status}</span>
            </p>
          </div>
          <div className="lb-row" style={{ justifyContent: "flex-end", gap: "10px" }}>
            <Link className="lb-button lb-button-secondary" href={`/app/campaigns/${campaign.id}/discovery`}>
              Discovery
            </Link>
            <Link className="lb-button lb-button-secondary" href={`/app/campaigns/${campaign.id}/candidates`}>
              Candidates
            </Link>
            <Link className="lb-button lb-button-secondary" href={`/app/campaigns/${campaign.id}/sequence`}>
              Sequence
            </Link>
            <button className="lb-button lb-button-primary" type="button" disabled>
              Review & Launch
            </button>
          </div>
        </div>
      </section>

      <section className="lb-panel">
        <h2 className="lb-title" style={{ fontSize: "20px", lineHeight: "28px" }}>
          Campaign Control Surfaces
        </h2>
        <p className="lb-subtitle" style={{ marginTop: "8px" }}>
          Configure campaign-level rules now so downstream phases can enforce them.
        </p>

        <form onSubmit={onSaveControls} className="lb-form-grid" style={{ marginTop: "16px" }}>
          <label className="lb-field">
            <span className="lb-label">Campaign name</span>
            <input className="lb-input" value={name} onChange={(event) => setName(event.target.value)} maxLength={120} />
          </label>

          <label className="lb-field">
            <span className="lb-label">Connected inbox</span>
            <select
              className="lb-input"
              value={inboxConnectionId}
              onChange={(event) => setInboxConnectionId(event.target.value)}
            >
              <option value="">No inbox selected</option>
              {inboxConnections.map((inbox) => (
                <option key={inbox.id} value={inbox.id}>
                  {inbox.email} ({inbox.status})
                </option>
              ))}
            </select>
          </label>

          <label className="lb-field">
            <span className="lb-label">Messaging Rules</span>
            <textarea
              className="lb-input"
              style={{ minHeight: "120px", resize: "vertical" }}
              placeholder="Tone, do/don't constraints, negative prompts..."
              value={messagingRules}
              onChange={(event) => setMessagingRules(event.target.value)}
            />
          </label>

          <label className="lb-field">
            <span className="lb-label">Discovery Rules</span>
            <textarea
              className="lb-input"
              style={{ minHeight: "120px", resize: "vertical" }}
              placeholder="Exclusions, must-have signals, disallowed segments..."
              value={discoveryRules}
              onChange={(event) => setDiscoveryRules(event.target.value)}
            />
          </label>

          <button className="lb-button lb-button-primary" type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save controls"}
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

      <section className="lb-panel">
        <h2 className="lb-title" style={{ fontSize: "20px", lineHeight: "28px" }}>
          ICP Summary
        </h2>
        {campaign.icpProfileId ? (
          <div style={{ marginTop: "10px", display: "grid", gap: "8px" }}>
            <p className="lb-subtitle">Profile: {campaign.icpProfileName ?? campaign.icpProfileId}</p>
            <pre className="lb-input" style={{ whiteSpace: "pre-wrap", minHeight: "120px" }}>
              {JSON.stringify(icpSummary, null, 2)}
            </pre>
          </div>
        ) : (
          <p className="lb-subtitle" style={{ marginTop: "10px" }}>
            No ICP linked yet. Run or resume the wizard to generate and link an ICP profile.
          </p>
        )}
      </section>

      <section className="lb-panel">
        <h2 className="lb-title" style={{ fontSize: "20px", lineHeight: "28px" }}>
          Status Lifecycle Placeholder
        </h2>
        <div className="lb-row" style={{ marginTop: "10px", justifyContent: "flex-start", gap: "8px" }}>
          {lifecycleStatuses.map((status) => (
            <span key={status} className={getStatusClassName(status)}>
              {status}
            </span>
          ))}
        </div>
      </section>
    </>
  );
}
