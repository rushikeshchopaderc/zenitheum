import { useCallback, useEffect, useMemo, useRef } from "react";

import { api, exportHref } from "../api";
import { rowOpenButton } from "../dom";
import useLoad from "./useLoad";
import { useDrawerParam, usePaging, useQueryParams } from "./useQueryParams";

/**
 * Everything a paged, filterable list with a detail drawer needs, with its state in the URL:
 * ?status=new&q=acme&page=2&size=50&open=<id>. `filterKeys` must be a module-level constant array.
 *
 * Rows changed from the drawer are patched into the list in place (no refetch while the drawer is open);
 * closing the drawer after a change refetches once so counts and filters tell the truth again.
 * `keepOpenParam`: the drawer loads its own data by id, so an ?open= that is not in this page is still valid.
 */
export default function useListPage({ path, filterKeys, exportKind, keepOpenParam = false }) {
  const [params, update] = useQueryParams();
  const { page, size, offset } = usePaging(params);
  const drawer = useDrawerParam("open");

  const filters = useMemo(() => Object.fromEntries([...filterKeys, "q"].map((key) => [key, params.get(key) ?? ""])), [params, filterKeys]);
  const query = useMemo(() => ({ ...filters, limit: size, offset }), [filters, size, offset]);
  const { data, error, loading, reload, mutate } = useLoad((signal) => api.get(path, query, signal), `${path}?${JSON.stringify(query)}`);

  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;
  const selected = drawer.id ? rows.find((row) => row.id === drawer.id) ?? null : null;
  const changed = useRef(false);

  // Past the last page after deletions or a narrower filter: step back to the last page that exists.
  useEffect(() => {
    if (data && !loading && data.rows.length === 0 && data.total > 0 && page > 1) update({ page: Math.ceil(data.total / size) }, { replace: true });
  }, [data, loading, page, size, update]);

  // ?open= points at a row that is not in this view (a stale link): drop it quietly.
  useEffect(() => {
    if (!keepOpenParam && data && !loading && drawer.id && !selected) drawer.clear();
  }, [keepOpenParam, data, loading, drawer, selected]);

  const setFilter = useCallback((key, value) => update({ [key]: value }), [update]);
  const clearFilters = useCallback(() => update(Object.fromEntries([...filterKeys, "q"].map((key) => [key, null]))), [update, filterKeys]);
  const setPage = useCallback((next) => update({ page: next > 1 ? next : null }, { keepPage: true }), [update]);
  const setSize = useCallback((next) => update({ size: next === 25 ? null : next, page: null }), [update]);

  const activeCount = filterKeys.filter((key) => filters[key]).length;
  const anyActive = activeCount > 0 || Boolean(filters.q);
  const exportUrl = exportKind ? exportHref(exportKind, Object.fromEntries(Object.entries(filters).filter(([, value]) => value))) : null;

  const updateRow = useCallback(
    (row) => {
      changed.current = true;
      mutate((previous) => previous && { ...previous, rows: previous.rows.map((item) => (item.id === row.id ? { ...item, ...row } : item)) });
    },
    [mutate],
  );

  const closeDrawer = useCallback(() => {
    drawer.close();
    if (changed.current) {
      changed.current = false;
      reload();
    }
  }, [drawer, reload]);

  const removeRow = useCallback(
    (row) => {
      changed.current = true;
      mutate((previous) => previous && { ...previous, rows: previous.rows.filter((item) => item.id !== row.id), total: Math.max(previous.total - 1, 0) });
      closeDrawer();
    },
    [mutate, closeDrawer],
  );

  /** Where focus goes when the drawer closes: the row's button, else the page heading. */
  const returnFocus = useCallback(() => (drawer.id ? rowOpenButton(drawer.id) : null) || document.querySelector("[data-page-title]"), [drawer.id]);

  return {
    filters, setFilter, clearFilters, activeCount, anyActive, exportUrl,
    page, size, setPage, setSize,
    data, rows, total, error, loading, reload,
    drawer, selected, openRow: drawer.open, closeDrawer, updateRow, removeRow, returnFocus,
  };
}
