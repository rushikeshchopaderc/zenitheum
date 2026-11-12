import { api } from "../api";
import RankedBars from "../charts/RankedBars";
import { Card } from "../components/Cards";
import DataTable from "../components/DataTable";
import { CardSkeleton, EmptyState, ErrorBanner, TableSkeleton } from "../components/Feedback";
import PageHeader from "../components/PageHeader";
import RangePicker from "../components/RangePicker";
import Tabs from "../components/Tabs";
import { fmtInt, fmtPct } from "../format";
import useLoad from "../hooks/useLoad";
import { useDocumentTitle } from "../hooks/useMisc";
import { useQueryParams } from "../hooks/useQueryParams";
import useRange from "../hooks/useRange";
import { channelLabel } from "../labels";
import UtmBuilder from "./UtmBuilder";

const TABS = [
  { id: "performance", label: "Performance" },
  { id: "builder", label: "Link builder" },
];

/** Leads, applications and sign-ups per visit for one tagged campaign. */
const conversion = (row) => (row.sessions > 0 ? (row.leads + row.applications + row.subscribers) / row.sessions : null);

const num = (value) => <span className="adm-num">{fmtInt(value)}</span>;
const rowKey = (row) => `${row.campaign}|${row.source}|${row.medium}`;

function Performance({ onOpenBuilder }) {
  const { range, apiParams, setPreset, setCustom } = useRange();
  const { data, error, loading, reload } = useLoad((signal) => api.get("/campaigns", apiParams, signal), JSON.stringify(apiParams));
  const rows = data?.rows ?? [];
  const channels = data?.channels ?? [];

  const columns = [
    { key: "campaign", header: "Campaign", minWidth: 160, cell: (row) => <span className="adm-mono adm-break" style={{ color: "var(--adm-text)", fontWeight: 600 }}>{row.campaign}</span> },
    { key: "source", header: "Source", cell: (row) => <span className="adm-mono adm-break adm-muted">{row.source || "–"}</span> },
    { key: "medium", header: "Medium", cell: (row) => <span className="adm-mono adm-break adm-muted">{row.medium || "–"}</span> },
    { key: "sessions", header: "Sessions", align: "right", cell: (row) => num(row.sessions) },
    { key: "visitors", header: "Visitors", align: "right", cell: (row) => num(row.visitors) },
    { key: "leads", header: "Leads", align: "right", cell: (row) => num(row.leads) },
    { key: "applications", header: "Applications", align: "right", cell: (row) => num(row.applications) },
    { key: "subscribers", header: "Subscribers", align: "right", cell: (row) => num(row.subscribers) },
    { key: "conversion", header: "Conversion", align: "right", cell: (row) => <strong className="adm-num" style={{ color: "var(--adm-text)" }}>{fmtPct(conversion(row), 1)}</strong> },
  ];

  const card = {
    title: (row) => <span className="adm-mono">{row.campaign}</span>,
    badge: (row) => <strong className="adm-num" style={{ color: "var(--adm-text)" }}>{fmtPct(conversion(row), 1)}</strong>,
    meta: (row) => [
      `${row.source || "–"} / ${row.medium || "–"}`,
      `${fmtInt(row.sessions)} sessions · ${fmtInt(row.visitors)} visitors`,
      `${fmtInt(row.leads)} leads · ${fmtInt(row.applications)} applications · ${fmtInt(row.subscribers)} subscribers`,
    ],
  };

  return (
    <>
      <div className="adm-toolbar">
        <RangePicker range={range} setPreset={setPreset} setCustom={setCustom} />
      </div>

      {error ? <ErrorBanner error={error} onRetry={reload} title="Campaign results could not be loaded." /> : null}
      {!data && loading ? (
        <div className="adm-stack">
          <TableSkeleton rows={5} />
          <CardSkeleton lines={4} />
        </div>
      ) : null}

      {data ? (
        <div className={`adm-stack${loading ? " adm-dim" : ""}`} style={{ gap: 18 }} aria-busy={loading}>
          {rows.length ? (
            <>
              <DataTable columns={columns} rows={rows} rowKey={rowKey} card={card} label="Campaign performance" />
              <p className="adm-hint">
                Conversion is leads, applications and sign-ups divided by visits from that campaign. Only visits that carried campaign tags (utm_campaign) are listed, up to the top 50 by visits.
              </p>
            </>
          ) : (
            <div className="adm-card">
              <EmptyState
                icon="campaigns"
                title="No tagged campaigns in this period"
                action={
                  <button type="button" className="adm-btn adm-btn--primary" onClick={onOpenBuilder}>
                    Build a tagged link
                  </button>
                }
              >
                Visits are grouped here when the link carries a campaign tag. Share links made with the link builder and the results will appear.
              </EmptyState>
            </div>
          )}

          <Card title="All visits by channel" subtitle="Every visit in the period, tagged or not, for context.">
            {channels.length ? (
              <RankedBars items={channels.map((item) => ({ key: item.channel, label: channelLabel(item.channel), value: item.sessions }))} unit="sessions" share label="Sessions by channel" />
            ) : (
              <EmptyState compact icon="visitors" title="No visits in this period">
                Channels appear as visits are recorded.
              </EmptyState>
            )}
          </Card>
        </div>
      ) : null}
    </>
  );
}

/** Which tagged links work, and a builder for new ones. */
export default function CampaignsPage() {
  const [params, update] = useQueryParams();
  const tab = params.get("tab") === "builder" ? "builder" : "performance";
  useDocumentTitle(tab === "builder" ? "Link builder" : "Campaigns");
  const select = (id) => update({ tab: id === "performance" ? null : id }, { keepPage: true });

  return (
    <div className="adm-page">
      <PageHeader eyebrow="Website" title="Campaigns" lede="See which tagged links bring visitors, leads and sign-ups, and build new tagged links for posts, newsletters and events." />
      <Tabs tabs={TABS} selected={tab} onSelect={select} label="Campaigns" idPrefix="campaigns" />
      <div role="tabpanel" id="campaigns-panel" aria-labelledby={`campaigns-${tab}`} className="adm-page">
        {tab === "builder" ? <UtmBuilder /> : <Performance onOpenBuilder={() => select("builder")} />}
      </div>
    </div>
  );
}
