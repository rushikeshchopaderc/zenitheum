import { useCallback, useRef, useState } from "react";

import { api, errorText } from "../api";
import ConfirmDialog from "../components/ConfirmDialog";
import Delivery from "../components/Delivery";
import { SearchBox, SelectField } from "../components/Fields";
import FilterBar from "../components/FilterBar";
import Icon from "../components/icons";
import ListView from "../components/ListView";
import PageHeader from "../components/PageHeader";
import { Time } from "../components/Time";
import { useToast } from "../context/contexts";
import { fmtInt } from "../format";
import useListPage from "../hooks/useListPage";
import { useDocumentTitle } from "../hooks/useMisc";
import { CHIPS, SUBSCRIBER_STATUSES, asOptions } from "../labels";

const FILTER_KEYS = ["status", "chip"];

/** The chip news a person asked for, and for ZT-AFE1 how they want it delivered. */
const interest = (row) => (row.chip ? <Delivery chip={row.chip} analogFormat={row.analogFormat} /> : <span className="adm-muted">No preference</span>);

function StatusSwitch({ row, busy, onToggle }) {
  const active = row.status === "active";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-busy={busy}
      aria-label={`${row.email}: ${active ? "subscribed" : "unsubscribed"}. Select to ${active ? "unsubscribe" : "re-subscribe"}.`}
      className="adm-switch"
      onClick={() => !busy && onToggle(row)}
    >
      <span className="adm-switch__track" aria-hidden="true" />
      <span>{active ? "Active" : "Unsubscribed"}</span>
    </button>
  );
}

/** The early-access list: who is subscribed, how they arrived, switch them off, export for the newsletter tool. */
export default function SubscribersPage() {
  useDocumentTitle("Subscribers");
  const toast = useToast();
  const list = useListPage({ path: "/subscribers", filterKeys: FILTER_KEYS, exportKind: "subscribers" });
  const { filters, setFilter, clearFilters, activeCount, anyActive, exportUrl, total, updateRow, reload, data } = list;
  const [pending, setPending] = useState(null); // id of the row being switched
  const [removing, setRemoving] = useState(null); // row awaiting delete confirmation
  const [removeBusy, setRemoveBusy] = useState(false);
  const deleted = useRef(false);

  const toggle = useCallback(
    async (row) => {
      const next = row.status === "active" ? "unsubscribed" : "active";
      setPending(row.id);
      try {
        const response = await api.patch(`/subscribers/${encodeURIComponent(row.id)}`, { status: next });
        updateRow(response.subscriber);
        toast.success(next === "active" ? `${row.email} is subscribed again` : `${row.email} is unsubscribed`);
      } catch (error) {
        toast.error(errorText(error));
      } finally {
        setPending(null);
      }
    },
    [updateRow, toast],
  );

  const confirmRemove = async () => {
    setRemoveBusy(true);
    try {
      await api.remove(`/subscribers/${encodeURIComponent(removing.id)}`);
      deleted.current = true;
      toast.success("Subscriber deleted");
      setRemoving(null);
      reload();
    } catch (error) {
      toast.error(errorText(error));
    } finally {
      setRemoveBusy(false);
    }
  };

  const removeButton = (row) => (
    <button
      type="button"
      className="adm-iconbtn adm-iconbtn--sm"
      aria-label={`Delete ${row.email}`}
      title="Delete subscriber"
      onClick={() => {
        deleted.current = false;
        setRemoving(row);
      }}
    >
      <Icon name="trash" size={16} />
    </button>
  );

  const columns = [
    {
      key: "email",
      header: "Subscriber",
      minWidth: 250,
      cell: (row) => (
        <>
          <span className="adm-break" style={{ color: "var(--adm-text)", fontWeight: 600 }}>
            {row.email}
          </span>
          {row.name ? <span className="adm-cell2">{row.name}</span> : null}
        </>
      ),
    },
    { key: "interest", header: "Interested in", minWidth: 180, cell: interest },
    { key: "status", header: "Status", cell: (row) => <StatusSwitch row={row} busy={pending === row.id} onToggle={toggle} /> },
    { key: "source", header: "Signed up from", cell: (row) => (row.source ? <span className="adm-mono adm-break">{row.source}</span> : <span className="adm-muted">{"\u2013"}</span>) },
    {
      key: "created",
      header: "Subscribed",
      nowrap: true,
      cell: (row) => (
        <>
          <Time value={row.createdAt} />
          {row.unsubscribedAt ? (
            <span className="adm-cell2">
              Left <Time value={row.unsubscribedAt} />
            </span>
          ) : null}
        </>
      ),
    },
    { key: "actions", header: <span className="adm-sr">Actions</span>, align: "right", cell: removeButton },
  ];

  const card = {
    title: (row) => (
      <>
        <span className="adm-break">{row.email}</span>
        {row.name ? <span className="adm-cell2">{row.name}</span> : null}
      </>
    ),
    badge: removeButton,
    meta: (row) => [interest(row), row.source ? `From ${row.source}` : null, <Time key="t" value={row.createdAt} />],
    foot: (row) => <StatusSwitch row={row} busy={pending === row.id} onToggle={toggle} />,
  };

  return (
    <div className="adm-page">
      <PageHeader eyebrow="People" title="Subscribers" lede="People who asked for news about a chip. Switching someone off keeps their record; deleting removes it." />

      <FilterBar
        search={<SearchBox label="Search subscribers" value={filters.q} onCommit={(value) => setFilter("q", value)} placeholder="Search email, name or where they signed up" />}
        panelActive={activeCount}
        anyActive={anyActive}
        onClear={clearFilters}
        summary={data ? `${fmtInt(total)} ${total === 1 ? "subscriber" : "subscribers"}${anyActive ? " match" : ""}` : "Loading…"}
        actions={
          <a className="adm-btn adm-btn--sm" href={exportUrl} download>
            <Icon name="download" size={14} /> Export CSV
          </a>
        }
      >
        <SelectField label="Status" value={filters.status} onChange={(value) => setFilter("status", value)} options={asOptions(SUBSCRIBER_STATUSES)} allLabel="Any status" />
        <SelectField label="Chip" value={filters.chip} onChange={(value) => setFilter("chip", value)} options={asOptions(CHIPS)} allLabel="Any chip" />
      </FilterBar>

      <ListView
        list={list}
        columns={columns}
        card={card}
        label="Subscribers"
        noun="subscribers"
        emptyIcon="subscribers"
        emptyTitle="No subscribers yet"
        emptyText="People who sign up for chip news on the public site will appear here."
      />

      {removing ? (
        <ConfirmDialog
          title="Delete this subscriber?"
          confirmLabel="Delete subscriber"
          busy={removeBusy}
          onConfirm={confirmRemove}
          onCancel={() => setRemoving(null)}
          returnFocus={() => (deleted.current ? document.querySelector("[data-page-title]") : null)}
        >
          <p>
            <strong className="adm-break" style={{ color: "var(--adm-text)" }}>
              {removing.email}
            </strong>{" "}
            will be removed from the list permanently. If you only want to stop emailing them, switch them to unsubscribed instead.
          </p>
        </ConfirmDialog>
      ) : null}
    </div>
  );
}
