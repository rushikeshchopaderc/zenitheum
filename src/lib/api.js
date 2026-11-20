/**
 * Thin fetch wrapper for the Node API. Every failure surfaces as an ApiError
 * carrying the HTTP status, a stable code and (for 400s) per-field messages,
 * so forms can show exactly what to fix.
 */
export class ApiError extends Error {
  constructor(status, body) {
    super(body?.message || "Something went wrong. Please try again.");
    this.name = "ApiError";
    this.status = status;
    this.code = body?.error || "error";
    this.errors = body?.errors || {};
  }
}

async function request(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 90000); // the free API host can take a minute to wake

  let response;
  try {
    response = await fetch(`/api${path}`, { ...options, signal: controller.signal });
  } catch (cause) {
    throw new ApiError(0, {
      error: "network",
      message:
        cause?.name === "AbortError"
          ? "The request timed out. Please try again."
          : "We could not reach the server. Check your connection, or email us directly.",
    });
  } finally {
    clearTimeout(timer);
  }

  let body = null;
  try {
    body = await response.json();
  } catch {
    /* non-JSON response */
  }
  if (!response.ok) throw new ApiError(response.status, body);
  return body;
}

export const getJson = (path) => request(path, { headers: { Accept: "application/json" } });

export const postJson = (path, data) =>
  request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const postForm = (path, formData) => request(path, { method: "POST", body: formData });

/** Wake the API (free hosts sleep when idle) while the visitor is still filling in a form. Fire-and-forget. */
let warmed = false;
export function warmUp() {
  if (warmed || typeof fetch === "undefined") return;
  warmed = true;
  fetch("/api/health", { cache: "no-store" }).then((response) => response.text()).catch(() => {});
}
