import { useCallback, useEffect, useState } from "react";
import { warmUp } from "../lib/api";

/**
 * Small form-state helper for the API-backed forms: controlled values, server field errors, and a
 * sending / sent / error status. Opening a form also wakes the API (free hosts sleep when idle).
 */
export function useApiForm(initial) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => warmUp(), []);

  const setValue = useCallback((name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => (current[name] ? { ...current, [name]: undefined } : current));
  }, []);

  const bind = (name) => ({
    value: values[name] ?? "",
    onChange: (event) => setValue(name, event.target.value),
  });

  const run = useCallback(async (task) => {
    setStatus("sending");
    setErrors({});
    setMessage("");
    try {
      const response = await task();
      setResult(response);
      setStatus("sent");
      return response;
    } catch (error) {
      setStatus("error");
      setErrors(error.errors || {});
      setMessage(error.message || "Something went wrong. Please try again.");
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setValues(initial);
    setErrors({});
    setStatus("idle");
    setMessage("");
    setResult(null);
  }, [initial]);

  return { values, setValue, bind, errors, setErrors, status, message, result, reference: result?.id || "", run, reset };
}

export default useApiForm;
