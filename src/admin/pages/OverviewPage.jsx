import { Link } from "react-router-dom";

import { api } from "../api";
import { Card } from "../components/Cards";
import Delivery from "../components/Delivery";
import { CardSkeleton, EmptyState, ErrorBanner, Skel } from "../components/Feedback";
import Icon from "../components/icons";
import PageHeader from "../components/PageHeader";
import { describePreference, fmtInt, fmtRelativeDay, fmtYmd } from "../format";
import useLoad from "../hooks/useLoad";
import { useDocumentTitle } from "../hooks/useMisc";
import { demoTimeLabel } from "../labels";

/** The counts and short lists from /overview. */
const load = (signal) => api.get("/overview", undefined, signal);

/** A number that links to the screen it counts. `tone` highlights the ones that need a person. */
function Tile({ to, icon, value, label, hint, tone }) {
  return (
    <Link to={to} className={`adm-tile${tone ? ` adm-tile--${tone}` : ""}`}>
      <span className="adm-tile__top">
        <span className="adm-tile__icon" aria-hidden="true">
          <Icon name={icon} size={18} />
        </span>
        <span className="adm-tile__value">{fmtInt(value)}</span>
      </span>
      <span className="adm-tile__label">{label}</span>
      <span className="adm-tile__hint">{hint}</span>
    </Link>
  );
}

function Tiles({ counts }) {
  const count = (group, status) => counts?.[group]?.[status] ?? 0;
  const newDemos = count("demos", "requested");
  const scheduled = count("demos", "scheduled");
  const newOrders = count("orders", "new");
  const newQuestions = count("contacts", "new");
  const newApplications = count("applications", "new");
  return (
    <div className="adm-tiles">
      <Tile to="/admin/demos?status=requested" icon="demos" value={newDemos} label="New demo requests" hint={newDemos ? "Waiting for a time" : "All answered"} tone={newDemos ? "on" : null} />
      <Tile to="/admin/demos?status=scheduled" icon="video" value={scheduled} label="Scheduled demos" hint="Arranged with the customer" />
      <Tile to="/admin/orders?status=new" icon="orders" value={newOrders} label="New orders" hint={newOrders ? "Waiting to be confirmed" : "Nothing waiting"} tone={newOrders ? "on" : null} />
      <Tile to="/admin/questions?status=new" icon="questions" value={newQuestions} label="New questions" hint={newQuestions ? "Awaiting a reply" : "All answered"} tone={newQuestions ? "on" : null} />
      <Tile to="/admin/applications?status=new" icon="applications" value={newApplications} label="New applications" hint={newApplications ? "Waiting to be reviewed" : "Nothing waiting"} tone={newApplications ? "on" : null} />
      <Tile to="/admin/subscribers?status=active" icon="subscribers" value={count("subscribers", "active")} label="Active subscribers" hint="Receiving chip news" />
    </div>
  );
}

function NewDemos({ demos }) {
  return (
    <Card
      title="New demo requests"
      subtitle="Newest first. Email each customer a time that works."
      actions={
        <Link className="adm-btn adm-btn--ghost adm-btn--sm" to="/admin/demos?status=requested">
          All requests <Icon name="arrowRight" size={14} />
        </Link>
      }
    >
      {demos.length ? (
        <ul className="adm-feed">
          {demos.map((demo) => {
            const wish = describePreference(demo, demoTimeLabel);
            return (
              <li key={demo.id} className="adm-feed__item">
                <div className="adm-feed__main">
                  <div className="adm-feed__title">
                    <Link to={`/admin/demos?open=${encodeURIComponent(demo.id)}`}>{demo.organisation}</Link> <span className="adm-muted">{demo.name}</span>
                  </div>
                  <div>
                    <strong style={{ color: "var(--adm-text)" }}>{wish.text}</strong>
                    {wish.relative ? <span className="adm-muted"> · {wish.relative}</span> : null}
                  </div>
                  <Delivery chip={demo.chip} analogFormat={demo.analogFormat} />
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState compact icon="demos" title="No new demo requests">
          Demos that visitors request on the public site will appear here.
        </EmptyState>
      )}
    </Card>
  );
}

function NewOrders({ orders }) {
  return (
    <Card
      title="New orders"
      subtitle="Orders still waiting to be confirmed."
      actions={
        <Link className="adm-btn adm-btn--ghost adm-btn--sm" to="/admin/orders?status=new">
          All new orders <Icon name="arrowRight" size={14} />
        </Link>
      }
    >
      {orders.length ? (
        <ul className="adm-feed">
          {orders.map((order) => (
            <li key={order.id} className="adm-feed__item">
              <div className="adm-feed__main">
                <div className="adm-feed__title">
                  <Link to={`/admin/orders?open=${encodeURIComponent(order.id)}`}>{order.organisation}</Link> <span className="adm-muted">{order.contactName}</span>
                </div>
                <Delivery chip={order.chip} analogFormat={order.analogFormat} />
                <div>
                  <strong className="adm-num" style={{ color: "var(--adm-text)" }}>
                    {fmtInt(order.quantity)}
                  </strong>{" "}
                  {order.quantity === 1 ? "unit" : "units"} <span className="adm-muted">· delivery {fmtYmd(order.deliveryDate)}, {fmtRelativeDay(order.deliveryDate)}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState compact icon="orders" title="No new orders">
          New orders from the public site will appear here.
        </EmptyState>
      )}
    </Card>
  );
}

function OverviewSkeleton() {
  return (
    <div className="adm-stack" style={{ gap: 18 }} aria-busy="true">
      <div className="adm-tiles">
        {Array.from({ length: 6 }, (_, index) => (
          <div className="adm-tile" key={index}>
            <Skel width="40%" height={26} />
            <Skel width="70%" height={12} style={{ marginTop: 12 }} />
            <Skel width="55%" height={11} style={{ marginTop: 8 }} />
          </div>
        ))}
      </div>
      <div className="adm-grid adm-grid--7-5">
        <CardSkeleton lines={5} height={300} />
        <CardSkeleton lines={4} height={300} />
      </div>
    </div>
  );
}

/** What needs a person today: demo requests, orders and questions waiting, applications to review. */
export default function OverviewPage() {
  useDocumentTitle("Overview");
  const { data, error, loading, reload } = useLoad(load, "overview");

  return (
    <div className="adm-page">
      <PageHeader eyebrow="Dashboard" title="Overview" lede="What needs attention today: demo requests, orders, questions and applications waiting for a reply.">
        <button type="button" className="adm-btn" onClick={reload} disabled={loading} aria-label="Refresh the overview">
          <Icon name="refresh" size={16} className={loading ? "adm-spin" : ""} /> Refresh
        </button>
      </PageHeader>

      {error ? <ErrorBanner error={error} onRetry={reload} title="The overview could not be loaded." /> : null}
      {!data && loading ? <OverviewSkeleton /> : null}

      {data ? (
        <div className={`adm-stack${loading ? " adm-dim" : ""}`} style={{ gap: 18 }} aria-busy={loading}>
          <Tiles counts={data.counts} />
          <div className="adm-grid adm-grid--7-5">
            <NewDemos demos={data.newDemos} />
            <NewOrders orders={data.newOrders} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
