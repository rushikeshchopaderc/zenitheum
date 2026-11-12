import { errorText } from "../api";
import Icon from "./icons";

/** Inline error with a Retry button. `error` is an ApiError (or anything with a message). */
export function ErrorBanner({ error, onRetry, title }) {
  if (!error) return null;
  return (
    <div className="adm-banner" role="alert">
      <Icon name="alert" size={18} />
      <div className="adm-banner__text">
        {title ? <strong>{title} </strong> : null}
        {errorText(error)}
      </div>
      {onRetry ? (
        <button type="button" className="adm-btn adm-btn--sm" onClick={onRetry}>
          <Icon name="refresh" size={14} /> Retry
        </button>
      ) : null}
    </div>
  );
}

/** tone: "info" | "warn" | "ok" */
export function Notice({ tone = "info", icon = "info", children, action }) {
  return (
    <div className={`adm-banner adm-banner--${tone}`} role={tone === "warn" ? "alert" : "note"}>
      <Icon name={icon} size={18} />
      <div className="adm-banner__text">{children}</div>
      {action}
    </div>
  );
}

export function EmptyState({ icon = "info", title, children, action, compact = false }) {
  return (
    <div className={`adm-empty${compact ? " adm-empty--compact" : ""}`}>
      <div className="adm-empty__icon">
        <Icon name={icon} size={22} />
      </div>
      <h3>{title}</h3>
      {children ? <p>{children}</p> : null}
      {action}
    </div>
  );
}

/** One grey placeholder block. */
export function Skel({ width = "100%", height = 14, style }) {
  return <span className="adm-skel" style={{ width, height, ...style }} aria-hidden="true" />;
}

export function TableSkeleton({ rows = 6 }) {
  return (
    <div className="adm-tablewrap" role="status" aria-label="Loading">
      <div className="adm-skelrows">
        {Array.from({ length: rows }, (_, index) => (
          <div className="adm-skelrow" key={index}>
            <span style={{ display: "grid", gap: 7 }}>
              <Skel width="58%" height={14} />
              <Skel width="36%" height={11} />
            </span>
            <Skel width="70%" />
            <Skel width="60%" />
            <Skel width="50%" />
          </div>
        ))}
      </div>
      <span className="adm-sr">Loading…</span>
    </div>
  );
}

export function CardSkeleton({ lines = 4, height }) {
  return (
    <div className="adm-card adm-card--pad" role="status" aria-label="Loading" style={height ? { minHeight: height } : undefined}>
      <div style={{ display: "grid", gap: 12 }}>
        <Skel width="40%" height={16} />
        {Array.from({ length: lines }, (_, index) => (
          <Skel key={index} width={`${92 - index * 11}%`} height={12} />
        ))}
      </div>
      <span className="adm-sr">Loading…</span>
    </div>
  );
}
