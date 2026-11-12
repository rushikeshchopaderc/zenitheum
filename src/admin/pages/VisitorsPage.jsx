import { Badge, ChannelTag } from "../components/Badge";
import { InputField, SelectField } from "../components/Fields";
import FilterBar from "../components/FilterBar";
import Icon from "../components/icons";
import ListView from "../components/ListView";
import PageHeader from "../components/PageHeader";
import Tabs from "../components/Tabs";
import { Time } from "../components/Time";
import { fmtDuration, fmtInt } from "../format";
import useListPage from "../hooks/useListPage";
import { useDocumentTitle } from "../hooks/useMisc";
import { useQueryParams } from "../hooks/useQueryParams";
import { CHANNELS, DEVICES, asOptions, deviceLabel } from "../labels";
import SessionDrawer from "./SessionDrawer";

const SESSION_FILTERS = ["channel", "device", "converted", "from", "to"];
const EVENT_FILTERS = ["name", "from", "to"];
const TABS = [
  { id: "sessions", label: "Visits" },
  { id: "events", label: "Events" },
];

const deviceIcon = { desktop: "monitor", mobile: "smartphone", tablet: "tablet" };

/** "/ › /products › /contactus", the first few pages of a visit in order. */
const pathTrail = (pages) => {
  const list = Array.isArray(pages) ? pages : [];
  if (!list.length) return "";
  const head = list.slice(0, 3).join(" › ");
  return list.length > 3 ? `${head} › +${list.length - 3} more` : head;
};

function DateFilters({ filters, setFilter, label }) {
  const dateError = filters.from && filters.to && filters.from > filters.to ? "The end date is before the start date." : undefined;
  return (
    <>
      <InputField label={`${label} from`} type="date" value={filters.from} onChange={(value) => setFilter("from", value)} />
      <InputField label={`${label} to`} type="date" value={filters.to} onChange={(value) => setFilter("to", value)} error={dateError} />
    </>
  );
}

