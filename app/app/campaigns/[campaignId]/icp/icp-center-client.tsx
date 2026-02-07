"use client";

import { IcpVersionSource } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type IcpVersionViewModel = {
  id: string;
  title: string;
  source: IcpVersionSource;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  latestScore: {
    id: string;
    score: number;
    tier: string;
    computedAt: string;
  } | null;
};

type IcpCenterClientProps = {
  campaignId: string;
  versions: IcpVersionViewModel[];
};

type IcpScoreResponse = {
  score?: number;
  tier?: string;
  error?: string;
};

export function IcpCenterClient({ campaignId, versions }: IcpCenterClientProps) {
  const router = useRouter();
  const [isSavingActiveId, setIsSavingActiveId] = useState<string | null>(null);
  const [isScoringId, setIsScoringId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onSetActive(icpVersionId: string) {
    setStatusMessage(null);
    setErrorMessage(null);
    setIsSavingActiveId(icpVersionId);

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/icp/active`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          icpVersionId,
        }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to set active ICP version.");
      }

      setStatusMessage("Active ICP version updated.");
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to set active ICP version.");
    } finally {
      setIsSavingActiveId(null);
    }
  }

  async function onRescore(icpVersionId: string) {
    setStatusMessage(null);
    setErrorMessage(null);
    setIsScoringId(icpVersionId);

    try {
      const response = await fetch("/api/icp/score", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          campaignId,
          icpVersionId,
        }),
      });

      const data = (await response.json()) as IcpScoreResponse;
      if (!response.ok || typeof data.score !== "number" || typeof data.tier !== "string") {
        throw new Error(data.error ?? "Failed to score ICP version.");
      }

      setStatusMessage(`Re-scored ICP version: ${data.score}/100 (${data.tier}).`);
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to score ICP version.");
    } finally {
      setIsScoringId(null);
    }
  }

  return (
    <>
      <section className="lb-panel">
        <h2 className="lb-title" style={{ fontSize: "20px", lineHeight: "28px" }}>
          ICP Versions
        </h2>
        <p className="lb-subtitle" style={{ marginTop: "8px" }}>
          Select the active ICP for downstream discovery/messaging and re-score versions after edits.
        </p>

        <div className="lb-table-wrap" style={{ marginTop: "16px" }}>
          <table className="lb-table">
            <thead>
              <tr>
                <th>Version</th>
                <th>Source</th>
                <th>Updated</th>
                <th>Latest score</th>
                <th>Tier</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {versions.map((version) => (
                <tr key={version.id}>
                  <td>
                    <div style={{ display: "grid", gap: "4px" }}>
                      <span>{version.title}</span>
                      <code style={{ fontFamily: "var(--font-ui-mono)", color: "var(--ui-fg-muted)" }}>
                        {version.id}
                      </code>
                    </div>
                  </td>
                  <td>{version.source}</td>
                  <td>{new Date(version.updatedAt).toLocaleString()}</td>
                  <td>{version.latestScore ? `${version.latestScore.score}/100` : "Not scored"}</td>
                  <td>{version.latestScore ? version.latestScore.tier : "-"}</td>
                  <td>
                    {version.isActive ? (
                      <span className="lb-status lb-status-success">ACTIVE</span>
                    ) : (
                      <span className="lb-status lb-status-info">INACTIVE</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        className="lb-button lb-button-secondary"
                        disabled={Boolean(isSavingActiveId) || version.isActive}
                        onClick={() => onSetActive(version.id)}
                      >
                        {isSavingActiveId === version.id ? "Saving..." : "Set active"}
                      </button>
                      <button
                        type="button"
                        className="lb-button lb-button-secondary"
                        disabled={Boolean(isScoringId)}
                        onClick={() => onRescore(version.id)}
                      >
                        {isScoringId === version.id ? "Scoring..." : "Re-score"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {statusMessage ? (
        <p className="lb-alert lb-alert-success" role="status">
          {statusMessage}
        </p>
      ) : null}
      {errorMessage ? (
        <p className="lb-alert lb-alert-danger" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </>
  );
}
