import DataTable from "./DataTable";
import { EmptyState, ErrorBanner, TableSkeleton } from "./Feedback";
import Pagination from "./Pagination";

/**
 * The body of a list screen: skeleton on first load, an error banner with Retry, an empty state (different
 * words for "nothing yet" and "nothing matches these filters"), the table / cards, and pagination.
 * While a refetch runs the previous rows stay on screen, dimmed, so nothing jumps.
 *
 * `list` is the object returned by useListPage().
 */
export default function ListView({ list, columns, card, label, noun, emptyIcon = "info", emptyTitle, emptyText, emptyAction, onOpen, rowKey }) {
  const { data, rows, total, error, loading, reload, anyActive, clearFilters, page, size, setPage, setSize, drawer } = list;
  return (
    <>
      {error ? <ErrorBanner error={error} onRetry={reload} title={`The ${noun} could not be loaded.`} /> : null}
      {!data && loading ? <TableSkeleton rows={8} /> : null}
      {data && rows.length === 0 ? (
        <div className="adm-card">
          {anyActive ? (
            <EmptyState
              icon="search"
              title={`No ${noun} match these filters`}
              action={
                <button type="button" className="adm-btn" onClick={clearFilters}>
                  Clear filters
                </button>
              }
            >
              Try a wider date range or remove a filter.
            </EmptyState>
          ) : (
            <EmptyState icon={emptyIcon} title={emptyTitle} action={emptyAction}>
              {emptyText}
            </EmptyState>
          )}
        </div>
      ) : null}
      {rows.length > 0 ? (
        <div className="adm-stack" aria-busy={loading}>
          <DataTable columns={columns} rows={rows} rowKey={rowKey} onOpen={onOpen} selectedId={drawer?.id} card={card} label={label} dim={loading} />
          <Pagination page={page} size={size} total={total} shown={rows.length} onPage={setPage} onSize={setSize} />
        </div>
      ) : null}
    </>
  );
}
