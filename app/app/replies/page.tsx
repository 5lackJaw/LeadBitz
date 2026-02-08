import Link from "next/link";

export default function RepliesPage() {
  return (
    <section className="lb-shell-stack">
      <section className="lb-panel">
        <h1 className="lb-title">Replies</h1>
        <p className="lb-subtitle">Unified replies workflow surfaces are in progress.</p>
      </section>

      <section className="lb-panel">
        <p className="lb-subtitle">
          Continue operating campaigns while reply inbox flows are connected.
        </p>
        <div className="lb-shell-link-grid">
          <Link className="lb-link lb-link-accent" href="/app/campaigns">
            Open campaigns
          </Link>
        </div>
      </section>
    </section>
  );
}
