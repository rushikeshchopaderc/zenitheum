import { ChannelTag, StatusBadge } from "../components/Badge";
import { InputField, SearchBox, SelectField } from "../components/Fields";
import FilterBar from "../components/FilterBar";
import Icon from "../components/icons";
import ListView from "../components/ListView";
import PageHeader from "../components/PageHeader";
import { Time } from "../components/Time";
import { fmtInt } from "../format";
import useListPage from "../hooks/useListPage";
import { useDocumentTitle } from "../hooks/useMisc";
import { CHANNELS, CHIPS, CONTACT_STATUSES, CONTACT_TOPICS, SEGMENTS, asOptions, chipLabel, segmentLabel, topicLabel } from "../labels";
import LeadDrawer from "./LeadDrawer";

const FILTER_KEYS = ["status", "topic", "segment", "chip", "channel", "from", "to"];

const who = (row) => [row.organisation, row.jobTitle].filter(Boolean).join(" · ") || row.email;

/** Enquiries from the contact form: filter, open one, reply, triage, export. */
export default function LeadsPage() {
  useDocumentTitle("Leads");
  const list = useListPage({ path: "/contacts", filterKeys: FILTER_KEYS, exportKind: "contacts" });
  const { filters, setFilter, clearFilters, activeCount, anyActive, exportUrl, total, selected, openRow, closeDrawer, updateRow, removeRow, returnFocus } = list;

  const columns = [
    {
      key: "name",
      header: "Name",
      primary: true,
      minWidth: 210,
      cell: (row) => (
        <>
          <span>{row.name}</span>
          <span className="adm-cell2">{who(row)}</span>
        </>
      ),
    },
    { key: "topic", header: "Topic", minWidth: 170, cell: (row) => <span className="adm-break">{topicLabel(row.topic)}</span> },
    {
      key: "segment",
      header: "Segment",
      minWidth: 180,
      cell: (row) => (
        <span className="adm-cellstack">
          <span>{segmentLabel(row.segment) || "–"}</span>
          {row.chip ? <span className="adm-tag">{chipLabel(row.chip)}</span> : null}
        </span>
      ),
    },
    { key: "status", header: "Status", cell: (row) => <StatusBadge kind="contact" value={row.status} /> },
    {
      key: "source",
      header: "Source",
      minWidth: 140,
      cell: (row) => (
        <span className="adm-cellstack">
          <ChannelTag channel={row.channel} />
          {row.utmCampaign ? <span className="adm-mono adm-muted adm-break">{row.utmCampaign}</span> : null}
        </span>
      ),
    },
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
    meta: (row) => [
      topicLabel(row.topic),
      [segmentLabel(row.segment), chipLabel(row.chip)].filter(Boolean).join(" · "),
      <span key="src">
        {row.channel ? <ChannelTag channel={row.channel} /> : "Unattributed"}
        {row.utmCampaign ? <span className="adm-mono"> {row.utmCampaign}</span> : null}
      </span>,
      <Time key="t" value={row.createdAt} />,
    ],
  };

  const dateError = filters.from && filters.to && filters.from > filters.to ? "The end date is before the start date." : undefined;

  return (
    <div className="adm-page">
      <PageHeader eyebrow="People" title="Leads" lede="Enquiries from prospective customers and design partners, with where each one came from." />

      <FilterBar
        search={<SearchBox label="Search leads" value={filters.q} onCommit={(value) => setFilter("q", value)} placeholder="Search name, email, organisation, message or reference" />}
        panelActive={activeCount}
        anyActive={anyActive}
        onClear={clearFilters}
        summary={list.data ? `${fmtInt(total)} ${total === 1 ? "lead" : "leads"}${anyActive ? " match" : ""}` : "Loading…"}
        actions={
          <a className="adm-btn adm-btn--sm" href={exportUrl} download>
            <Icon name="download" size={14} /> Export CSV
          </a>
        }
      >
        <SelectField label="Status" value={filters.status} onChange={(value) => setFilter("status", value)} options={asOptions(CONTACT_STATUSES)} allLabel="Any status" />
        <SelectField label="Topic" value={filters.topic} onChange={(value) => setFilter("topic", value)} options={asOptions(CONTACT_TOPICS)} allLabel="Any topic" />
        <SelectField label="Segment" value={filters.segment} onChange={(value) => setFilter("segment", value)} options={asOptions(SEGMENTS)} allLabel="Any segment" />
        <SelectField label="Chip" value={filters.chip} onChange={(value) => setFilter("chip", value)} options={asOptions(CHIPS)} allLabel="Any chip" />
        <SelectField label="Channel" value={filters.channel} onChange={(value) => setFilter("channel", value)} options={asOptions(CHANNELS)} allLabel="Any channel" />
        <InputField className="adm-field--date" label="Received from" type="date" value={filters.from} onChange={(value) => setFilter("from", value)} />
        <InputField className="adm-field--date" label="Received to" type="date" value={filters.to} onChange={(value) => setFilter("to", value)} error={dateError} />
      </FilterBar>
      <p className="adm-hint" style={{ marginTop: -8 }}>
        Dates are calendar days in the business time zone (IST); times in the table are in your local time.
      </p>

      <ListView
        list={list}
        columns={columns}
        card={card}
        label="Leads"
        noun="leads"
        emptyIcon="leads"
        emptyTitle="No enquiries yet"
        emptyText="Enquiries sent through the contact form on the public site will appear here, with the channel and campaign that brought each person."
        onOpen={(row) => openRow(row.id)}
      />

      {selected ? <LeadDrawer key={selected.id} row={selected} onClose={closeDrawer} onUpdated={updateRow} onRemoved={removeRow} returnFocus={returnFocus} /> : null}
    </div>
  );
}

