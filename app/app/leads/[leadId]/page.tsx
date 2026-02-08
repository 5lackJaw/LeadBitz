import Link from "next/link";

type LeadDetailPageProps = {
  params: Promise<{
    leadId: string;
  }>;
};

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { leadId } = await params;

  return (
    <section className="lb-shell-stack">
      <section className="lb-panel">
        <h1 className="lb-title">Lead detail</h1>
        <p className="lb-subtitle">Lead ID: {leadId}</p>
      </section>

      <section className="lb-panel">
        <p className="lb-subtitle">
          This route is reserved for campaign-linked lead detail data.
        </p>
        <div className="lb-shell-link-grid">
          <Link className="lb-link lb-link-accent" href="/app/leads">
            Back to leads
          </Link>
          <Link className="lb-link" href="/app/campaigns">
            Open campaigns
          </Link>
        </div>
      </section>
    </section>
  );
}
