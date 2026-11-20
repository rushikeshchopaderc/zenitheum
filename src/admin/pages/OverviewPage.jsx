import { Link } from "react-router-dom";

import { api } from "../api";
import { Card } from "../components/Cards";
import Delivery from "../components/Delivery";
import { CardSkeleton, EmptyState, ErrorBanner, Skel } from "../components/Feedback";
import Icon from "../components/icons";
import MeetActions from "../components/MeetActions";
import PageHeader from "../components/PageHeader";
import { BUSINESS_TZ_LABEL, describeSlot, fmtInt, fmtRelativeDay, fmtYmd } from "../format";
import useLoad from "../hooks/useLoad";
import { useDocumentTitle } from "../hooks/useMisc";

/** The counts and lists from /overview, plus every upcoming demo (to count the ones that still need a Meet link). */
const load = async (signal) => {
  const [overview, upcoming] = await Promise.all([api.get("/overview", undefined, signal), api.get("/demos", { upcoming: "1", limit: 200 }, signal)]);
  return { overview, upcoming };
};

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

function Tiles({ counts, upcoming }) {
  const noMeet = upcoming.rows.filter((demo) => !demo.meetLink).length;
  const next = upcoming.rows[0];
  const count = (group, status) => counts?.[group]?.[status] ?? 0;
  const newOrders = count("orders", "new");
  const newQuestions = count("contacts", "new");
  const newApplications = count("applications", "new");
  return (
    <div className="adm-tiles">
      <Tile to="/admin/demos" icon="demos" value={upcoming.total} label="Upcoming demos" hint={next ? `Next ${describeSlot(next).relative}` : "None booked"} tone={upcoming.total ? "on" : null} />
      <Tile to="/admin/demos" icon="video" value={noMeet} label="Demos without a Meet link" hint={noMeet ? "Attendees cannot join yet" : "Every demo has a link"} tone={noMeet ? "warn" : null} />
      <Tile to="/admin/orders?status=new" icon="orders" value={newOrders} label="New orders" hint={newOrders ? "Waiting to be confirmed" : "Nothing waiting"} tone={newOrders ? "on" : null} />
      <Tile to="/admin/questions?status=new" icon="questions" value={newQuestions} label="New questions" hint={newQuestions ? "Awaiting a reply" : "All answered"} tone={newQuestions ? "on" : null} />
      <Tile to="/admin/applications?status=new" icon="applications" value={newApplications} label="New applications" hint={newApplications ? "Waiting to be reviewed" : "Nothing waiting"} tone={newApplications ? "on" : null} />
      <Tile to="/admin/subscribers?status=active" icon="subscribers" value={count("subscribers", "active")} label="Active subscribers" hint="Receiving chip news" />
    </div>
  );
}

function UpcomingDemos({ demos }) {
  return (
    <Card
      title="Upcoming demos"
      subtitle={`Soonest first, in India time (${BUSINESS_TZ_LABEL}).`}
      actions={
        <Link className="adm-btn adm-btn--ghost adm-btn--sm" to="/admin/demos">
          All demos <Icon name="arrowRight" size={14} />
        </Link>
      }
    >
      {demos.length ? (
        <ul className="adm-feed">
          {demos.map((demo) => {
            const slot = describeSlot(demo);
            return (
              <li key={demo.id} className="adm-feed__item">
                <div className="adm-feed__main">
                  <div className="adm-feed__title">
                    <Link to={`/admin/demos?open=${encodeURIComponent(demo.id)}`}>{demo.organisation}</Link> <span className="adm-muted">{demo.name}</span>
                  </div>
                  <div>
                    <strong style={{ color: "var(--adm-text)" }}>
                      {slot.day}, {slot.time} {BUSINESS_TZ_LABEL}
                    </strong>{" "}
                    <span className="adm-muted">· {slot.relative}</span>
                  </div>
                  {slot.visitor ? (
                    <div className="adm-muted">
                      For the visitor: {slot.visitor.day}, {slot.visitor.time} ({slot.visitor.zone})
                    </div>
                  ) : null}
                  <Delivery chip={demo.chip} analogFormat={demo.analogFormat} />
                </div>
                <div className="adm-feed__actions">
                  <MeetActions meetLink={demo.meetLink} />
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState compact icon="demos" title="No upcoming demos">
          Demos that visitors book on the public site will appear here with a link to join.
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

/** What needs a person today: demos coming up, orders and questions waiting, applications to review. */
export default function OverviewPage() {
  useDocumentTitle("Overview");
  const { data, error, loading, reload } = useLoad(load, "overview");

  return (
    <div className="adm-page">
      <PageHeader eyebrow="Dashboard" title="Overview" lede="What needs attention today: demos coming up, and orders, questions and applications waiting for a reply.">
        <button type="button" className="adm-btn" onClick={reload} disabled={loading} aria-label="Refresh the overview">
          <Icon name="refresh" size={16} className={loading ? "adm-spin" : ""} /> Refresh
        </button>
      </PageHeader>

      {error ? <ErrorBanner error={error} onRetry={reload} title="The overview could not be loaded." /> : null}
      {!data && loading ? <OverviewSkeleton /> : null}

      {data ? (
        <div className={`adm-stack${loading ? " adm-dim" : ""}`} style={{ gap: 18 }} aria-busy={loading}>
          <Tiles counts={data.overview.counts} upcoming={data.upcoming} />
          <div className="adm-grid adm-grid--7-5">
            <UpcomingDemos demos={data.overview.upcomingDemos} />
            <NewOrders orders={data.overview.newOrders} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
