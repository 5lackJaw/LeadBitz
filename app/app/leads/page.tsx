import Link from "next/link";

import {
  ScreenScaffold,
  SkeletonList,
  SkeletonMetricGrid,
  SkeletonSurface,
} from "../_components/screen-skeleton";

const LEAD_PLACEHOLDERS = [
  {
    id: "lead-001",
    name: "Alex Mercer",
    status: "Active",
    verification: "Verified",
    source: "Discovery run A",
    updated: "Today",
  },
  {
    id: "lead-002",
    name: "Jordan Lee",
    status: "Suppressed",
    verification: "Risky",
    source: "CSV import",
    updated: "Yesterday",
  },
  {
    id: "lead-003",
    name: "Priya Shah",
    status: "Active",
    verification: "Verified",
    source: "Manual import",
    updated: "2 days ago",
  },
];

export default function LeadsPage() {
  return (
    <ScreenScaffold
      description="Approved leads review skeleton with table-first operational layout."
      rightRail={
        <>
          <SkeletonSurface description="Pipeline status summary placeholder." title="Lead status summary">
            <SkeletonMetricGrid labels={["Active", "Suppressed", "Replied", "Needs update"]} />
          </SkeletonSurface>
          <SkeletonSurface description="Non-primary contextual actions placeholder." title="Quick actions">
            <SkeletonList rows={3} />
          </SkeletonSurface>
        </>
      }
      title="Leads"
    >
      <SkeletonSurface
        description="Primary lead table placeholder with filters and bulk action affordances."
        title="Approved leads"
      >
        <div className="lb-table-wrap">
          <table className="lb-table">
            <thead>
              <tr>
                <th scope="col">Lead</th>
                <th scope="col">Status</th>
                <th scope="col">Verification</th>
                <th scope="col">Source run</th>
                <th scope="col">Updated</th>
              </tr>
            </thead>
            <tbody>
              {LEAD_PLACEHOLDERS.map((lead) => (
                <tr key={lead.id}>
                  <td>
                    <Link className="lb-lead-row-link" href={`/app/leads/${lead.id}`}>
                      {lead.name}
                    </Link>
                  </td>
                  <td>{lead.status}</td>
                  <td>{lead.verification}</td>
                  <td>{lead.source}</td>
                  <td>{lead.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SkeletonSurface>
    </ScreenScaffold>
  );
}
