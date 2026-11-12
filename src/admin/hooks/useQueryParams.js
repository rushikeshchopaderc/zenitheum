import { useCallback, useMemo } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

const empty = (value) => value === undefined || value === null || value === "" || value === false;

/**
 * Filters, pages and ranges live in the query string so a view can be shared and the back button works.
 * `update(patch)` sets/clears keys (empty values are removed); any change resets `page` unless it is
 * part of the patch or `keepPage` is set.
 */
export function useQueryParams() {
  const [params, setParams] = useSearchParams();
  const update = useCallback(
    (patch, { replace = false, keepPage = false, state } = {}) => {
      setParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          for (const [key, value] of Object.entries(patch)) {
            if (empty(value)) next.delete(key);
            else next.set(key, value === true ? "1" : String(value));
          }
          if (!keepPage && !("page" in patch)) next.delete("page");
          return next;
        },
        { replace, state },
      );
    },
    [setParams],
  );
  return [params, update];
}

/**
 * Which row's drawer is open, kept in the URL (?open=<id>) so the browser's Back button (and the Android
 * back gesture) closes the drawer instead of leaving the page. Opening pushes a history entry; closing
 * pops it when this page pushed it, and otherwise (a pasted link) just removes the parameter.
 */
export function useDrawerParam(name = "open") {
  const [params, update] = useQueryParams();
  const location = useLocation();
  const navigate = useNavigate();
  const id = params.get(name) || null;
  const pushed = Boolean(location.state?.admDrawer);

  const open = useCallback((value) => update({ [name]: value }, { keepPage: true, state: { admDrawer: true } }), [update, name]);
  const close = useCallback(() => {
    if (pushed) navigate(-1);
    else update({ [name]: null }, { keepPage: true, replace: true });
  }, [pushed, navigate, update, name]);
  /** Drop the parameter without adding history (the row it pointed at is gone). */
  const clear = useCallback(() => update({ [name]: null }, { keepPage: true, replace: true }), [update, name]);

  return useMemo(() => ({ id, open, close, clear }), [id, open, close, clear]);
}

/** page (1-based) and page size from the query string, with sane bounds. */
export function usePaging(params, { defaultSize = 25 } = {}) {
  const page = Math.max(Number.parseInt(params.get("page") ?? "", 10) || 1, 1);
  const rawSize = Number.parseInt(params.get("size") ?? "", 10);
  const size = [25, 50, 100].includes(rawSize) ? rawSize : defaultSize;
  return { page, size, offset: (page - 1) * size };
}
