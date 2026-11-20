import { StatusBadge } from "../components/Badge";
import { InputField, SearchBox, SelectField } from "../components/Fields";
import FilterBar from "../components/FilterBar";
import Icon from "../components/icons";
import ListView from "../components/ListView";
import PageHeader from "../components/PageHeader";
import { Time } from "../components/Time";
import { fmtInt } from "../format";
import useListPage from "../hooks/useListPage";
import { useDocumentTitle } from "../hooks/useMisc";
import { CHIPS, CONTACT_STATUSES, SEGMENTS, asOptions, chipLabel, segmentLabel } from "../labels";
import QuestionDrawer from "./QuestionDrawer";

const FILTER_KEYS = ["status", "segment", "chip", "from", "to"];

const who = (row) => [row.organisation, row.jobTitle].filter(Boolean).join(" · ") || row.email;

/** Questions from the "ask a question" form: filter, open one, reply, triage, export. */
export default function QuestionsPage() {
  useDocumentTitle("Questions");
  const list = useListPage({ path: "/contacts", filterKeys: FILTER_KEYS, exportKind: "contacts" });
  const { filters, setFilter, clearFilters, activeCount, anyActive, exportUrl, total, data, selected, openRow, closeDrawer, updateRow, removeRow, returnFocus } = list;

  const columns = [
    {
      key: "name",
      header: "Name",
      primary: true,
      minWidth: 220,
      cell: (row) => (
        <>
          <span>{row.name}</span>
          <span className="adm-cell2">{who(row)}</span>
        </>
      ),
    },
    {
      key: "segment",
      header: "Customer segment",
      minWidth: 200,
      cell: (row) => (
        <span className="adm-cellstack">
          <span>{segmentLabel(row.segment) || "–"}</span>
          {row.chip ? <span className="adm-tag">{chipLabel(row.chip)}</span> : null}
        </span>
      ),
    },
    { key: "status", header: "Status", cell: (row) => <StatusBadge kind="contact" value={row.status} /> },
    { key: "received", header: "Received", nowrap: true, cell: (row) => <Time value={row.createdAt} /> },
  ];

  const card = {
    title: (row) => (
      <>
        <span>{row.name}</span>
        <span className="adm-cell2">{who(row)}</span>
      </>
    ),
    badge: (row) => <StatusBadge kind="contact" value={row.status} />,
    meta: (row) => [[segmentLabel(row.segment), chipLabel(row.chip)].filter(Boolean).join(" · "), <Time key="t" value={row.createdAt} />],
  };

  const dateError = filters.from && filters.to && filters.from > filters.to ? "The end date is before the start date." : undefined;

  return (
    <div className="adm-page">
      <PageHeader eyebrow="Customers" title="Questions" lede="Questions sent through the “ask a question” form on the public site." />

      <FilterBar
        search={<SearchBox label="Search questions" value={filters.q} onCommit={(value) => setFilter("q", value)} placeholder="Search name, email, company, message or reference" />}
        panelActive={activeCount}
        anyActive={anyActive}
        onClear={clearFilters}
        summary={data ? `${fmtInt(total)} ${total === 1 ? "question" : "questions"}${anyActive ? " match" : ""}` : "Loading…"}
        actions={
          <a className="adm-btn adm-btn--sm" href={exportUrl} download>
            <Icon name="download" size={14} /> Export CSV
          </a>
        }
      >
        <SelectField label="Status" value={filters.status} onChange={(value) => setFilter("status", value)} options={asOptions(CONTACT_STATUSES)} allLabel="Any status" />
        <SelectField label="Customer segment" value={filters.segment} onChange={(value) => setFilter("segment", value)} options={asOptions(SEGMENTS)} allLabel="Any segment" />
        <SelectField label="Chip" value={filters.chip} onChange={(value) => setFilter("chip", value)} options={asOptions(CHIPS)} allLabel="Any chip" />
        <InputField label="Received from" type="date" value={filters.from} onChange={(value) => setFilter("from", value)} />
        <InputField label="Received to" type="date" value={filters.to} onChange={(value) => setFilter("to", value)} error={dateError} />
      </FilterBar>
      <p className="adm-hint" style={{ marginTop: -8 }}>
        Dates are calendar days in India time (IST); times in the table are in your local time.
      </p>

      <ListView
        list={list}
        columns={columns}
        card={card}
        label="Questions"
        noun="questions"
        emptyIcon="questions"
        emptyTitle="No questions yet"
        emptyText="Questions sent through the form on the public site will appear here."
        onOpen={(row) => openRow(row.id)}
      />

      {selected ? <QuestionDrawer key={selected.id} row={selected} onClose={closeDrawer} onUpdated={updateRow} onRemoved={removeRow} returnFocus={returnFocus} /> : null}
    </div>
  );
}
