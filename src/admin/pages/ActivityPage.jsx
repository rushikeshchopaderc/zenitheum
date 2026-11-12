import { api } from "../api";
import DataTable from "../components/DataTable";
import { EmptyState, ErrorBanner, TableSkeleton } from "../components/Feedback";
import PageHeader from "../components/PageHeader";
import { Time } from "../components/Time";
import { Badge } from "../components/Badge";
import useLoad from "../hooks/useLoad";
import { useDocumentTitle } from "../hooks/useMisc";
import { actionLabel, actionTone } from "../labels";

const TONE = { danger: "rose", warn: "amber", neutral: "gray" };

/** Compact "key: value" text for the detail object an action stored. Nothing here is trusted: it is only ever text. */
function detailText(detail) {
  if (!detail || typeof detail !== "object") return "";
  return Object.entries(detail)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${key}: ${typeof value === "object" ? JSON.stringify(value) : String(value)}`)
    .join(" · ");
}

const subject = (row) => [row.entity, row.entityId ? `#${String(row.entityId).slice(0, 8)}` : ""].filter(Boolean).join(" ");

/** The audit trail: who did what, newest first (the API returns the latest 100 entries). */
export default function ActivityPage() {
  useDocumentTitle("Activity log");
  const { data, error, loading, reload } = useLoad((signal) => api.get("/audit", undefined, signal), "audit");
  const rows = data?.rows ?? [];

  const columns = [
    { key: "when", header: "When", nowrap: true, cell: (row) => <Time value={row.occurredAt} /> },
    { key: "who", header: "Who", cell: (row) => <span className="adm-break">{row.adminEmail || "System"}</span> },
    {
      key: "action",
      header: "Action",
      cell: (row) => (
        <Badge tone={TONE[actionTone(row.action)]} plain>
          {actionLabel(row.action)}
        </Badge>
      ),
    },
    { key: "what", header: "What", cell: (row) => <span className="adm-mono adm-muted adm-break">{subject(row)}</span> },
    { key: "detail", header: "Detail", cell: (row) => <span className="adm-break adm-muted">{detailText(row.detail)}</span> },
  ];

  const card = {
    title: (row) => <span>{actionLabel(row.action)}</span>,
    badge: (row) => <Time value={row.occurredAt} className="adm-muted" />,
    meta: (row) => [row.adminEmail || "System", subject(row), detailText(row.detail)],
  };

  return (
    <div className="adm-page">
      <PageHeader eyebrow="Company" title="Activity log" lede="Every sign-in, export, edit, deletion and erasure by an administrator. Showing the most recent 100 entries.">
        <button type="button" className="adm-btn" onClick={reload} disabled={loading}>
          Refresh
        </button>
      </PageHeader>

      {error ? <ErrorBanner error={error} onRetry={reload} /> : null}
      {!data && loading ? <TableSkeleton rows={8} /> : null}
      {data && rows.length === 0 ? (
        <div className="adm-card">
          <EmptyState icon="history" title="Nothing has happened yet">
            Actions taken in the console are recorded here as they happen.
          </EmptyState>
        </div>
      ) : null}
      {rows.length ? <DataTable columns={columns} rows={rows} rowKey={(row) => `${row.occurredAt}-${row.action}-${row.entityId}`} card={card} label="Audit log" dim={loading} /> : null}
    </div>
  );
}
