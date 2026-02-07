export default function Home() {
  return (
    <main className="lb-page">
      <section className="lb-container">
        <div className="lb-panel">
          <p className="lb-status lb-status-info">LeadBitz</p>
          <div style={{ marginTop: "16px", display: "grid", gap: "16px" }}>
            <h1 className="lb-title" style={{ fontSize: "30px", lineHeight: "36px" }}>
              Coming soon
            </h1>
            <p className="lb-subtitle" style={{ maxWidth: "720px" }}>
              LeadBitz is currently in private development. Public access will open when the MVP
              is production-ready.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
