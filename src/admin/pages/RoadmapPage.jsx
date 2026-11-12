import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { api, errorText } from "../api";
import { Badge } from "../components/Badge";
import { StatusSelect } from "../components/Controls";
import { EmptyState, ErrorBanner, Notice, Skel } from "../components/Feedback";
import { Field, InputField, SelectField } from "../components/Fields";
import Icon from "../components/icons";
import PageHeader from "../components/PageHeader";
import { DateOnly } from "../components/Time";
import { useToast } from "../context/contexts";
import { daysInclusive, fmtInt, todayYmd } from "../format";
import useLoad from "../hooks/useLoad";
import { useDocumentTitle } from "../hooks/useMisc";
import { MILESTONE_STATUSES, MILESTONE_TRACKS, asOptions, milestoneStatusLabel, milestoneTrackLabel } from "../labels";

const DETAIL_MAX = 600;

/** Days past the target date for a milestone that is not completed; 0 when it is on time. */
const overdueDays = (row, today) => (row.status !== "completed" && row.targetDate && row.targetDate < today ? daysInclusive(row.targetDate, today) - 1 : 0);

/** The inline editor for one milestone: status, target date, completed-on date and the public detail text. */
function MilestoneEditor({ row, statuses, onSave, onCancel }) {
  const [status, setStatus] = useState(row.status);
  const [targetDate, setTargetDate] = useState(row.targetDate ?? "");
  const [completedOn, setCompletedOn] = useState(row.completedOn ?? "");
  const [detail, setDetail] = useState(row.detail ?? "");
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    formRef.current?.querySelector("select, input, textarea")?.focus();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    if (!targetDate) {
      setErrors({ targetDate: "A target date is required." });
      return;
    }
    const body = {};
    if (status !== row.status) body.status = status;
    if (targetDate !== row.targetDate) body.targetDate = targetDate;
    if (status === "completed" && completedOn && completedOn !== row.completedOn) body.completedOn = completedOn;
    if (detail !== (row.detail ?? "")) body.detail = detail;
    if (Object.keys(body).length === 0) {
      onCancel();
      return;
    }
    setBusy(true);
    setErrors({});
    const result = await onSave(row, body);
    setBusy(false);
    if (result.ok) onCancel();
    else setErrors(result.error?.errors ?? {});
  };

  const completed = status === "completed";

  return (
    <form className="adm-mile__form" onSubmit={submit} ref={formRef} noValidate aria-label={`Edit milestone ${row.id}`}>
      <SelectField label="Status" value={status} onChange={setStatus} options={asOptions(statuses)} error={errors.status} />
      <InputField label="Target date" type="date" value={targetDate} onChange={setTargetDate} error={errors.targetDate} />
      <InputField
        label="Completed on"
        type="date"
        value={completed ? completedOn : ""}
        onChange={setCompletedOn}
        disabled={!completed}
        error={errors.completedOn}
        hint={completed ? (row.completedOn ? undefined : "Leave empty to record today’s date.") : "Only used when the status is Completed."}
      />
      <Field label="Detail shown on the public roadmap" error={errors.detail} className="adm-mile__detailfield" hint={`${fmtInt(detail.length)} / ${DETAIL_MAX}`}>
        {(props) => <textarea className="adm-textarea" rows={3} maxLength={DETAIL_MAX} value={detail} onChange={(event) => setDetail(event.target.value)} {...props} />}
      </Field>
      <div className="adm-mile__formactions">
        <button type="submit" className="adm-btn adm-btn--primary" disabled={busy}>
          {busy ? <Icon name="spinner" size={15} className="adm-spin" /> : <Icon name="save" size={15} />}
          Save changes
        </button>
        <button type="button" className="adm-btn" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function MilestoneRow({ row, statuses, today, editing, onEdit, onCancel, onSave }) {
  const late = overdueDays(row, today);
  return (
    <li className={`adm-mile${editing ? " adm-mile--editing" : ""}`} data-milestone={row.id}>
      <span className="adm-mile__id adm-mono">{row.id}</span>
      <div className="adm-mile__main">
        <div className="adm-mile__title">
          {row.title}
          {row.kind === "gate" ? (
            <Badge tone="violet" plain>
              Gate
            </Badge>
          ) : null}
        </div>
        {row.detail ? <p className="adm-mile__detail">{row.detail}</p> : null}
      </div>
      <div className="adm-mile__status">
        <StatusSelect label={`Status of ${row.id}`} labelHidden value={row.status} options={statuses} onSave={(next) => onSave(row, { status: next })} />
      </div>
      <div className="adm-mile__dates">
        <div>
          <span className="adm-muted">Target </span>
          <DateOnly value={row.targetDate} />
        </div>
        {row.completedOn ? (
          <div>
            <span className="adm-muted">Done </span>
            <DateOnly value={row.completedOn} />
          </div>
        ) : null}
        {late > 0 ? (
          <Badge tone="amber" plain>
            <Icon name="alert" size={12} /> Overdue by {late} {late === 1 ? "day" : "days"}
          </Badge>
        ) : null}
      </div>
      <div className="adm-mile__actions">
        <button type="button" className="adm-btn adm-btn--sm" aria-expanded={editing} aria-label={`${editing ? "Close editor for" : "Edit"} ${row.id}: ${row.title}`} onClick={editing ? onCancel : onEdit} data-mile-edit>
          <Icon name={editing ? "x" : "pencil"} size={14} /> {editing ? "Close" : "Edit"}
        </button>
      </div>
      {editing ? (
        <div className="adm-mile__editor">
          <MilestoneEditor row={row} statuses={statuses} onSave={onSave} onCancel={onCancel} />
        </div>
      ) : null}
    </li>
  );
}

/** The milestone tracker the public roadmap reads. Saves go live on the public site at once. */
export default function RoadmapPage() {
  useDocumentTitle("Roadmap");
  const toast = useToast();
  const { data, error, loading, reload, mutate } = useLoad((signal) => api.get("/milestones", undefined, signal), "milestones");
  const [editingId, setEditingId] = useState(null);
  const today = todayYmd();

  const statuses = data?.statuses?.length ? data.statuses : MILESTONE_STATUSES;
  const milestones = useMemo(() => data?.milestones ?? [], [data]);

  const groups = useMemo(() => {
    const byTrack = new Map();
    for (const milestone of milestones) {
      if (!byTrack.has(milestone.track)) byTrack.set(milestone.track, []);
      byTrack.get(milestone.track).push(milestone);
    }
    const known = MILESTONE_TRACKS.map((track) => track.id);
    const order = [...known.filter((id) => byTrack.has(id)), ...[...byTrack.keys()].filter((id) => !known.includes(id))];
    return order.map((id) => ({ id, label: milestoneTrackLabel(id), rows: byTrack.get(id) }));
  }, [milestones]);

  const summary = useMemo(() => {
    const counts = {};
    let overdue = 0;
    for (const milestone of milestones) {
      counts[milestone.status] = (counts[milestone.status] ?? 0) + 1;
      if (overdueDays(milestone, today) > 0) overdue += 1;
    }
    return { counts, overdue };
  }, [milestones, today]);

  const save = useCallback(
    async (row, body) => {
      try {
        const response = await api.patch(`/milestones/${encodeURIComponent(row.id)}`, body);
        mutate((previous) => previous && { ...previous, milestones: previous.milestones.map((item) => (item.id === row.id ? { ...item, ...response.milestone } : item)) });
        toast.success(`${row.id} saved. The public roadmap shows it now.`);
        return { ok: true };
      } catch (failure) {
        toast.error(errorText(failure));
        return { ok: false, error: failure };
      }
    },
    [mutate, toast],
  );

  const closeEditor = (id) => {
    setEditingId(null);
    // Put focus back on the Edit button that opened the editor.
    requestAnimationFrame(() => document.querySelector(`[data-milestone="${CSS.escape(id)}"] [data-mile-edit]`)?.focus());
  };

  return (
    <div className="adm-page">
      <PageHeader eyebrow="Company" title="Roadmap" lede="The milestones behind the public roadmap chart. Change a status or a date here and visitors see it straight away.">
        <a className="adm-btn" href="/roadmap" target="_blank" rel="noopener noreferrer">
          <Icon name="external" size={16} /> View public roadmap
        </a>
      </PageHeader>

      <Notice tone="info" icon="globe">
        <strong>Saves go live immediately.</strong> The public roadmap reads these milestones directly, so there is no draft or publish step. Completing a milestone without a date records today’s date.
      </Notice>

      {data ? (
        <ul className="adm-chips" aria-label="Milestones by status">
          {statuses.map((status) => (
            <li key={status.id} className="adm-tag">
              <strong className="adm-num">{fmtInt(summary.counts[status.id] ?? 0)}</strong> {milestoneStatusLabel(status.id)}
            </li>
          ))}
          <li className={`adm-tag${summary.overdue ? " adm-tag--warn" : ""}`}>
            <strong className="adm-num">{fmtInt(summary.overdue)}</strong> overdue
          </li>
        </ul>
      ) : null}

      {error ? <ErrorBanner error={error} onRetry={reload} title="The milestones could not be loaded." /> : null}
      {!data && loading ? (
        <div className="adm-stack" role="status" aria-label="Loading milestones">
          {Array.from({ length: 5 }, (_, index) => (
            <div className="adm-card adm-card--pad" key={index} style={{ display: "grid", gap: 8 }}>
              <Skel width="35%" height={14} />
              <Skel width="70%" height={12} />
            </div>
          ))}
        </div>
      ) : null}

      {data && milestones.length === 0 ? (
        <div className="adm-card">
          <EmptyState icon="roadmap" title="No milestones yet">
            Milestones are created from the roadmap data when the server starts.
          </EmptyState>
        </div>
      ) : null}

      {data ? (
        <div className={`adm-stack${loading ? " adm-dim" : ""}`} style={{ gap: 18 }} aria-busy={loading}>
          {groups.map((group) => {
            const late = group.rows.filter((row) => overdueDays(row, today) > 0).length;
            return (
              <section key={group.id} className="adm-card" aria-labelledby={`track-${group.id}`}>
                <div className="adm-card__head">
                  <div>
                    <h2 className="adm-h2" id={`track-${group.id}`}>
                      {group.label}
                    </h2>
                    <p className="adm-card__sub">
                      {fmtInt(group.rows.length)} milestones{late ? ` · ${fmtInt(late)} overdue` : ""}
                    </p>
                  </div>
                </div>
                <ul className="adm-miles">
                  {group.rows.map((row) => (
                    <MilestoneRow
                      key={row.id}
                      row={row}
                      statuses={statuses}
                      today={today}
                      editing={editingId === row.id}
                      onEdit={() => setEditingId(row.id)}
                      onCancel={() => closeEditor(row.id)}
                      onSave={save}
                    />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
