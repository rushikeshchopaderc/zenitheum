import { useState } from "react";

import { api, errorText } from "../api";
import { Badge, ChannelTag } from "../components/Badge";
import DangerZone from "../components/DangerZone";
import { Section } from "../components/Detail";
import Drawer from "../components/Drawer";
import { EmptyState, ErrorBanner, Skel } from "../components/Feedback";
import { SessionDetail } from "../components/SessionJourney";
import { useToast } from "../context/contexts";
import { fmtDateTime } from "../format";
import useLoad from "../hooks/useLoad";

/** One visit as a timeline (pages and events in order), with the visitor-level erase action. Loads by id. */
export default function SessionDrawer({ sessionId, row, onClose, onErased, returnFocus }) {
  const toast = useToast();
  const [busy, setBusy] = useState(null);
  const { data, error, loading, reload } = useLoad((signal) => api.get(`/sessions/${encodeURIComponent(sessionId)}`, undefined, signal), sessionId);

  const erase = async () => {
    setBusy("erase");
    try {
      await api.remove(`/visitors/${encodeURIComponent(data.session.visitorId)}`);
      toast.success("Browsing data erased");
      onErased();
      return { ok: true };
    } catch (failure) {
      toast.error(errorText(failure));
      return { ok: false };
    } finally {
      setBusy(null);
    }
  };

  const session = data?.session;
  const lead = row?.lead;
  const applied = row?.applied;

  return (
    <Drawer
      title={session ? `Visit on ${fmtDateTime(session.startedAt)}` : "Visit"}
      subtitle={
        session ? (
          <span style={{ display: "inline-flex", flexWrap: "wrap", alignItems: "center", gap: "4px 8px" }}>
            <ChannelTag channel={session.channel} />
            {lead ? <Badge tone="green">Became a lead</Badge> : null}
            {applied ? <Badge tone="violet">Applied for a job</Badge> : null}
          </span>
        ) : null
      }
      onClose={onClose}
      returnFocus={returnFocus}
      closeLabel="Close visit"
    >
      {!data && loading ? (
        <div role="status" aria-label="Loading visit" style={{ display: "grid", gap: 10 }}>
          <Skel width="80%" />
          <Skel width="60%" />
          <Skel width="70%" />
          <span className="adm-sr">Loading…</span>
        </div>
      ) : null}
      {error?.status === 404 ? (
        <EmptyState compact icon="clock" title="That visit is no longer stored">
          Raw visit data is deleted after the retention period, or when a visitor asks to be forgotten.
        </EmptyState>
      ) : error && !data ? (
        <ErrorBanner error={error} onRetry={reload} />
      ) : null}
      {data ? (
        <>
          <Section title="Visit" id="visit-detail">
            <SessionDetail detail={data} />
          </Section>
          <Section title="Visitor" id="visit-visitor">
            <p className="adm-hint">
              Visitor id <span className="adm-mono adm-break">{session.visitorId}</span>. One browser, possibly several visits.
            </p>
            <DangerZone busy={busy} erase={{ available: true, onConfirm: erase }} />
          </Section>
        </>
      ) : null}
    </Drawer>
  );
}
