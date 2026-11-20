import { Badge, StatusBadge } from "../components/Badge";
import Delivery from "../components/Delivery";
import { SearchBox, SelectField } from "../components/Fields";
import FilterBar from "../components/FilterBar";
import Icon from "../components/icons";
import ListView from "../components/ListView";
import PageHeader from "../components/PageHeader";
import { Time } from "../components/Time";
import { BUSINESS_TZ_LABEL, describeSlot, fmtInt } from "../format";
import useListPage from "../hooks/useListPage";
import { useDocumentTitle } from "../hooks/useMisc";
import { CHIPS, DEMO_STATUSES, asOptions } from "../labels";
import DemoDrawer from "./DemoDrawer";

const FILTER_KEYS = ["status", "chip", "upcoming"];
const DEFAULTS = { upcoming: "1" };
const LIVE = ["requested", "scheduled"];

/** Meet status for a row: ready, missing (needs action while the demo is live), or not applicable. */
function MeetState({ row }) {
  if (row.meetLink) {
    return (
      <span className="adm-tag">
        <Icon name="video" size={13} /> Link ready
      </span>
    );
  }
  return LIVE.includes(row.status) ? <Badge tone="amber">No Meet link</Badge> : <span className="adm-muted">{"–"}</span>;
}

/** Demo bookings: soonest first by default, with the Meet link state visible at a glance. */
export default function DemosPage() {
  useDocumentTitle("Demos");
  const list = useListPage({ path: "/demos", filterKeys: FILTER_KEYS, defaults: DEFAULTS, exportKind: "demos" });
  const { filters, setFilter, clearFilters, activeCount, anyActive, exportUrl, total, data, selected, openRow, closeDrawer, updateRow, removeRow, returnFocus } = list;
  const upcoming = filters.upcoming !== "0";

  const columns = [
    {
      key: "when",
      header: "When (India time)",
      primary: true,
      minWidth: 200,
      cell: (row) => {
        const slot = describeSlot(row);
        return (
          <>
            <span>
              {slot.day}, {slot.time} {BUSINESS_TZ_LABEL}
            </span>
            <span className="adm-cell2">{slot.relative}</span>
            {slot.visitor ? (
              <span className="adm-cell2">
                Visitor {slot.visitor.time} {slot.visitor.zone}
              </span>
            ) : null}
          </>
        );
      },
    },
    {
      key: "company",
      header: "Company",
      minWidth: 180,
      cell: (row) => (
        <span className="adm-cellstack" style={{ gap: 0 }}>
          <span style={{ color: "var(--adm-text)", fontWeight: 600 }} className="adm-break">
            {row.organisation}
          </span>
          <span className="adm-cell2">{row.name}</span>
        </span>
      ),
    },
    { key: "chip", header: "Chip and delivery", minWidth: 170, cell: (row) => <Delivery chip={row.chip} analogFormat={row.analogFormat} /> },
    { key: "status", header: "Status", cell: (row) => <StatusBadge kind="demo" value={row.status} /> },
    { key: "meet", header: "Google Meet", cell: (row) => <MeetState row={row} /> },
    { key: "booked", header: "Booked", nowrap: true, cell: (row) => <Time value={row.createdAt} /> },
  ];

  const card = {
    title: (row) => {
      const slot = describeSlot(row);
      return (
        <>
          <span>
            {slot.day}, {slot.time} {BUSINESS_TZ_LABEL}
          </span>
          <span className="adm-cell2">{row.organisation}</span>
        </>
      );
    },
    badge: (row) => <StatusBadge kind="demo" value={row.status} />,
    meta: (row) => {
      const slot = describeSlot(row);
      return [slot.relative, row.name, slot.visitor ? `Visitor ${slot.visitor.time} ${slot.visitor.zone}` : null, <Delivery key="d" chip={row.chip} analogFormat={row.analogFormat} />];
    },
    foot: (row) => <MeetState row={row} />,
  };

  return (
    <div className="adm-page">
      <PageHeader eyebrow="Customers" title="Demos" lede="Booked product demonstrations, in India time. Each needs a Google Meet link so the attendee can join." />

      <FilterBar
        search={<SearchBox label="Search demos" value={filters.q} onCommit={(value) => setFilter("q", value)} placeholder="Search name, email, company or reference" />}
        panelActive={activeCount}
        anyActive={anyActive}
        onClear={clearFilters}
        summary={data ? `${fmtInt(total)} ${upcoming ? "upcoming " : ""}${total === 1 ? "demo" : "demos"}${anyActive ? " match" : ""}` : "Loading…"}
        actions={
          <a className="adm-btn adm-btn--sm" href={exportUrl} download>
            <Icon name="download" size={14} /> Export CSV
          </a>
        }
      >
        <SelectField label="Status" value={filters.status} onChange={(value) => setFilter("status", value)} options={asOptions(DEMO_STATUSES)} allLabel="Any status" />
        <SelectField label="Chip" value={filters.chip} onChange={(value) => setFilter("chip", value)} options={asOptions(CHIPS)} allLabel="Any chip" />
        <div className="adm-field" style={{ alignContent: "end" }}>
          <label className="adm-check">
            <input type="checkbox" checked={upcoming} onChange={(event) => setFilter("upcoming", event.target.checked ? null : "0")} />
            Upcoming only
          </label>
        </div>
      </FilterBar>

      <ListView
        list={list}
        columns={columns}
        card={card}
        label="Demos"
        noun="demos"
        emptyIcon="demos"
        emptyTitle={upcoming ? "No upcoming demos" : "No demos yet"}
        emptyText={upcoming ? "Demos that visitors book on the public site appear here with their time and Meet link." : "Demos that visitors book on the public site will appear here."}
        emptyAction={
          upcoming ? (
            <button type="button" className="adm-btn" onClick={() => setFilter("upcoming", "0")}>
              Show past demos too
            </button>
          ) : null
        }
        onOpen={(row) => openRow(row.id)}
      />

      {selected ? <DemoDrawer key={selected.id} row={selected} onClose={closeDrawer} onUpdated={updateRow} onRemoved={removeRow} returnFocus={returnFocus} /> : null}
    </div>
  );
}
