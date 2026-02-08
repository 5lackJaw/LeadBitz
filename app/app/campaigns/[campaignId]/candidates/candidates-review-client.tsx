"use client";

import { CandidateStatus, CandidateVerificationStatus } from "@prisma/client";
import { FormEvent, useMemo, useState, useTransition } from "react";

import { approveCandidatesAction, rejectCandidatesAction } from "./actions";

type CandidateItem = {
  id: string;
  campaignId: string;
  sourceRunId: string;
  personProviderId: string | null;
  companyProviderId: string | null;
  email: string;
  firstName: string | null;
  lastName: string | null;
  title: string | null;
  seniority: string | null;
  department: string | null;
  companyName: string | null;
  companyDomain: string | null;
  companyWebsite: string | null;
  location: unknown;
  confidenceScore: number | null;
  verificationStatus: CandidateVerificationStatus;
  status: CandidateStatus;
  createdAt: string;
};

type PageInfo = {
  hasMore: boolean;
  nextCursor: string | null;
  pageSize: number;
};

type SourceRunOption = {
  id: string;
  runLabel: string | null;
};

type CandidatesReviewClientProps = {
  campaignId: string;
  initialItems: CandidateItem[];
  initialPageInfo: PageInfo;
  initialFilters: {
    verificationStatus?: string;
    role?: string;
    sourceRunId?: string;
    confidenceMin?: string;
  };
  sourceRuns: SourceRunOption[];
};

function getVerificationStatusClassName(status: CandidateVerificationStatus): string {
  if (status === CandidateVerificationStatus.VERIFIED) {
    return "lb-status lb-status-success";
  }

  if (status === CandidateVerificationStatus.RISKY) {
    return "lb-status lb-status-warning";
  }

  if (status === CandidateVerificationStatus.INVALID) {
    return "lb-status lb-status-danger";
  }

  return "lb-status lb-status-info";
}

function getCandidateStatusClassName(status: CandidateStatus): string {
  if (status === CandidateStatus.APPROVED) {
    return "lb-status lb-status-success";
  }

  if (status === CandidateStatus.REJECTED || status === CandidateStatus.SUPPRESSED) {
    return "lb-status lb-status-danger";
  }

  return "lb-status lb-status-info";
}

function formatCandidateName(candidate: CandidateItem): string {
  const name = [candidate.firstName, candidate.lastName].filter(Boolean).join(" ").trim();
  return name || "Unknown";
}

function buildCandidatesQuery(input: {
  pageSize?: number;
  cursor?: string | null;
  verificationStatus?: string;
  role?: string;
  sourceRunId?: string;
  confidenceMin?: string;
}) {
  const searchParams = new URLSearchParams();
  if (input.pageSize) {
    searchParams.set("pageSize", String(input.pageSize));
  }
  if (input.cursor) {
    searchParams.set("cursor", input.cursor);
  }
  if (input.verificationStatus) {
    searchParams.set("verificationStatus", input.verificationStatus);
  }
  if (input.role) {
    searchParams.set("role", input.role);
  }
  if (input.sourceRunId) {
    searchParams.set("sourceRunId", input.sourceRunId);
  }
  if (input.confidenceMin) {
    searchParams.set("confidenceMin", input.confidenceMin);
  }
  return searchParams.toString();
}

