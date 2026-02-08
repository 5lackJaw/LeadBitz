"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type ImportOutcome = {
  index?: number;
  rowNumber?: number;
  email: string | null;
  outcome: string;
  message: string;
};

type ImportResult = {
  importedCount: number;
  linkedExistingCount: number;
  suppressedCount: number;
  duplicateCount: number;
  invalidCount: number;
  outcomes: ImportOutcome[];
};

type CampaignLeadItem = {
  campaignLeadId: string;
  leadId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  title: string | null;
  companyName: string | null;
  companyDomain: string | null;
  createdAt: string;
};

type LeadsImportClientProps = {
  campaignId: string;
  initialLeads: CampaignLeadItem[];
};

function parseManualRows(rawValue: string): Array<Record<string, string>> {
  return rawValue
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [email, firstName, lastName, title, companyName, companyDomain] = line.split(",").map((part) => part.trim());
      return {
        email,
        firstName,
        lastName,
        title,
        companyName,
        companyDomain,
      };
    });
}

export function LeadsImportClient({ campaignId, initialLeads }: LeadsImportClientProps) {
  const router = useRouter();
  const [csvText, setCsvText] = useState("");
  const [manualRowsText, setManualRowsText] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function onSubmitCsv(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setResult(null);

    startTransition(async () => {
      const response = await fetch(`/api/campaigns/${campaignId}/leads/import/csv`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          csvText,
        }),
      });

      const data = (await response.json()) as ImportResult | { error?: string };
      if (!response.ok || !("outcomes" in data)) {
        setErrorMessage(("error" in data && data.error) || "CSV import failed.");
        return;
      }

      setResult(data);
      setCsvText("");
      router.refresh();
    });
  }

  async function onSubmitManual(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setResult(null);

    const rows = parseManualRows(manualRowsText);
    if (rows.length === 0) {
      setErrorMessage("Add at least one manual row before importing.");
      return;
    }

    startTransition(async () => {
      const response = await fetch(`/api/campaigns/${campaignId}/leads/import/manual`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          rows,
        }),
      });

      const data = (await response.json()) as ImportResult | { error?: string };
      if (!response.ok || !("outcomes" in data)) {
        setErrorMessage(("error" in data && data.error) || "Manual import failed.");
        return;
      }

      setResult(data);
      setManualRowsText("");
      router.refresh();
    });
  }

  return (
    <>
      <section className="lb-panel">
        <h2 className="lb-title" style={{ fontSize: "20px", lineHeight: "28px" }}>
          CSV import
        </h2>
        <p className="lb-subtitle" style={{ marginTop: "8px" }}>
          Paste CSV content with headers including `email` plus optional name/title/company columns.
        </p>
        <form className="lb-form-grid" style={{ marginTop: "12px" }} onSubmit={onSubmitCsv}>
          <label className="lb-field">
            <span className="lb-label">CSV text</span>
            <textarea
              className="lb-input"
              style={{ minHeight: "180px", resize: "vertical" }}
              value={csvText}
              onChange={(event) => setCsvText(event.target.value)}
              placeholder="email,first name,last name,title,company,domain&#10;name@example.com,Ada,Lovelace,Founder,Acme,acme.com"
            />
          </label>
          <button className="lb-button lb-button-primary" type="submit" disabled={isPending}>
            {isPending ? "Importing..." : "Import CSV"}
          </button>
        </form>
      </section>

      <section className="lb-panel">
        <h2 className="lb-title" style={{ fontSize: "20px", lineHeight: "28px" }}>
          Manual/paste import
        </h2>
        <p className="lb-subtitle" style={{ marginTop: "8px" }}>
          One row per line: `email, firstName, lastName, title, companyName, companyDomain`.
        </p>
        <form className="lb-form-grid" style={{ marginTop: "12px" }} onSubmit={onSubmitManual}>
          <label className="lb-field">
            <span className="lb-label">Rows</span>
            <textarea
              className="lb-input"
              style={{ minHeight: "160px", resize: "vertical" }}
              value={manualRowsText}
              onChange={(event) => setManualRowsText(event.target.value)}
              placeholder="ada@example.com,Ada,Lovelace,Founder,Acme,acme.com"
            />
          </label>
          <button className="lb-button lb-button-primary" type="submit" disabled={isPending}>
            {isPending ? "Importing..." : "Import rows"}
          </button>
        </form>
      </section>

      {result ? (
        <section className="lb-panel">
          <h2 className="lb-title" style={{ fontSize: "20px", lineHeight: "28px" }}>
            Import results
          </h2>
          <p className="lb-subtitle" style={{ marginTop: "8px" }}>
            Imported: {result.importedCount}, Linked existing: {result.linkedExistingCount}, Suppressed:{" "}
            {result.suppressedCount}, Duplicates: {result.duplicateCount}, Invalid: {result.invalidCount}
          </p>
          <div className="lb-table-wrap" style={{ marginTop: "12px" }}>
            <table className="lb-table">
              <thead>
                <tr>
                  <th>Row</th>
                  <th>Email</th>
                  <th>Outcome</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody>
                {result.outcomes.map((outcome, index) => (
                  <tr key={`${outcome.email ?? "none"}-${index}`}>
                    <td>{outcome.rowNumber ?? outcome.index ?? "-"}</td>
                    <td>{outcome.email ?? "-"}</td>
                    <td>{outcome.outcome}</td>
                    <td>{outcome.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {errorMessage ? (
        <p className="lb-alert lb-alert-danger" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <section className="lb-panel">
        <h2 className="lb-title" style={{ fontSize: "20px", lineHeight: "28px" }}>
          Campaign leads
        </h2>
        <p className="lb-subtitle" style={{ marginTop: "8px" }}>
          Current approved/imported leads linked to this campaign: {initialLeads.length}
        </p>
        <div className="lb-table-wrap" style={{ marginTop: "12px" }}>
          <table className="lb-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Title</th>
                <th>Company</th>
              </tr>
            </thead>
            <tbody>
              {initialLeads.length === 0 ? (
                <tr>
                  <td colSpan={4}>No leads linked yet.</td>
                </tr>
              ) : null}
              {initialLeads.map((lead) => (
                <tr key={lead.campaignLeadId}>
                  <td>{lead.email}</td>
                  <td>{[lead.firstName, lead.lastName].filter(Boolean).join(" ") || "-"}</td>
                  <td>{lead.title || "-"}</td>
                  <td>{lead.companyName || lead.companyDomain || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
