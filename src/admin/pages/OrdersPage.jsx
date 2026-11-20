import { StatusBadge } from "../components/Badge";
import Delivery from "../components/Delivery";
import { SearchBox, SelectField } from "../components/Fields";
import FilterBar from "../components/FilterBar";
import Icon from "../components/icons";
import ListView from "../components/ListView";
import PageHeader from "../components/PageHeader";
import { DateOnly, Time } from "../components/Time";
import { fmtInt, fmtRelativeDay } from "../format";
import useListPage from "../hooks/useListPage";
import { useDocumentTitle } from "../hooks/useMisc";
import { ORDER_CHIPS, ORDER_STATUSES, asOptions } from "../labels";
import OrderDrawer from "./OrderDrawer";

const FILTER_KEYS = ["status", "chip"];

/** Orders for the chips: who ordered what, how many, and where and when it must arrive. */
export default function OrdersPage() {
  useDocumentTitle("Orders");
  const list = useListPage({ path: "/orders", filterKeys: FILTER_KEYS, exportKind: "orders" });
  const { filters, setFilter, clearFilters, activeCount, anyActive, exportUrl, total, data, selected, openRow, closeDrawer, updateRow, removeRow, returnFocus } = list;

  const columns = [
    {
      key: "company",
      header: "Company",
      primary: true,
      minWidth: 190,
      cell: (row) => (
        <>
          <span>{row.organisation}</span>
          <span className="adm-cell2">
            Received <Time value={row.createdAt} />
          </span>
        </>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      minWidth: 150,
      cell: (row) => (
        <span className="adm-cellstack" style={{ gap: 0 }}>
          <span>{row.contactName}</span>
          <span className="adm-cell2">{row.jobTitle || row.email}</span>
        </span>
      ),
    },
    { key: "chip", header: "Chip and delivery", minWidth: 170, cell: (row) => <Delivery chip={row.chip} analogFormat={row.analogFormat} /> },
    { key: "quantity", header: "Quantity", align: "right", cell: (row) => <span className="adm-num">{fmtInt(row.quantity)}</span> },
    {
      key: "delivery",
      header: "Delivery date",
      nowrap: true,
      cell: (row) => (
        <>
          <DateOnly value={row.deliveryDate} />
          <span className="adm-cell2">{fmtRelativeDay(row.deliveryDate)}</span>
        </>
      ),
    },
    { key: "location", header: "Location", minWidth: 150, cell: (row) => <span className="adm-break">{row.deliveryLocation}</span> },
    { key: "status", header: "Status", cell: (row) => <StatusBadge kind="order" value={row.status} /> },
  ];

  const card = {
    title: (row) => (
      <>
        <span>{row.organisation}</span>
        <span className="adm-cell2">{row.contactName}</span>
      </>
    ),
    badge: (row) => <StatusBadge kind="order" value={row.status} />,
    meta: (row) => [
      <Delivery key="d" chip={row.chip} analogFormat={row.analogFormat} />,
      `${fmtInt(row.quantity)} ${row.quantity === 1 ? "unit" : "units"}`,
      <span key="when">
        Delivery <DateOnly value={row.deliveryDate} />
      </span>,
      row.deliveryLocation,
      <span key="rec">
        Received <Time value={row.createdAt} />
      </span>,
    ],
  };

  return (
    <div className="adm-page">
      <PageHeader eyebrow="Customers" title="Orders" lede="Orders placed on the public site, with the quantity, delivery date and place the customer asked for." />

      <FilterBar
        search={<SearchBox label="Search orders" value={filters.q} onCommit={(value) => setFilter("q", value)} placeholder="Search company, contact, email, location or reference" />}
        panelActive={activeCount}
        anyActive={anyActive}
        onClear={clearFilters}
        summary={data ? `${fmtInt(total)} ${total === 1 ? "order" : "orders"}${anyActive ? " match" : ""}` : "Loading…"}
        actions={
          <a className="adm-btn adm-btn--sm" href={exportUrl} download>
            <Icon name="download" size={14} /> Export CSV
          </a>
        }
      >
        <SelectField label="Status" value={filters.status} onChange={(value) => setFilter("status", value)} options={asOptions(ORDER_STATUSES)} allLabel="Any status" />
        <SelectField label="Chip" value={filters.chip} onChange={(value) => setFilter("chip", value)} options={asOptions(ORDER_CHIPS)} allLabel="Any chip" />
      </FilterBar>

      <ListView
        list={list}
        columns={columns}
        card={card}
        label="Orders"
        noun="orders"
        emptyIcon="orders"
        emptyTitle="No orders yet"
        emptyText="Orders placed on the public site will appear here."
        onOpen={(row) => openRow(row.id)}
      />

      {selected ? <OrderDrawer key={selected.id} row={selected} onClose={closeDrawer} onUpdated={updateRow} onRemoved={removeRow} returnFocus={returnFocus} /> : null}
    </div>
  );
}
