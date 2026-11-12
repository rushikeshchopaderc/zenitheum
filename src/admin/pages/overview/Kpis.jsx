import { describeChange } from "../../charts/kpi";
import { KpiTile } from "../../components/Cards";
import { fmtDuration, fmtInt, fmtPct } from "../../format";

const bounceRate = (totals) => (totals.sessions > 0 ? totals.bounces / totals.sessions : null);

/** Eight headline numbers, each with its change against the previous period of equal length. */
export default function Kpis({ totals, previous, days }) {
  const count = (id, label) => ({
    id,
    label,
    value: fmtInt(totals[id]),
    title: `Previous ${days} days: ${fmtInt(previous[id])}`,
    change: describeChange({ current: totals[id], previous: previous[id], days }),
  });

  const traffic = [
    count("visitors", "Visitors"),
    count("sessions", "Sessions"),
    count("pageViews", "Page views"),
    {
      id: "bounce",
      label: "Bounce rate",
      value: fmtPct(bounceRate(totals), 1),
      title: `Visits that viewed one page and did nothing else. Previous ${days} days: ${fmtPct(bounceRate(previous), 1)}`,
      change: describeChange({ current: bounceRate(totals), previous: bounceRate(previous), goodWhen: "down", days, mode: "points" }),
    },
    {
      id: "active",
      label: "Avg. active time",
      value: fmtDuration(totals.avgActiveMs),
      title: `Average time with the page in focus, per visit. Previous ${days} days: ${fmtDuration(previous.avgActiveMs)}`,
      change: describeChange({ current: totals.avgActiveMs, previous: previous.avgActiveMs, days }),
    },
  ];
  const conversions = [count("leads", "Leads"), count("applications", "Applications"), count("subscribers", "Subscribers")];

  return (
    <div className="adm-kpigroups">
      <section aria-labelledby="kpi-traffic">
        <h2 className="adm-kpigroup__title" id="kpi-traffic">
          Traffic
        </h2>
        <div className="adm-kpis adm-kpis--5">
          {traffic.map((tile) => (
            <KpiTile key={tile.id} {...tile} />
          ))}
        </div>
      </section>
      <section aria-labelledby="kpi-conv">
        <h2 className="adm-kpigroup__title" id="kpi-conv">
          Conversions
        </h2>
        <div className="adm-kpis adm-kpis--3">
          {conversions.map((tile) => (
            <KpiTile key={tile.id} {...tile} />
          ))}
        </div>
      </section>
    </div>
  );
}
