import SegmentedBar from "../../charts/SegmentedBar";
import { Card } from "../../components/Cards";
import { EmptyState } from "../../components/Feedback";
import { fmtInt, fmtPct } from "../../format";
import { DEVICES, deviceLabel } from "../../labels";

const SLOT = (index) => (index < 3 ? `var(--adm-s${index + 1})` : "var(--adm-other)");

/** Device split: a thin segmented bar and, beside it, a list with a swatch, the figure and the share. */
export default function DevicesCard({ devices }) {
  const total = devices.reduce((sum, device) => sum + device.sessions, 0);
  // Colour follows the device (fixed order desktop, mobile, tablet), never its rank in this period.
  const order = DEVICES.map((device) => device.id);
  const colorOf = (id) => {
    const index = order.indexOf(id);
    return index >= 0 ? SLOT(index) : "var(--adm-other)";
  };
  const parts = devices.map((device) => ({ key: device.deviceType, label: deviceLabel(device.deviceType), value: device.sessions, color: colorOf(device.deviceType) }));
  return (
    <Card title="Devices" subtitle="Share of visits by device type.">
      {total ? (
        <div className="adm-stack" style={{ gap: 14 }}>
          <SegmentedBar parts={parts} label="Visits by device" />
          <ul className="adm-swatchlist">
            {parts.map((part) => (
              <li key={part.key}>
                <span className="adm-swatch" style={{ background: part.color }} aria-hidden="true" />
                <span className="adm-swatchlist__label">{part.label}</span>
                <strong className="adm-num">{fmtInt(part.value)}</strong>
                <span className="adm-bars__share adm-num">{fmtPct(part.value / total, 0)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <EmptyState compact icon="monitor" title="No visits yet">Device types appear once visits are recorded.</EmptyState>
      )}
    </Card>
  );
}
