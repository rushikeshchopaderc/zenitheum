import { StatusBadge } from "../components/Badge";
import Delivery from "../components/Delivery";
import { SearchBox, SelectField } from "../components/Fields";
import FilterBar from "../components/FilterBar";
import Icon from "../components/icons";
import ListView from "../components/ListView";
import PageHeader from "../components/PageHeader";
import { Time } from "../components/Time";
import { describePreference, fmtInt } from "../format";
import useListPage from "../hooks/useListPage";
import { useDocumentTitle } from "../hooks/useMisc";
import { CHIPS, DEMO_STATUSES, asOptions, demoTimeLabel } from "../labels";
import DemoDrawer from "./DemoDrawer";

const FILTER_KEYS = ["status", "chip"];

/** Demo requests, newest first. The customer's preferred day and time are wishes: the team confirms by email. */
export default function DemosPage() {
  useDocumentTitle("Demos");
  const list = useListPage({ path: "/demos", filterKeys: FILTER_KEYS, exportKind: "demos" });
  const { filters, setFilter, clearFilters, activeCount, anyActive, exportUrl, total, data, selected, openRow, closeDrawer, updateRow, removeRow, returnFocus } = list;

  const columns = [
    {
      key: "company",
      header: "Company",
      primary: true,
      minWidth: 200,
      cell: (row) => (
        <span className="adm-cellstack" style={{ gap: 0 }}>
          <span style={{ color: "var(--adm-text)", fontWeight: 600 }} className="adm-break">
            {row.organisation}
          </span>
          <span className="adm-cell2">{row.name}</span>
        </span>
      ),
    },
    {
      key: "wants",
      header: "Preferred day and time",
      minWidth: 200,
      cell: (row) => {
        const wish = describePreference(row, demoTimeLabel);
        return (
          <>
            <span>{wish.text}</span>
            {wish.relative ? <span className="adm-cell2">{wish.relative}</span> : null}
          </>
        );
      },
    },
    { key: "chip", header: "Chip and delivery", minWidth: 170, cell: (row) => <Delivery chip={row.chip} analogFormat={row.analogFormat} /> },
    { key: "status", header: "Status", cell: (row) => <StatusBadge kind="demo" value={row.status} /> },
    { key: "requested", header: "Requested", nowrap: true, cell: (row) => <Time value={row.createdAt} /> },
  ];

  const card = {
    title: (row) => (
      <>
        <span>{row.organisation}</span>
        <span className="adm-cell2">{row.name}</span>
      </>
    ),
    badge: (row) => <StatusBadge kind="demo" value={row.status} />,
    meta: (row) => [describePreference(row, demoTimeLabel).text, <Delivery key="d" chip={row.chip} analogFormat={row.analogFormat} />, <Time key="t" value={row.createdAt} />],
  };

  return (
    <div className="adm-page">
      <PageHeader eyebrow="Customers" title="Demos" lede="Demo requests from the public site. Email the customer a time, then set the status to Scheduled and note the time in the internal notes." />

      <FilterBar
        search={<SearchBox label="Search demos" value={filters.q} onCommit={(value) => setFilter("q", value)} placeholder="Search name, email, company or reference" />}
        panelActive={activeCount}
        anyActive={anyActive}
        onClear={clearFilters}
        summary={data ? `${fmtInt(total)} ${total === 1 ? "demo request" : "demo requests"}${anyActive ? " match" : ""}` : "Loading…"}
        actions={
          <a className="adm-btn adm-btn--sm" href={exportUrl} download>
            <Icon name="download" size={14} /> Export CSV
          </a>
        }
      >
        <SelectField label="Status" value={filters.status} onChange={(value) => setFilter("status", value)} options={asOptions(DEMO_STATUSES)} allLabel="Any status" />
        <SelectField label="Chip" value={filters.chip} onChange={(value) => setFilter("chip", value)} options={asOptions(CHIPS)} allLabel="Any chip" />
      </FilterBar>

      <ListView
        list={list}
        columns={columns}
        card={card}
        label="Demos"
        noun="demo requests"
        emptyIcon="demos"
        emptyTitle="No demo requests yet"
        emptyText="Demos that visitors request on the public site will appear here."
        onOpen={(row) => openRow(row.id)}
      />

      {selected ? <DemoDrawer key={selected.id} row={selected} onClose={closeDrawer} onUpdated={updateRow} onRemoved={removeRow} returnFocus={returnFocus} /> : null}
    </div>
  );
}
