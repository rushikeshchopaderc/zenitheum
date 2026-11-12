import { Link } from "react-router-dom";

import { api } from "../api";
import { Notice, CardSkeleton, ErrorBanner, Skel } from "../components/Feedback";
import Icon from "../components/icons";
import PageHeader from "../components/PageHeader";
import RangePicker from "../components/RangePicker";
import { fmtInt, fmtYmd, plural } from "../format";
import useLoad from "../hooks/useLoad";
import { useDocumentTitle } from "../hooks/useMisc";
import useRange from "../hooks/useRange";
import ChannelsCard from "./overview/ChannelsCard";
import DevicesCard from "./overview/DevicesCard";
import FunnelCard from "./overview/FunnelCard";
import Kpis from "./overview/Kpis";
import LeadMixCard from "./overview/LeadMixCard";
import PipelineCard from "./overview/PipelineCard";
import ReferrersCard from "./overview/ReferrersCard";
import TopPagesCard from "./overview/TopPagesCard";
import TrendCard from "./overview/TrendCard";

/** "4 new leads awaiting a reply": what needs a person today, linking straight to that list. */
function Attention({ pipeline }) {
  const leads = pipeline?.contacts?.new ?? 0;
  const applications = pipeline?.applications?.new ?? 0;
  if (!leads && !applications) {
    return (
      <Notice tone="ok" icon="circleCheck">
        You are all caught up: no new leads or applications are waiting.
      </Notice>
    );
  }
  return (
    <div className="adm-attn" role="region" aria-label="Needs attention">
      {leads ? (
        <Link className="adm-attn__item" to="/admin/leads?status=new">
          <Icon name="leads" size={18} />
          <span>
            <strong>{plural(leads, "new lead")}</strong> awaiting a reply
          </span>
          <Icon name="arrowRight" size={16} />
        </Link>
      ) : null}
      {applications ? (
        <Link className="adm-attn__item" to="/admin/applications?status=new">
          <Icon name="applications" size={18} />
          <span>
            <strong>{plural(applications, "new application")}</strong> to review
          </span>
          <Icon name="arrowRight" size={16} />
        </Link>
      ) : null}
    </div>
  );
}

function ActiveNow({ count }) {
  return (
    <span className="adm-pill" title="Sessions with activity in the last 5 minutes">
      <span className={`adm-pill__dot${count > 0 ? " adm-pill__dot--on" : ""}`} aria-hidden="true" />
      <strong className="adm-num">{fmtInt(count)}</strong> active now
    </span>
  );
}

function OverviewSkeleton() {
  return (
    <div className="adm-stack" style={{ gap: 18 }} aria-busy="true">
      <div className="adm-kpis adm-kpis--5">
        {Array.from({ length: 5 }, (_, index) => (
          <div className="adm-kpi" key={index}>
            <Skel width="50%" height={12} />
            <Skel width="62%" height={28} style={{ marginTop: 10 }} />
            <Skel width="80%" height={11} style={{ marginTop: 10 }} />
          </div>
        ))}
      </div>
      <CardSkeleton lines={6} height={340} />
      <div className="adm-grid adm-grid--7-5">
        <CardSkeleton lines={5} height={260} />
        <CardSkeleton lines={5} height={260} />
      </div>
    </div>
  );
}

export default function OverviewPage() {
  useDocumentTitle("Overview");
  const { range, apiParams, setPreset, setCustom } = useRange();
  const { data, error, loading, reload } = useLoad((signal) => api.get("/overview", apiParams, signal), JSON.stringify(apiParams));

  const totals = data?.totals;
  const noActivity = totals && !totals.sessions && !totals.pageViews && !totals.leads && !totals.applications && !totals.subscribers;

  return (
    <div className="adm-page">
      <PageHeader
        eyebrow="Dashboard"
        title="Overview"
        lede={data ? `${fmtYmd(data.range.from)} to ${fmtYmd(data.range.to)} · ${plural(data.range.days, "day")} · compared with the ${data.range.days} days before` : "How the website is performing, and what needs a reply."}
      >
        {data ? <ActiveNow count={data.activeNow} /> : null}
        <button type="button" className="adm-btn" onClick={reload} disabled={loading} aria-label="Refresh the overview">
          <Icon name="refresh" size={16} className={loading ? "adm-spin" : ""} /> Refresh
        </button>
      </PageHeader>

      <div className="adm-toolbar">
        <RangePicker range={range} setPreset={setPreset} setCustom={setCustom} />
      </div>

      {error ? <ErrorBanner error={error} onRetry={reload} title="The overview could not be loaded." /> : null}

      {!data && loading ? <OverviewSkeleton /> : null}

      {data ? (
        <div className={`adm-stack${loading ? " adm-dim" : ""}`} style={{ gap: 18 }} aria-busy={loading}>
          <Attention pipeline={data.pipeline} />
          {noActivity ? (
            <Notice tone="info">
              No activity was recorded between {fmtYmd(data.range.from)} and {fmtYmd(data.range.to)}. Visits are recorded only for people who accept analytics on the public site; leads, applications and subscribers
              appear as soon as someone submits a form.
            </Notice>
          ) : null}
          <Kpis totals={data.totals} previous={data.previous} days={data.range.days} />
          <TrendCard series={data.series} />
          <div className="adm-grid adm-grid--7-5">
            <ChannelsCard channels={data.channels} />
            <FunnelCard funnel={data.funnel} />
          </div>
          <div className="adm-grid adm-grid--7-5">
            <TopPagesCard pages={data.topPages} />
            <div className="adm-stack">
              <DevicesCard devices={data.devices} />
              <ReferrersCard referrers={data.referrers} />
            </div>
          </div>
          <div className="adm-grid adm-grid--7-5">
            <LeadMixCard leadMix={data.leadMix} />
            <PipelineCard pipeline={data.pipeline} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
