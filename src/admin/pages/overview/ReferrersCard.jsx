import { Card } from "../../components/Cards";
import { EmptyState } from "../../components/Feedback";
import RankedBars from "../../charts/RankedBars";

export default function ReferrersCard({ referrers }) {
  const items = referrers.map((referrer) => ({ key: referrer.host, label: referrer.host, value: referrer.sessions }));
  return (
    <Card title="Top referrers" subtitle="Websites that sent visitors. Direct visits and your own site are not listed.">
      {items.length ? <RankedBars items={items} unit="sessions" label="Sessions by referrer" /> : <EmptyState compact icon="globe" title="No referrers yet">Links from other websites appear here.</EmptyState>}
    </Card>
  );
}
