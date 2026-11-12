import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ToastContext } from "../context/contexts";
import Icon from "./icons";

const LIFETIME = { success: 4500, info: 5000, error: 9000 };

function Toast({ toast, onDismiss }) {
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return undefined;
    const timer = setTimeout(() => onDismiss(toast.id), LIFETIME[toast.kind] ?? 5000);
    return () => clearTimeout(timer);
  }, [paused, toast.id, toast.kind, onDismiss]);

  return (
    <div
      className={`adm-toast adm-toast--${toast.kind}`}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <Icon name={toast.kind === "error" ? "alert" : toast.kind === "info" ? "info" : "circleCheck"} size={18} />
      <p className="adm-toast__text">{toast.message}</p>
      <button type="button" className="adm-iconbtn adm-iconbtn--sm" onClick={() => onDismiss(toast.id)} aria-label="Dismiss message">
        <Icon name="x" size={16} />
      </button>
    </div>
  );
}

/** Messages for save / delete / copy results. Two always-mounted live regions: polite for results, assertive for errors. */
export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);

  const dismiss = useCallback((id) => setToasts((list) => list.filter((toast) => toast.id !== id)), []);
  const push = useCallback((kind, message) => {
    counter.current += 1;
    const id = counter.current;
    setToasts((list) => [...list.slice(-3), { id, kind, message: String(message) }]);
  }, []);

  const api = useMemo(
    () => ({
      success: (message) => push("success", message),
      info: (message) => push("info", message),
      error: (message) => push("error", message),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="adm-toasts">
        <div role="status" aria-live="polite" aria-atomic="false" className="adm-toasts__list">
          {toasts.filter((toast) => toast.kind !== "error").map((toast) => (
            <Toast key={toast.id} toast={toast} onDismiss={dismiss} />
          ))}
        </div>
        <div role="alert" aria-atomic="false" className="adm-toasts__list">
          {toasts.filter((toast) => toast.kind === "error").map((toast) => (
            <Toast key={toast.id} toast={toast} onDismiss={dismiss} />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}
