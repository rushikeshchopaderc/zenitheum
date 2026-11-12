import { useCallback, useRef, useState } from "react";
import { track } from "../lib/analytics";

/**
 * Small form-state helper for the API-backed forms: controlled values, server
 * field errors, and a sending / sent / error status. When `formName` is given it
 * also reports the form funnel (started / submitted / failed) to the analytics.
 */
export function useApiForm(initial, { formName } = {}) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState("");
  const started = useRef(false);

  const markStarted = useCallback(() => {
    if (formName && !started.current) {
      started.current = true;
      track("form_start", { form: formName });
    }
  }, [formName]);

  const setValue = useCallback(
    (name, value) => {
      markStarted();
      setValues((current) => ({ ...current, [name]: value }));
      setErrors((current) => (current[name] ? { ...current, [name]: undefined } : current));
    },
    [markStarted]
  );

  const bind = (name) => ({
    value: values[name] ?? "",
    onChange: (event) => setValue(name, event.target.value),
    onFocus: markStarted,
  });

  const run = useCallback(
    async (task) => {
      setStatus("sending");
      setErrors({});
      setMessage("");
      try {
        const result = await task();
        setReference(result?.id || "");
        setStatus("sent");
        if (formName) track("form_submit", { form: formName });
        return result;
      } catch (error) {
        setStatus("error");
        setErrors(error.errors || {});
        setMessage(error.message || "Something went wrong. Please try again.");
        if (formName) track("form_error", { form: formName, code: String(error.code || "error").slice(0, 40) });
        return null;
      }
    },
    [formName]
  );

  const reset = useCallback(() => {
    setValues(initial);
    setErrors({});
    setStatus("idle");
    setMessage("");
    setReference("");
    started.current = false;
  }, [initial]);

  return { values, setValue, bind, errors, setErrors, status, message, reference, run, reset };
}

export default useApiForm;
