import { useEffect, useState } from "react";
import { milestones as seed } from "@shared/milestones.js";

/**
 * The live milestone list from the API, which the admin console edits. It starts from the bundled seed so
 * the chart renders instantly (and offline), then swaps in the database copy as soon as it arrives.
 */
export default function useMilestones() {
  const [state, setState] = useState({ milestones: seed, live: false, loading: true });

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/milestones", { signal: controller.signal, headers: { Accept: "application/json" } })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error(String(response.status)))))
      .then((data) => {
        if (Array.isArray(data?.milestones) && data.milestones.length) setState({ milestones: data.milestones, live: true, loading: false });
        else setState((s) => ({ ...s, loading: false }));
      })
      .catch((error) => {
        if (error?.name !== "AbortError") setState((s) => ({ ...s, loading: false }));
      });
    return () => controller.abort();
  }, []);

  return state;
}
