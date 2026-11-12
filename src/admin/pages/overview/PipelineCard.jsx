import { Link } from "react-router-dom";

import { StatusBadge } from "../../components/Badge";
import { Card } from "../../components/Cards";
import { EmptyState } from "../../components/Feedback";
import { fmtInt } from "../../format";
import { APPLICATION_STATUSES, CONTACT_STATUSES, SUBSCRIBER_STATUSES } from "../../labels";

const GROUPS = [
  { key: "contacts", title: "Leads", list: CONTACT_STATUSES, kind: "contact", to: "/admin/leads" },
  { key: "applications", title: "Applications", list: APPLICATION_STATUSES, kind: "application", to: "/admin/applications" },
  { key: "subscribers", title: "Subscribers", list: SUBSCRIBER_STATUSES, kind: "subscriber", to: "/admin/subscribers" },
];

/** Where everyone sits right now. All time, so it ignores the date range. Each count opens the filtered list. */
export default function PipelineCard({ pipeline }) {
  const total = GROUPS.reduce((sum, group) => sum + Object.values(pipeline?.[group.key] ?? {}).reduce((a, b) => a + b, 0), 0);
  return (
    <Card title="Pipeline" subtitle="Everyone in the system by stage, all time. Select a count to open that list.">
      {total === 0 ? (
        <EmptyState compact icon="leads" title="Nothing in the pipeline yet">
          Enquiries, applications and subscribers will be counted here as they arrive.
        </EmptyState>
      ) : (
        <div className="adm-stack" style={{ gap: 16 }}>
          {GROUPS.map((group) => {
            const counts = pipeline?.[group.key] ?? {};
            const known = new Set(group.list.map((item) => item.id));
            const extra = Object.keys(counts).filter((id) => !known.has(id));
            return (
              <div key={group.key}>
                <h3 className="adm-h3" style={{ marginBottom: 8 }}>
                  {group.title}
                </h3>
                <ul className="adm-stages">
                  {[...group.list.map((item) => item.id), ...extra].map((id) => {
                    const count = counts[id] ?? 0;
                    return (
                      <li key={id}>
                        <Link to={`${group.to}?status=${encodeURIComponent(id)}`} className={`adm-stage${count === 0 ? " adm-stage--zero" : ""}`}>
                          <span className="adm-stage__count adm-num">{fmtInt(count)}</span>
                          <StatusBadge kind={group.kind} value={id} />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
