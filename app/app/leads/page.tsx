import Link from "next/link";

export default function LeadsPage() {
  return (
    <section className="lb-shell-stack">
      <section className="lb-panel">
        <h1 className="lb-title">Leads</h1>
        <p className="lb-subtitle">
          Leads are currently managed inside each campaign workspace.
        </p>
      </section>

      <section className="lb-panel">
        <h2 className="lb-title" style={{ fontSize: "20px", lineHeight: "28px" }}>
          Continue from campaigns
        </h2>
        <div className="lb-shell-link-grid">
          <Link className="lb-link lb-link-accent" href="/app/campaigns">
            Open campaigns
          </Link>
        </div>
      </section>
    </section>
  );
}
