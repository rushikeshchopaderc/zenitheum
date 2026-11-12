import FunnelChart from "../../charts/FunnelChart";
import { Card } from "../../components/Cards";
import { EmptyState } from "../../components/Feedback";

export default function FunnelCard({ funnel }) {
  const any = Object.values(funnel ?? {}).some((value) => value > 0);
  return (
    <Card title="Conversion funnel" subtitle="Visits that reached each step. A visit counts once per step.">
      {any ? (
        <FunnelChart funnel={funnel} />
      ) : (
        <EmptyState compact icon="click" title="No funnel data yet">
          Once visitors browse products, click calls to action and use the forms, the steps appear here.
        </EmptyState>
      )}
    </Card>
  );
}
