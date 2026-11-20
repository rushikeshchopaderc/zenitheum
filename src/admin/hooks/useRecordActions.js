import { useCallback, useState } from "react";

import { api, errorText } from "../api";
import { useToast } from "../context/contexts";

/**
 * Save and delete actions for one record (a demo, order, question, application), with toasts and busy flags.
 * Each action resolves { ok, row?, error? } so a form can show a field error inline as well.
 *
 * @param {{collection: string, responseKey: string, noun: string, row: any, notesField?: string,
 *          onUpdated: (row:any)=>void, onRemoved: (row:any)=>void}} options
 *   notesField: the API's name for the staff-notes field ("notes", or "internalNotes" on orders)
 */
export default function useRecordActions({ collection, responseKey, noun, row, notesField = "notes", onUpdated, onRemoved }) {
  const toast = useToast();
  const [busy, setBusy] = useState(null); // "status" | "notes" | "delete" | null

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
  const saveNotes = useCallback((notes) => patch("notes", { [notesField]: notes }, "Notes saved"), [patch, notesField]);

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

  return { busy, saveStatus, saveNotes, remove };
}
