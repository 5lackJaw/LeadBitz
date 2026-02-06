import Link from "next/link";

export default function Home() {
  return (
    <main className="lb-page">
      <section className="lb-container">
        <div className="lb-panel">
          <p className="lb-status lb-status-info">Deliverability-first outbound operations</p>
          <div style={{ marginTop: "16px", display: "grid", gap: "16px" }}>
            <h1 className="lb-title" style={{ fontSize: "30px", lineHeight: "36px" }}>
              LeadBitz
            </h1>
            <p className="lb-subtitle" style={{ maxWidth: "720px" }}>
              Build campaigns with operator control: ICP draft, lead imports, compliant messaging,
              and inbox-safe sending workflows.
            </p>
          </div>
          <div style={{ marginTop: "24px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link href="/login" className="lb-button lb-button-primary">
              Sign in
            </Link>
            <Link href="/app" className="lb-button lb-button-secondary">
              Open app shell
            </Link>
          </div>
        </div>
        <div className="lb-panel">
          <h2 className="lb-title" style={{ fontSize: "20px", lineHeight: "28px" }}>
            MVP focus
          </h2>
          <p className="lb-subtitle" style={{ marginTop: "8px" }}>
            The product is currently in active Preview-only development. Production promotion stays
            gated until MVP sign-off.
          </p>
        </div>
      </section>
    </main>
  );
}