export function CandidatesReviewClient({
  campaignId,
  initialItems,
  initialPageInfo,
  initialFilters,
  sourceRuns,
}: CandidatesReviewClientProps) {
  const [items, setItems] = useState<CandidateItem[]>(initialItems);
  const [pageInfo, setPageInfo] = useState<PageInfo>(initialPageInfo);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [verificationStatus, setVerificationStatus] = useState(initialFilters.verificationStatus ?? "");
  const [role, setRole] = useState(initialFilters.role ?? "");
  const [sourceRunId, setSourceRunId] = useState(initialFilters.sourceRunId ?? "");
  const [confidenceMin, setConfidenceMin] = useState(initialFilters.confidenceMin ?? "");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const allVisibleIds = useMemo(() => items.map((item) => item.id), [items]);
  const hasSelected = selectedCandidateIds.length > 0;

  const selectedSet = useMemo(() => new Set(selectedCandidateIds), [selectedCandidateIds]);

  async function refreshList(cursor?: string | null) {
    const query = buildCandidatesQuery({
      pageSize: pageInfo.pageSize,
      cursor: cursor ?? null,
      verificationStatus: verificationStatus || undefined,
      role: role || undefined,
      sourceRunId: sourceRunId || undefined,
      confidenceMin: confidenceMin || undefined,
    });

    const response = await fetch(`/api/campaigns/${campaignId}/candidates?${query}`, {
      method: "GET",
      cache: "no-store",
    });

    const data = (await response.json()) as
      | { items: CandidateItem[]; pageInfo: PageInfo }
      | { error?: string };

    if (!response.ok || !("items" in data)) {
      throw new Error(("error" in data && data.error) || "Failed to load candidates.");
    }

    setItems(data.items);
    setPageInfo(data.pageInfo);
    setSelectedCandidateIds([]);
  }

  function onFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedbackMessage(null);
    setErrorMessage(null);

    startTransition(async () => {
      try {
        await refreshList(null);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Failed to load candidates.");
      }
    });
  }

  function onToggleSelectAll(checked: boolean) {
    if (checked) {
      setSelectedCandidateIds(allVisibleIds);
      return;
    }
    setSelectedCandidateIds([]);
  }

  function onToggleSelectOne(candidateId: string, checked: boolean) {
    setSelectedCandidateIds((current) => {
      if (checked) {
        if (current.includes(candidateId)) {
          return current;
        }
        return [...current, candidateId];
      }

      return current.filter((id) => id !== candidateId);
    });
  }

  function onApproveSelected() {
    setFeedbackMessage(null);
    setErrorMessage(null);

    startTransition(async () => {
      const result = await approveCandidatesAction({
        campaignId,
        candidateIds: selectedCandidateIds,
      });

      if (!result.ok) {
        setErrorMessage(result.error ?? "Failed to approve selected candidates.");
        return;
      }

      await refreshList(null);
      setFeedbackMessage(
        `Approved ${result.processedCount} candidate(s) to leads${result.skippedCount ? ` (${result.skippedCount} skipped)` : ""}.`,
      );
    });
  }

  function onRejectSelected() {
    setFeedbackMessage(null);
    setErrorMessage(null);

    startTransition(async () => {
      const result = await rejectCandidatesAction({
        campaignId,
        candidateIds: selectedCandidateIds,
      });

      if (!result.ok) {
        setErrorMessage(result.error ?? "Failed to reject selected candidates.");
        return;
      }

      await refreshList(null);
      setFeedbackMessage(
        `Rejected ${result.processedCount} candidate(s)${result.skippedCount ? ` (${result.skippedCount} skipped)` : ""}.`,
      );
    });
  }

  function onLoadNextPage() {
    if (!pageInfo.nextCursor) {
      return;
    }

    setFeedbackMessage(null);
    setErrorMessage(null);

    startTransition(async () => {
      try {
        await refreshList(pageInfo.nextCursor);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Failed to load next page.");
      }
    });
  }

  return (
    <>
      <section className="lb-panel">
        <h2 className="lb-title" style={{ fontSize: "20px", lineHeight: "28px" }}>
          Filter candidates
        </h2>
        <form onSubmit={onFilterSubmit} className="lb-form-grid" style={{ marginTop: "12px" }}>
          <div className="lb-row" style={{ alignItems: "end" }}>
            <label className="lb-field" style={{ minWidth: "220px", flex: 1 }}>
              <span className="lb-label">Verification status</span>
              <select
                className="lb-input"
                value={verificationStatus}
                onChange={(event) => setVerificationStatus(event.target.value)}
              >
                <option value="">All</option>
                <option value="VERIFIED">Verified</option>
                <option value="RISKY">Risky</option>
                <option value="INVALID">Invalid</option>
                <option value="UNKNOWN">Unknown</option>
              </select>
            </label>

            <label className="lb-field" style={{ minWidth: "220px", flex: 1 }}>
              <span className="lb-label">Role</span>
              <input
                className="lb-input"
                value={role}
                onChange={(event) => setRole(event.target.value)}
                placeholder="sales, founder, revops..."
              />
            </label>

            <label className="lb-field" style={{ minWidth: "220px", flex: 1 }}>
              <span className="lb-label">Source run</span>
              <select className="lb-input" value={sourceRunId} onChange={(event) => setSourceRunId(event.target.value)}>
                <option value="">All source runs</option>
                {sourceRuns.map((run) => (
                  <option key={run.id} value={run.id}>
                    {run.runLabel || run.id}
                  </option>
                ))}
              </select>
            </label>

            <label className="lb-field" style={{ minWidth: "180px", flex: 1 }}>
              <span className="lb-label">Confidence min (0-1)</span>
              <input
                className="lb-input"
                value={confidenceMin}
                onChange={(event) => setConfidenceMin(event.target.value)}
                inputMode="decimal"
                placeholder="0.70"
              />
            </label>
          </div>

          <div className="lb-row" style={{ justifyContent: "flex-start", gap: "10px" }}>
            <button className="lb-button lb-button-primary" type="submit" disabled={isPending}>
              {isPending ? "Loading..." : "Apply filters"}
            </button>
            <button
              className="lb-button lb-button-secondary"
              type="button"
              disabled={isPending}
              onClick={() => {
                setVerificationStatus("");
                setRole("");
                setSourceRunId("");
                setConfidenceMin("");
              }}
            >
              Clear fields
            </button>
          </div>
        </form>
      </section>

      <section className="lb-panel">
        <div className="lb-row" style={{ marginBottom: "12px" }}>
          <h2 className="lb-title" style={{ fontSize: "20px", lineHeight: "28px" }}>
            Candidate review queue
          </h2>
          <div className="lb-row" style={{ justifyContent: "flex-end", gap: "10px" }}>
            <button className="lb-button lb-button-secondary" onClick={onRejectSelected} disabled={!hasSelected || isPending}>
              Reject selected
            </button>
            <button className="lb-button lb-button-primary" onClick={onApproveSelected} disabled={!hasSelected || isPending}>
              Approve to leads
            </button>
          </div>
        </div>

        <div className="lb-table-wrap">
          <table className="lb-table">
            <thead>
              <tr>
                <th style={{ width: "56px" }}>
                  <input
                    type="checkbox"
                    checked={allVisibleIds.length > 0 && selectedCandidateIds.length === allVisibleIds.length}
                    onChange={(event) => onToggleSelectAll(event.target.checked)}
                    aria-label="Select all visible candidates"
                  />
                </th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Verification</th>
                <th>Status</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="lb-muted">
                    No candidates matched current filters.
                  </td>
                </tr>
              ) : null}
              {items.map((candidate) => (
                <tr key={candidate.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedSet.has(candidate.id)}
                      onChange={(event) => onToggleSelectOne(candidate.id, event.target.checked)}
                      aria-label={`Select candidate ${candidate.email}`}
                    />
                  </td>
                  <td>{formatCandidateName(candidate)}</td>
                  <td>{candidate.email}</td>
                  <td>{candidate.title || candidate.department || candidate.seniority || "Unspecified"}</td>
                  <td>
                    <span className={getVerificationStatusClassName(candidate.verificationStatus)}>
                      {candidate.verificationStatus}
                    </span>
                  </td>
                  <td>
                    <span className={getCandidateStatusClassName(candidate.status)}>{candidate.status}</span>
                  </td>
                  <td>{candidate.confidenceScore !== null ? candidate.confidenceScore.toFixed(2) : "n/a"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="lb-row" style={{ marginTop: "12px", justifyContent: "space-between" }}>
          <p className="lb-subtitle">Page size: {pageInfo.pageSize}</p>
          <button className="lb-button lb-button-secondary" disabled={!pageInfo.hasMore || isPending} onClick={onLoadNextPage}>
            {isPending ? "Loading..." : "Load next page"}
          </button>
        </div>

        {feedbackMessage ? (
          <p className="lb-alert lb-alert-success" role="status" style={{ marginTop: "12px" }}>
            {feedbackMessage}
          </p>
        ) : null}
        {errorMessage ? (
          <p className="lb-alert lb-alert-danger" role="alert" style={{ marginTop: "12px" }}>
            {errorMessage}
          </p>
        ) : null}
      </section>
    </>
  );
}
