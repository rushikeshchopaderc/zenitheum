import { useMemo, useRef, useState } from "react";

import { fmtInt } from "../format";
import { useElementWidth } from "../hooks/useMisc";
import { axisFormatter, labelIndices, niceTicks, roundedTopBar } from "./scales";

/** Fixed slots in a fixed order (sessions blue, leads orange, applications aqua). Colour follows the series. */
const TREND_SERIES = [
  { id: "sessions", label: "Sessions", color: "var(--adm-s1)" },
  { id: "leads", label: "Leads", color: "var(--adm-s2)" },
  { id: "applications", label: "Applications", color: "var(--adm-s3)" },
];

const describe = (bucket) => `${bucket.long}: ${fmtInt(bucket.sessions)} sessions, ${fmtInt(bucket.leads)} leads, ${fmtInt(bucket.applications)} applications`;

/**
 * Sessions as an area/line over a shared x-axis with leads and applications as stacked columns beneath it.
 * Two panels with their own scales, never one dual-axis plot. One crosshair + one tooltip list every series
 * at the pointed day; the same readout follows the arrow keys. A table view (in the card) is the other way in.
 */
export default function TrendChart({ buckets, unit }) {
  const wrapRef = useRef(null);
  const width = useElementWidth(wrapRef, 720);
  const [active, setActive] = useState(null);
  const [byKeyboard, setByKeyboard] = useState(false);

  const count = buckets.length;
  const narrow = width < 520;
  const M = { top: 22, right: 10, bottom: 26, left: narrow ? 38 : 46 };
  const TOP_H = narrow ? 140 : 168;
  const GAP = 32;
  const BOT_H = narrow ? 76 : 92;
  const height = M.top + TOP_H + GAP + BOT_H + M.bottom;
  const innerW = Math.max(width - M.left - M.right, 60);
  const step = innerW / count;
  const x = (index) => M.left + step * (index + 0.5);

  const sessionAxis = useMemo(() => niceTicks(Math.max(...buckets.map((bucket) => bucket.sessions), 0), 4), [buckets]);
  const convAxis = useMemo(() => niceTicks(Math.max(...buckets.map((bucket) => bucket.leads + bucket.applications), 0), 2, { integer: true }), [buckets]);
  const fmtSessions = axisFormatter(sessionAxis.ticks);
  const fmtConv = axisFormatter(convAxis.ticks);

  const topBase = M.top + TOP_H;
  const botTop = topBase + GAP;
  const botBase = botTop + BOT_H;
  const yTop = (value) => topBase - (value / sessionAxis.max) * TOP_H;
  const yBot = (value) => botBase - (value / convAxis.max) * BOT_H;

  const points = buckets.map((bucket, index) => `${x(index).toFixed(1)},${yTop(bucket.sessions).toFixed(1)}`);
  const line = `M${points.join("L")}`;
  const area = `${line}L${x(count - 1).toFixed(1)},${topBase}L${x(0).toFixed(1)},${topBase}Z`;

  let peak = 0;
  buckets.forEach((bucket, index) => {
    if (bucket.sessions > buckets[peak].sessions) peak = index;
  });
  const showPeak = count > 2 && buckets[peak].sessions > 0;
  const peakX = x(peak);
  const peakAnchor = peakX < M.left + 36 ? "start" : peakX > width - 48 ? "end" : "middle";

  const xLabels = labelIndices(count, Math.max(2, Math.floor(innerW / 84)));
  const barWidth = Math.max(1, Math.min(24, step - 2));

  const indexAt = (clientX) => {
    const box = wrapRef.current.getBoundingClientRect();
    const offset = clientX - box.left - M.left;
    return Math.min(Math.max(Math.floor(offset / step), 0), count - 1);
  };
  const onPointerMove = (event) => {
    setByKeyboard(false);
    setActive(indexAt(event.clientX));
  };
  const onPointerLeave = (event) => {
    if (event.pointerType === "mouse") setActive(null);
  };
  const onKeyDown = (event) => {
    const last = count - 1;
    let next = null;
    // With nothing selected yet, Right starts at the first point and Left at the latest.
    if (event.key === "ArrowRight") next = active === null ? 0 : Math.min(active + 1, last);
    else if (event.key === "ArrowLeft") next = active === null ? last : Math.max(active - 1, 0);
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    else if (event.key === "Escape") {
      setActive(null);
      return;
    }
    if (next !== null) {
      event.preventDefault();
      setByKeyboard(true);
      setActive(next);
    }
  };

  const shown = active === null ? null : buckets[active];
  const tipRight = shown && x(active) > width * 0.55;

  return (
    <div className="adm-trend">
      <ul className="adm-legend" aria-label="Series">
        <li>
          <span className="adm-legend__line" style={{ background: TREND_SERIES[0].color }} aria-hidden="true" />
          Sessions
        </li>
        <li>
          <span className="adm-legend__box" style={{ background: TREND_SERIES[1].color }} aria-hidden="true" />
          Leads
        </li>
        <li>
          <span className="adm-legend__box" style={{ background: TREND_SERIES[2].color }} aria-hidden="true" />
          Applications
        </li>
      </ul>

      <div
        ref={wrapRef}
        className="adm-trend__plot"
        tabIndex={0}
        role="group"
        aria-label={`Sessions, leads and applications per ${unit}. Use the left and right arrow keys to read each ${unit}, or open the table view.`}
        onPointerMove={onPointerMove}
        onPointerDown={onPointerMove}
        onPointerLeave={onPointerLeave}
        onKeyDown={onKeyDown}
        onFocus={(event) => {
          if (active === null && event.target === event.currentTarget && event.currentTarget.matches(":focus-visible")) {
            setByKeyboard(true);
            setActive(count - 1);
          }
        }}
        onBlur={() => setActive(null)}
      >
        <svg
          className="adm-trend__svg"
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMinYMin meet"
          aria-hidden="true"
          focusable="false"
        >
          <text className="adm-chart-caption" x={M.left} y={M.top - 9}>
            Sessions per {unit}
          </text>
          <text className="adm-chart-caption" x={M.left} y={botTop - 10}>
            Leads and applications per {unit}
          </text>

          {sessionAxis.ticks.map((tick) => (
            <g key={`s${tick}`}>
              <line className={tick === 0 ? "adm-axisline" : "adm-gridline"} x1={M.left} x2={M.left + innerW} y1={yTop(tick)} y2={yTop(tick)} />
              <text className="adm-axis-text" x={M.left - 8} y={yTop(tick) + 4} textAnchor="end">
                {fmtSessions(tick)}
              </text>
            </g>
          ))}
          {convAxis.ticks.map((tick) => (
            <g key={`c${tick}`}>
              <line className={tick === 0 ? "adm-axisline" : "adm-gridline"} x1={M.left} x2={M.left + innerW} y1={yBot(tick)} y2={yBot(tick)} />
              <text className="adm-axis-text" x={M.left - 8} y={yBot(tick) + 4} textAnchor="end">
                {fmtConv(tick)}
              </text>
            </g>
          ))}

          {shown ? <rect className="adm-trend__band" x={x(active) - step / 2} y={M.top - 4} width={step} height={botBase - M.top + 4} /> : null}

          <path d={area} className="adm-trend__area" />
          <path d={line} className="adm-trend__line" />

          {buckets.map((bucket, index) => {
            const leadsH = bucket.leads > 0 ? Math.max((bucket.leads / convAxis.max) * BOT_H, 2) : 0;
            const appsH = bucket.applications > 0 ? Math.max((bucket.applications / convAxis.max) * BOT_H, 2) : 0;
            const gap = leadsH && appsH ? 2 : 0;
            const bx = x(index) - barWidth / 2;
            const dim = shown && active !== index;
            return (
              <g key={bucket.key} opacity={dim ? 0.6 : 1}>
                {leadsH ? <path d={roundedTopBar(bx, botBase - leadsH, barWidth, leadsH, appsH ? 0 : 4)} className="adm-fill-2" /> : null}
                {appsH ? <path d={roundedTopBar(bx, botBase - leadsH - gap - appsH, barWidth, appsH, 4)} className="adm-fill-3" /> : null}
              </g>
            );
          })}

          {showPeak ? (
            <text className="adm-chart-label" x={peakX} y={yTop(buckets[peak].sessions) - 9} textAnchor={peakAnchor}>
              Peak {fmtInt(buckets[peak].sessions)}
            </text>
          ) : null}

          {xLabels.map((index) => (
            <text
              key={`x${index}`}
              className="adm-axis-text"
              x={x(index)}
              y={botBase + 18}
              textAnchor={x(index) < M.left + 22 ? "start" : x(index) > width - 26 ? "end" : "middle"}
            >
              {buckets[index].label}
            </text>
          ))}

          {shown ? <line className="adm-trend__cross" x1={x(active)} x2={x(active)} y1={M.top - 4} y2={botBase} /> : null}
          {shown ? (
            <>
              <circle cx={x(active)} cy={yTop(shown.sessions)} r={7} className="adm-ring" />
              <circle cx={x(active)} cy={yTop(shown.sessions)} r={4.5} className="adm-fill-1" />
            </>
          ) : (
            <>
              <circle cx={x(count - 1)} cy={yTop(buckets[count - 1].sessions)} r={6.5} className="adm-ring" />
              <circle cx={x(count - 1)} cy={yTop(buckets[count - 1].sessions)} r={4} className="adm-fill-1" />
            </>
          )}
        </svg>

        {shown ? (
          <div
            className="adm-tip adm-tip--trend"
            role="presentation"
            style={{ left: x(active), top: M.top + 6, transform: tipRight ? "translateX(calc(-100% - 14px))" : "translateX(14px)" }}
          >
            <div className="adm-tip__title">{shown.long}</div>
            {TREND_SERIES.map((series) => (
              <div className="adm-tip__row" key={series.id}>
                <span className="adm-tip__key" style={{ background: series.color }} aria-hidden="true" />
                <span className="adm-tip__val adm-num">{fmtInt(shown[series.id])}</span>
                <span className="adm-tip__name">{series.label}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <div className="adm-sr" aria-live="polite">
        {shown && byKeyboard ? describe(shown) : ""}
      </div>
    </div>
  );
}

/** The table twin of the trend chart. */
export function TrendTable({ buckets, unit }) {
  return (
    <div className="adm-tablewrap adm-tablewrap--flat" tabIndex={0} role="region" aria-label={`Data table, one row per ${unit}`}>
      <table className="adm-table">
        <thead>
          <tr>
            <th scope="col">{unit === "week" ? "Week" : "Day"}</th>
            <th scope="col" className="adm-right">
              Sessions
            </th>
            <th scope="col" className="adm-right">
              Page views
            </th>
            <th scope="col" className="adm-right">
              Leads
            </th>
            <th scope="col" className="adm-right">
              Applications
            </th>
          </tr>
        </thead>
        <tbody>
          {[...buckets].reverse().map((bucket) => (
            <tr key={bucket.key}>
              <th scope="row" className="adm-nowrap" style={{ textTransform: "none", letterSpacing: 0, fontSize: 13, color: "var(--adm-body)", fontWeight: 500 }}>
                {bucket.long}
              </th>
              <td className="adm-right adm-num">{fmtInt(bucket.sessions)}</td>
              <td className="adm-right adm-num">{fmtInt(bucket.pageViews)}</td>
              <td className="adm-right adm-num">{fmtInt(bucket.leads)}</td>
              <td className="adm-right adm-num">{fmtInt(bucket.applications)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
