import { useMemo } from "react";

import { api } from "../api";
import { fmtClock, fmtDateTime, fmtDuration, fmtInt, fmtOffset, languageName, placeName } from "../format";
import useLoad from "../hooks/useLoad";
import { channelLabel, deviceLabel } from "../labels";
import { DetailList } from "./Detail";
import { EmptyState, ErrorBanner, Skel } from "./Feedback";
import Icon from "./icons";

/** props are free text from the browser; show them as "key: value" pairs. */
function Props({ props }) {
  const entries = Object.entries(props ?? {});
  if (!entries.length) return null;
  return (
    <span className="adm-timeline__props">
      {entries.map(([key, value]) => (
        <span className="adm-tag adm-mono" key={key}>
          {key}: {String(value)}
        </span>
      ))}
    </span>
  );
}

function Timeline({ detail }) {
  const { session, pageViews, events } = detail;
  const items = useMemo(() => {
    const start = new Date(session.startedAt).getTime();
    const merged = [
      ...pageViews.map((view) => ({ kind: "page", at: view.occurredAt, view })),
      ...events.map((event) => ({ kind: "event", at: event.occurredAt, event })),
    ];
    merged.sort((a, b) => new Date(a.at) - new Date(b.at));
    return merged.map((item) => ({ ...item, offset: new Date(item.at).getTime() - start }));
  }, [session.startedAt, pageViews, events]);

  if (!items.length) return <p className="adm-hint">No pages or events were recorded for this visit.</p>;
  return (
    <ol className="adm-timeline">
      {items.map((item, index) => (
        <li key={index} className={`adm-timeline__item adm-timeline__item--${item.kind}`}>
          <span className="adm-timeline__dot" aria-hidden="true">
            <Icon name={item.kind === "page" ? "page" : "click"} size={13} />
          </span>
          <div className="adm-timeline__body">
            {item.kind === "page" ? (
              <>
                <div className="adm-timeline__title">
                  <span className="adm-sr">Viewed page </span>
                  <span className="adm-mono adm-break">{item.view.path}</span>
                </div>
                {item.view.title ? <div className="adm-timeline__sub adm-break">{item.view.title}</div> : null}
                <div className="adm-timeline__sub">
                  {item.view.durationMs ? `${fmtDuration(item.view.durationMs)} on page` : "Time on page not recorded"}
                  {item.view.maxScrollPct ? ` · scrolled ${item.view.maxScrollPct}%` : ""}
                </div>
              </>
            ) : (
              <>
                <div className="adm-timeline__title">
                  <span className="adm-sr">Event </span>
                  <span className="adm-mono adm-break">{item.event.name}</span>
                  {item.event.path ? <span className="adm-muted"> on </span> : null}
                  {item.event.path ? <span className="adm-mono adm-break adm-muted">{item.event.path}</span> : null}
                </div>
                <Props props={item.event.props} />
              </>
            )}
          </div>
          <time className="adm-timeline__time adm-num" dateTime={item.at} title={item.at}>
            {fmtOffset(item.offset)}
            <span className="adm-timeline__clock">{fmtClock(item.at)}</span>
          </time>
        </li>
      ))}
    </ol>
  );
}

/** One visit in full: where it came from, the device, and the pages and events in order. */
export function SessionDetail({ detail }) {
  const { session, pageViews, events } = detail;
  return (
    <div className="adm-stack" style={{ gap: 16 }}>
      <DetailList
        items={[
          { label: "Started", value: fmtDateTime(session.startedAt) },
          { label: "Channel", value: session.channel ? channelLabel(session.channel) : null },
          { label: "Campaign", value: session.utmCampaign, mono: true },
          { label: "Referrer", value: session.referrerHost },
          { label: "Device", value: [deviceLabel(session.deviceType), [session.browser, session.os].filter(Boolean).join(" on ")].filter(Boolean).join(" · ") },
          { label: "Place", value: session.country ? placeName(session.country) : session.timezone },
          { label: "Language", value: session.language ? languageName(session.language) : null },
          { label: "Time on site", value: session.activeMs ? fmtDuration(session.activeMs) : null },
          { label: "Activity", value: `${fmtInt(pageViews.length)} page view${pageViews.length === 1 ? "" : "s"}, ${fmtInt(events.length)} event${events.length === 1 ? "" : "s"}` },
        ]}
      />
      <Timeline detail={detail} />
    </div>
  );
}

/** Loads GET /sessions/:id and shows it. `sessionId` null means the lead has no linked visit. */
export default function SessionJourney({ sessionId }) {
  const { data, error, loading, reload } = useLoad((signal) => api.get(`/sessions/${encodeURIComponent(sessionId)}`, undefined, signal), String(sessionId), {
    enabled: Boolean(sessionId),
  });

  if (!sessionId) {
    return (
      <p className="adm-hint">
        No visit is linked to this record. The person either did not accept analytics, or their browsing data was erased.
      </p>
    );
  }
  if (!data && loading) {
    return (
      <div role="status" aria-label="Loading visit" style={{ display: "grid", gap: 10 }}>
        <Skel width="80%" />
        <Skel width="65%" />
        <Skel width="72%" />
        <span className="adm-sr">Loading…</span>
      </div>
    );
  }
  if (error?.status === 404) {
    return (
      <EmptyState compact icon="clock" title="That visit is no longer stored">
        Raw visit data is deleted after the retention period, or when a visitor asks to be forgotten. The campaign and channel copied onto the record are kept.
      </EmptyState>
    );
  }
  if (error && !data) return <ErrorBanner error={error} onRetry={reload} />;
  return data ? <SessionDetail detail={data} /> : null;
}
