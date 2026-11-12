/*
 * Thin client for /api/admin (same-origin, session in an HttpOnly cookie the browser manages).
 *  - every non-GET request carries X-Zenitheum-Admin: 1 (the server's CSRF guard)
 *  - errors become ApiError { status, code, message, errors } using the server's { ok:false, error, message, errors }
 *  - a 401 anywhere except sign-in / session probe tells the app the session ended
 */

const BASE = "/api/admin";

export class ApiError extends Error {
  constructor({ status = 0, code = "error", message = "Something went wrong.", errors = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    /** per-field messages on a 400 validation failure: { field: "message" } */
    this.errors = errors && typeof errors === "object" ? errors : null;
  }
}

let unauthorizedHandler = null;

/** The app registers one handler; it is called when a request comes back 401. Returns an unsubscribe function. */
export function onUnauthorized(handler) {
  unauthorizedHandler = handler;
  return () => {
    if (unauthorizedHandler === handler) unauthorizedHandler = null;
  };
}

/** { a: 1, b: "", c: undefined, d: true } -> "?a=1&d=1" (empty values are dropped). */
export function queryString(params) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value === undefined || value === null || value === "" || value === false) continue;
    search.set(key, value === true ? "1" : String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}

const fallbackMessage = (status) => {
  if (status === 401) return "Please sign in.";
  if (status === 403) return "That request was refused. Reload the page and try again.";
  if (status === 404) return "That item no longer exists.";
  if (status === 429) return "Too many requests. Wait a moment and try again.";
  if (status === 502 || status === 503 || status === 504) return "The server is not responding. Try again in a moment.";
  return "Something went wrong on the server. Try again.";
};

/**
 * @param {string} path  e.g. "/contacts"
 * @param {{method?: string, params?: object, body?: any, signal?: AbortSignal, silent401?: boolean}} [options]
 */
export async function request(path, { method = "GET", params, body, signal, silent401 = false } = {}) {
  const headers = { Accept: "application/json" };
  if (method !== "GET" && method !== "HEAD") headers["X-Zenitheum-Admin"] = "1";
  let payload;
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(`${BASE}${path}${queryString(params)}`, { method, headers, body: payload, signal, credentials: "same-origin", cache: "no-store" });
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    throw new ApiError({ status: 0, code: "network", message: "Can’t reach the server. Check your connection and try again." });
  }

  // Read as text first: a proxy error page is not JSON and must not surface as a SyntaxError.
  let data = null;
  try {
    const text = await response.text();
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = new ApiError({
      status: response.status,
      code: data?.error || `http_${response.status}`,
      message: data?.message || fallbackMessage(response.status),
      errors: data?.errors,
    });
    if (response.status === 401 && !silent401) unauthorizedHandler?.(error);
    throw error;
  }
  return data ?? {};
}

export const api = {
  me: (signal) => request("/me", { signal, silent401: true }),
  login: (email, password) => request("/login", { method: "POST", body: { email, password }, silent401: true }),
  logout: () => request("/logout", { method: "POST", silent401: true }),
  get: (path, params, signal) => request(path, { params, signal }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  remove: (path) => request(path, { method: "DELETE" }),
};

/** Same-origin download links (the cookie authenticates them). */
export const exportHref = (kind, params) => `${BASE}/export/${kind}${queryString(params)}`;
export const resumeHref = (applicationId) => `${BASE}/applications/${encodeURIComponent(applicationId)}/resume`;

/** Message to show for a failed action: the first per-field error when there is one, else the server message. */
export function errorText(error) {
  if (error?.errors) {
    const first = Object.values(error.errors).find((value) => typeof value === "string" && value);
    if (first) return first;
  }
  return error?.message || "Something went wrong. Try again.";
}
