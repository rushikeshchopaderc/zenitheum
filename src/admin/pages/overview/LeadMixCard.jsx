import { useMemo, useState } from "react";

import StackedBars from "../../charts/StackedBars";
import { Card, TableToggle } from "../../components/Cards";
import { EmptyState } from "../../components/Feedback";
import { fmtInt } from "../../format";
import { CHIPS, chipLabel, segmentLabel } from "../../labels";

const UNSPECIFIED = "unspecified";

/** One colour per chip, fixed by its place in the shared CHIPS list (never by this period's ranking). */
const colorOf = (id) => {
  const index = CHIPS.findIndex((chip) => chip.id === id);
  return index >= 0 && index < 8 ? `var(--adm-s${index + 1})` : "var(--adm-other)";
};
const nameOf = (id) => (id === UNSPECIFIED ? "Not specified" : chipLabel(id));

/** Leads by customer segment, each bar split by the chip they asked about. */
export default function LeadMixCard({ leadMix }) {
  const [table, setTable] = useState(false);

  const { rows, series } = useMemo(() => {
    const bySegment = new Map();
    const seen = new Set();
    for (const entry of leadMix) {
      const row = bySegment.get(entry.segment) ?? { key: entry.segment, label: entry.segment === UNSPECIFIED ? "Not specified" : segmentLabel(entry.segment), total: 0, byChip: {} };
      row.total += entry.leads;
      row.byChip[entry.chip] = (row.byChip[entry.chip] ?? 0) + entry.leads;
      bySegment.set(entry.segment, row);
      seen.add(entry.chip);
    }
    const ids = [...CHIPS.map((chip) => chip.id), ...[...seen].filter((id) => !CHIPS.some((chip) => chip.id === id) && id !== UNSPECIFIED), UNSPECIFIED].filter((id) => seen.has(id));
    const list = [...bySegment.values()]
      .sort((a, b) => b.total - a.total)
      .map((row) => ({ ...row, parts: ids.map((id) => ({ id, label: nameOf(id), value: row.byChip[id] ?? 0, color: colorOf(id) })) }));
    return { rows: list, series: ids };
  }, [leadMix]);

  return (
    <Card
      title="Lead mix"
      subtitle="Leads by customer segment, split by the chip they asked about."
      actions={rows.length ? <TableToggle pressed={table} onToggle={() => setTable((value) => !value)} /> : null}
    >
      {!rows.length ? (
        <EmptyState compact icon="leads" title="No leads in this period">
          Segment and chip appear for every enquiry sent through the contact form.
        </EmptyState>
      ) : table ? (
        <div className="adm-tablewrap adm-tablewrap--flat" tabIndex={0} role="region" aria-label="Lead mix as a table">
          <table className="adm-table">
            <thead>
              <tr>
                <th scope="col">Segment</th>
                {series.map((id) => (
                  <th key={id} scope="col" className="adm-right">
                    {nameOf(id)}
                  </th>
                ))}
                <th scope="col" className="adm-right">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key}>
                  <td>{row.label}</td>
                  {row.parts.map((part) => (
                    <td key={part.id} className="adm-right adm-num">
                      {fmtInt(part.value)}
                    </td>
                  ))}
                  <td className="adm-right adm-num">
                    <strong>{fmtInt(row.total)}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="adm-stack" style={{ gap: 14 }}>
          <ul className="adm-legend" aria-label="Chips">
            {series.map((id) => (
              <li key={id}>
                <span className="adm-legend__box" style={{ background: colorOf(id) }} aria-hidden="true" />
                {nameOf(id)}
              </li>
            ))}
          </ul>
          <StackedBars rows={rows} />
        </div>
      )}
    </Card>
  );
}
