import { Card } from "../../components/Cards";
import { EmptyState } from "../../components/Feedback";
import RankedBars from "../../charts/RankedBars";
import { fmtDuration, plural } from "../../format";

export default function TopPagesCard({ pages }) {
  const items = pages.map((page) => ({
    key: page.path,
    label: page.path,
    mono: true,
    value: page.views,
    sub: `${plural(page.visitors, "visitor")} · ${fmtDuration(page.avgMs)} average on page · ${page.avgScroll}% average scroll`,
  }));
  return (
    <Card title="Top pages" subtitle="Page views, most viewed first.">
      {items.length ? <RankedBars items={items} unit="views" label="Page views by page" /> : <EmptyState compact icon="page" title="No page views yet">Pages appear as soon as visitors browse the site.</EmptyState>}
    </Card>
  );
}
