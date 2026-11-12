import { getTrackingIds } from "./analytics";

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
  const timer = setTimeout(() => controller.abort(), 20000);

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

/**
 * Public forms also send the visit ids so the server can tie a lead to how the visitor found us.
 * getTrackingIds() is empty unless the visitor accepted analytics.
 */
export const postJson = (path, data) =>
  request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, ...getTrackingIds() }),
  });

export const postForm = (path, formData) => {
  Object.entries(getTrackingIds()).forEach(([key, value]) => formData.set(key, value));
  return request(path, { method: "POST", body: formData });
};
