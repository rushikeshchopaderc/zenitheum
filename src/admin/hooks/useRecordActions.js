import { useCallback, useState } from "react";

import { api, errorText } from "../api";
import { useToast } from "../context/contexts";

/**
 * Save / delete / erase actions for one lead or application, with toasts and busy flags.
 * Each action resolves { ok, error? } so a form can show a field error inline as well.
 *
 * @param {{collection: "contacts"|"applications", responseKey: "contact"|"application", noun: string, row: any,
 *          onUpdated: (row:any)=>void, onRemoved: (row:any)=>void}} options
 */
export default function useRecordActions({ collection, responseKey, noun, row, onUpdated, onRemoved }) {
  const toast = useToast();
  const [busy, setBusy] = useState(null); // "status" | "notes" | "delete" | "erase" | null

  const patch = useCallback(
    async (kind, body, message) => {
      setBusy(kind);
      try {
        const response = await api.patch(`/${collection}/${encodeURIComponent(row.id)}`, body);
        onUpdated(response[responseKey]);
        if (message) toast.success(message);
        return { ok: true, row: response[responseKey] };
      } catch (error) {
        toast.error(errorText(error));
        return { ok: false, error };
      } finally {
        setBusy(null);
      }
    },
    [collection, responseKey, row.id, onUpdated, toast],
  );

  const saveStatus = useCallback((status) => patch("status", { status }, "Status saved"), [patch]);
  const saveNotes = useCallback((notes) => patch("notes", { notes }, "Notes saved"), [patch]);

  const remove = useCallback(async () => {
    setBusy("delete");
    try {
      await api.remove(`/${collection}/${encodeURIComponent(row.id)}`);
      toast.success(`${noun} deleted`);
      onRemoved(row);
      return { ok: true };
    } catch (error) {
      toast.error(errorText(error));
      return { ok: false, error };
    } finally {
      setBusy(null);
    }
  }, [collection, noun, row, onRemoved, toast]);

  /** Right to erasure: removes the visitor's browsing data. The record keeps what the person typed. */
  const erase = useCallback(async () => {
    if (!row.visitorId) return { ok: false };
    setBusy("erase");
    try {
      const response = await api.remove(`/visitors/${encodeURIComponent(row.visitorId)}`);
      toast.success(response.erased ? "Browsing data erased" : "Nothing more was stored for that visitor");
      onUpdated({ ...row, visitorId: null, sessionId: null });
      return { ok: true };
    } catch (error) {
      toast.error(errorText(error));
      return { ok: false, error };
    } finally {
      setBusy(null);
    }
  }, [row, onUpdated, toast]);

  return { busy, saveStatus, saveNotes, remove, erase };
}