function SessionsTab() {
  const list = useListPage({ path: "/sessions", filterKeys: SESSION_FILTERS, exportKind: "sessions", keepOpenParam: true });
  const { filters, setFilter, clearFilters, activeCount, anyActive, exportUrl, total, rows, data, drawer, closeDrawer, returnFocus, reload, openRow } = list;
  const openRowData = drawer.id ? rows.find((row) => row.id === drawer.id) : undefined;

  const columns = [
    {
      key: "started",
      header: "Started",
      nowrap: true,
      primary: true,
      cell: (row) => <Time value={row.startedAt} />,
    },
    {
      key: "channel",
      header: "Channel",
      minWidth: 150,
      cell: (row) => (
        <span className="adm-cellstack">
          <ChannelTag channel={row.channel} />
          {row.utmCampaign ? <span className="adm-mono adm-muted adm-break">{row.utmCampaign}</span> : row.referrerHost ? <span className="adm-muted adm-break">{row.referrerHost}</span> : null}
        </span>
      ),
    },
    { key: "landing", header: "Landing page", minWidth: 120, cell: (row) => <span className="adm-mono adm-break">{row.landingPath}</span> },
    {
      key: "pages",
      header: "Pages viewed",
      minWidth: 170,
      cell: (row) => (
        <>
          <span className="adm-num">{fmtInt(row.pageViews)}</span>
          {row.pages?.length > 1 ? <span className="adm-cell2 adm-mono">{pathTrail(row.pages)}</span> : null}
        </>
      ),
    },
    { key: "time", header: "Time on site", nowrap: true, align: "right", cell: (row) => <span className="adm-num">{fmtDuration(row.activeMs)}</span> },
    {
      key: "device",
      header: "Device",
      minWidth: 150,
      cell: (row) => (
        <span className="adm-cellstack" style={{ gap: 2 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Icon name={deviceIcon[row.deviceType] ?? "monitor"} size={15} />
            {deviceLabel(row.deviceType)}
          </span>
          <span className="adm-muted">{[row.browser, row.os].filter(Boolean).join(" · ") || "–"}</span>
        </span>
      ),
    },
    {
      key: "flags",
      header: "Outcome",
      cell: (row) =>
        row.lead || row.applied ? (
          <span className="adm-cellstack">
            {row.lead ? <Badge tone="green">Lead</Badge> : null}
            {row.applied ? <Badge tone="violet">Applied</Badge> : null}
          </span>
        ) : (
          <span className="adm-muted">{"–"}</span>
        ),
    },
  ];

  const card = {
    title: (row) => (
      <>
        <Time value={row.startedAt} />
        <span className="adm-cell2 adm-mono">{row.landingPath}</span>
      </>
    ),
    badge: (row) =>
      row.lead || row.applied ? (
        <span className="adm-cellstack">
          {row.lead ? <Badge tone="green">Lead</Badge> : null}
          {row.applied ? <Badge tone="violet">Applied</Badge> : null}
        </span>
      ) : null,
    meta: (row) => [
      <span key="c">
        {row.channel ? <ChannelTag channel={row.channel} /> : "Unattributed"}
        {row.utmCampaign ? <span className="adm-mono"> {row.utmCampaign}</span> : null}
      </span>,
      `${fmtInt(row.pageViews)} ${row.pageViews === 1 ? "page" : "pages"} · ${fmtDuration(row.activeMs)}`,
      [deviceLabel(row.deviceType), row.browser, row.os].filter(Boolean).join(" · "),
    ],
  };

  return (
    <>
      <FilterBar
        search={null}
        panelActive={activeCount}
        anyActive={anyActive}
        onClear={clearFilters}
        summary={data ? `${fmtInt(total)} ${total === 1 ? "visit" : "visits"}${anyActive ? " match" : ""}` : "Loading…"}
        actions={
          <a className="adm-btn adm-btn--sm" href={exportUrl} download>
            <Icon name="download" size={14} /> Export CSV
          </a>
        }
      >
        <SelectField label="Channel" value={filters.channel} onChange={(value) => setFilter("channel", value)} options={asOptions(CHANNELS)} allLabel="Any channel" />
        <SelectField label="Device" value={filters.device} onChange={(value) => setFilter("device", value)} options={asOptions(DEVICES)} allLabel="Any device" />
        <DateFilters filters={filters} setFilter={setFilter} label="Started" />
        <div className="adm-field" style={{ alignContent: "end" }}>
          <label className="adm-check">
            <input type="checkbox" checked={filters.converted === "1"} onChange={(event) => setFilter("converted", event.target.checked ? "1" : "")} />
            Only visits that converted
          </label>
        </div>
      </FilterBar>

      <ListView
        list={list}
        columns={columns}
        card={card}
        label="Visits"
        noun="visits"
        emptyIcon="visitors"
        emptyTitle="No visits recorded yet"
        emptyText="Visits appear here once people accept analytics on the public site. Nothing is recorded for visitors who decline."
        onOpen={(row) => openRow(row.id)}
      />

      {drawer.id ? (
        <SessionDrawer
          key={drawer.id}
          sessionId={drawer.id}
          row={openRowData}
          onClose={closeDrawer}
          onErased={() => {
            closeDrawer();
            reload();
          }}
          returnFocus={returnFocus}
        />
      ) : null}
    </>
  );
}

/** props as short "key: value" tags (they are free text from the browser; React renders them as text). */
function PropTags({ props }) {
  const entries = Object.entries(props ?? {});
  if (!entries.length) return <span className="adm-muted">{"–"}</span>;
  return (
    <span className="adm-timeline__props">
      {entries.map(([key, value]) => (
        <span key={key} className="adm-tag adm-mono">
          {key}: {String(value)}
        </span>
      ))}
    </span>
  );
}

function EventsTab() {
  const list = useListPage({ path: "/events", filterKeys: EVENT_FILTERS, exportKind: "events", keepOpenParam: true });
  const { filters, setFilter, clearFilters, activeCount, anyActive, exportUrl, total, data, drawer, closeDrawer, returnFocus, openRow } = list;
  const names = data?.names ?? [];

  const columns = [
    { key: "time", header: "Time", nowrap: true, cell: (row) => <Time value={row.occurredAt} /> },
    { key: "name", header: "Event", primary: true, minWidth: 140, cell: (row) => <span className="adm-mono">{row.name}</span> },
    { key: "path", header: "Page", cell: (row) => (row.path ? <span className="adm-mono adm-break">{row.path}</span> : <span className="adm-muted">{"–"}</span>) },
    { key: "props", header: "Details", minWidth: 200, cell: (row) => <PropTags props={row.props} /> },
    { key: "channel", header: "Channel", cell: (row) => <ChannelTag channel={row.channel} /> },
    { key: "device", header: "Device", cell: (row) => deviceLabel(row.deviceType) },
  ];

  const card = {
    title: (row) => (
      <>
        <span className="adm-mono">{row.name}</span>
        <span className="adm-cell2 adm-mono">{row.path || "–"}</span>
      </>
    ),
    badge: (row) => <Time value={row.occurredAt} className="adm-muted" />,
    meta: (row) => [<PropTags key="p" props={row.props} />, row.channel ? <ChannelTag key="c" channel={row.channel} /> : null, deviceLabel(row.deviceType)],
  };

  // Events have no id of their own: each row opens the visit it belongs to.
  const rowKey = (row) => `${row.sessionId}|${row.occurredAt}|${row.name}|${JSON.stringify(row.props)}`;

  return (
    <>
      <FilterBar
        search={null}
        panelActive={activeCount}
        anyActive={anyActive}
        onClear={clearFilters}
        summary={data ? `${fmtInt(total)} ${total === 1 ? "event" : "events"}${anyActive ? " match" : ""}` : "Loading…"}
        actions={
          <a className="adm-btn adm-btn--sm" href={exportUrl} download>
            <Icon name="download" size={14} /> Export CSV
          </a>
        }
      >
        <SelectField
          label="Event name"
          value={filters.name}
          onChange={(value) => setFilter("name", value)}
          options={names.map((item) => ({ value: item.name, label: `${item.name} (${fmtInt(item.n)})` }))}
          allLabel="All events"
        />
        <DateFilters filters={filters} setFilter={setFilter} label="Happened" />
      </FilterBar>

      <ListView
        list={list}
        columns={columns}
        card={card}
        rowKey={rowKey}
        label="Events"
        noun="events"
        emptyIcon="click"
        emptyTitle="No events recorded yet"
        emptyText="Named actions such as call-to-action clicks and form steps appear here as visitors use the site."
        onOpen={(row) => openRow(row.sessionId)}
      />

      {drawer.id ? <SessionDrawer key={drawer.id} sessionId={drawer.id} onClose={closeDrawer} onErased={() => closeDrawer()} returnFocus={returnFocus} /> : null}
    </>
  );
}

/** Website activity: every consented visit, and every named event, with a timeline for each visit. */
export default function VisitorsPage() {
  const [params, update] = useQueryParams();
  const tab = params.get("tab") === "events" ? "events" : "sessions";
  useDocumentTitle(tab === "events" ? "Events" : "Visitors");

  return (
    <div className="adm-page">
      <PageHeader eyebrow="Website" title="Visitors" lede="Consent-based, first-party visit data: where each visit came from, what was read, and whether it became a lead." />
      <Tabs
        tabs={TABS}
        selected={tab}
        onSelect={(id) => update({ tab: id === "sessions" ? null : id, open: null, page: null, size: null, channel: null, device: null, converted: null, name: null }, { keepPage: true })}
        label="Visitor data"
        idPrefix="visitors"
      />
      <div role="tabpanel" id="visitors-panel" aria-labelledby={`visitors-${tab}`} className="adm-page">
        {tab === "events" ? <EventsTab /> : <SessionsTab />}
      </div>
    </div>
  );
}
