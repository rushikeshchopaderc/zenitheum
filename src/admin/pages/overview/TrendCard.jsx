import { useMemo, useState } from "react";

import { Card, TableToggle } from "../../components/Cards";
import { EmptyState } from "../../components/Feedback";
import { bucketize } from "../../charts/scales";
import TrendChart, { TrendTable } from "../../charts/TrendChart";

/** Sessions, leads and applications over time (daily, or weekly for long ranges), with a table twin. */
export default function TrendCard({ series }) {
  const [table, setTable] = useState(false);
  const { unit, buckets } = useMemo(() => bucketize(series), [series]);
  const hasData = buckets.some((bucket) => bucket.sessions || bucket.leads || bucket.applications || bucket.pageViews);

  return (
    <Card
      title="Traffic and conversions"
      subtitle={unit === "week" ? "Weekly totals, because the range is longer than three months." : "Daily totals. Days follow the business time zone."}
      actions={hasData ? <TableToggle pressed={table} onToggle={() => setTable((value) => !value)} /> : null}
    >
      {!hasData ? (
        <EmptyState compact icon="visitors" title="No activity in this period">
          Visits appear here once people accept analytics on the public site. Leads and applications appear as soon as a form is submitted.
        </EmptyState>
      ) : table ? (
        <TrendTable buckets={buckets} unit={unit} />
      ) : (
        <TrendChart buckets={buckets} unit={unit} />
      )}
    </Card>
  );
}
