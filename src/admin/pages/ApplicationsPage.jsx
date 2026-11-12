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
import { APPLICATION_STATUSES, CHANNELS, JOB_LIST, TRACK_LIST, asOptions, trackLabel } from "../labels";
import ApplicationDrawer from "./ApplicationDrawer";

const FILTER_KEYS = ["job", "status", "track", "channel", "from", "to"];

const roleOf = (row) => (
  <>
    <span>{row.jobTitle}</span>
    {row.track ? <span className="adm-cell2">{trackLabel(row.track)}</span> : null}
  </>
);

/** Job applications: filter by role and stage, open one, download the résumé, move it along the pipeline. */
export default function ApplicationsPage() {
  useDocumentTitle("Applications");
  const list = useListPage({ path: "/applications", filterKeys: FILTER_KEYS, exportKind: "applications" });
  const { filters, setFilter, clearFilters, activeCount, anyActive, exportUrl, total, selected, openRow, closeDrawer, updateRow, removeRow, returnFocus } = list;

  const columns = [
    {
      key: "name",
      header: "Applicant",
      primary: true,
      minWidth: 210,
      cell: (row) => (
        <>
          <span>{row.name}</span>
          <span className="adm-cell2">{row.organisation || row.email}</span>
        </>
      ),
    },
    { key: "role", header: "Role", minWidth: 190, cell: (row) => <span className="adm-cellstack" style={{ gap: 0 }}>{roleOf(row)}</span> },
    { key: "status", header: "Stage", cell: (row) => <StatusBadge kind="application" value={row.status} /> },
    {
      key: "resume",
      header: "Résumé",
      cell: (row) =>
        row.hasResume ? (
          <span className="adm-tag">
            <Icon name="file" size={13} /> Attached
          </span>
        ) : (
          <span className="adm-muted">None</span>
        ),
    },
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
    { key: "received", header: "Applied", nowrap: true, cell: (row) => <Time value={row.createdAt} /> },
  ];

  const card = {
    title: (row) => (
      <>
        <span>{row.name}</span>
        <span className="adm-cell2">{row.jobTitle}</span>
      </>
    ),
    badge: (row) => <StatusBadge kind="application" value={row.status} />,
    meta: (row) => [
      row.track ? trackLabel(row.track) : null,
      row.hasResume ? "Résumé attached" : "No résumé",
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
      <PageHeader eyebrow="People" title="Applications" lede="Job applications from the careers pages, with résumés and where each applicant came from." />

      <FilterBar
        search={<SearchBox label="Search applications" value={filters.q} onCommit={(value) => setFilter("q", value)} placeholder="Search name, email, institute, role or reference" />}
        panelActive={activeCount}
        anyActive={anyActive}
        onClear={clearFilters}
        summary={list.data ? `${fmtInt(total)} ${total === 1 ? "application" : "applications"}${anyActive ? " match" : ""}` : "Loading…"}
        actions={
          <a className="adm-btn adm-btn--sm" href={exportUrl} download>
            <Icon name="download" size={14} /> Export CSV
          </a>
        }
      >
        <SelectField label="Role" value={filters.job} onChange={(value) => setFilter("job", value)} options={asOptions(JOB_LIST)} allLabel="Any role" />
        <SelectField label="Stage" value={filters.status} onChange={(value) => setFilter("status", value)} options={asOptions(APPLICATION_STATUSES)} allLabel="Any stage" />
        <SelectField label="Preferred track" value={filters.track} onChange={(value) => setFilter("track", value)} options={asOptions(TRACK_LIST)} allLabel="Any track" />
        <SelectField label="Channel" value={filters.channel} onChange={(value) => setFilter("channel", value)} options={asOptions(CHANNELS)} allLabel="Any channel" />
        <InputField label="Applied from" type="date" value={filters.from} onChange={(value) => setFilter("from", value)} />
        <InputField label="Applied to" type="date" value={filters.to} onChange={(value) => setFilter("to", value)} error={dateError} />
      </FilterBar>

      <ListView
        list={list}
        columns={columns}
        card={card}
        label="Applications"
        noun="applications"
        emptyIcon="applications"
        emptyTitle="No applications yet"
        emptyText="Applications submitted from the careers pages will appear here with their résumé and the channel that brought the applicant."
        onOpen={(row) => openRow(row.id)}
      />

      {selected ? <ApplicationDrawer key={selected.id} row={selected} onClose={closeDrawer} onUpdated={updateRow} onRemoved={removeRow} returnFocus={returnFocus} /> : null}
    </div>
  );
}
