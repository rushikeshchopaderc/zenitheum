import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Load data with stale-response protection.
 *
 *  - `load(signal)` returns a promise. It runs again whenever `key` changes or `reload()` is called.
 *  - A superseded request is aborted and its result ignored, so a slow answer can never overwrite a newer one.
 *  - Previous data stays in place while the next request runs (`loading` is true, `data` is kept), so a
 *    refetch never collapses the layout. `data === undefined && loading` means "first load".
 *  - `mutate(next | fn)` edits the local copy (after a successful save or delete) without refetching.
 *
 * @template T
 * @param {(signal: AbortSignal) => Promise<T>} load
 * @param {string} key  anything that identifies the request; a new value starts a new request
 * @param {{enabled?: boolean}} [options]
 */
export default function useLoad(load, key, { enabled = true } = {}) {
  const [state, setState] = useState({ data: undefined, error: null, loading: enabled });
  const [tick, setTick] = useState(0);
  const loadRef = useRef(load);
  const latest = useRef(0);

  // Declared first so the ref is current by the time the loading effect below runs.
  useEffect(() => {
    loadRef.current = load;
  });

  useEffect(() => {
    if (!enabled) return undefined;
    latest.current += 1;
    const id = latest.current;
    const controller = new AbortController();
    setState((previous) => ({ ...previous, loading: true, error: null }));
    Promise.resolve()
      .then(() => loadRef.current(controller.signal))
      .then(
        (data) => {
          if (id === latest.current) setState({ data, error: null, loading: false });
        },
        (error) => {
          if (id !== latest.current || error?.name === "AbortError") return;
          setState((previous) => ({ ...previous, error, loading: false }));
        },
      );
    return () => controller.abort();
  }, [key, tick, enabled]);

  const reload = useCallback(() => setTick((value) => value + 1), []);
  const mutate = useCallback(
    (next) => setState((previous) => ({ ...previous, data: typeof next === "function" ? next(previous.data) : next })),
    [],
  );

  return { data: state.data, error: state.error, loading: state.loading, reload, mutate };
}
