import { useCallback, useRef, useState } from "react";

/**
 * A light guard against losing typed notes: the first attempt to close a drawer that has unsaved text
 * moves focus to Save and says so; closing again discards. `setDirty` is wired to the notes editor.
 */
export default function useCloseGuard(onClose) {
  const dirty = useRef(false);
  const [warned, setWarned] = useState(false);

  const setDirty = useCallback((value) => {
    dirty.current = value;
    if (!value) setWarned(false);
  }, []);

  const requestClose = useCallback(() => {
    if (dirty.current && !warned) {
      setWarned(true);
      const save = document.querySelector("[data-notes-save]");
      save?.focus();
      save?.scrollIntoView({ block: "center" });
      return;
    }
    onClose();
  }, [warned, onClose]);

  return { requestClose, setDirty, warned };
}
