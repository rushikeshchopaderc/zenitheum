/**
 * Cloudflare Worker for the website.
 *
 *   /api/*  -> forwarded to the Node API (API_ORIGIN, e.g. https://zenitheum-api.onrender.com)
 *   anything else -> the built React app (static assets; unknown paths fall back to index.html)
 *
 * Because the browser only ever talks to the site's own address, the admin sign-in cookie (SameSite=Strict) keeps working
 * and the API needs no CORS settings.
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(request);

    if (!env.API_ORIGIN) {
      return Response.json({ ok: false, error: "not_configured", message: "API_ORIGIN is not set." }, { status: 503 });
    }

    const target = new URL(url.pathname + url.search, env.API_ORIGIN);
    const headers = new Headers(request.headers);
    headers.delete("host");
    // The API sits behind this Worker and the host's own proxy (TRUST_PROXY=2): tell it who the real visitor is.
    headers.set("x-forwarded-for", request.headers.get("cf-connecting-ip") || "");
    headers.set("x-forwarded-proto", "https");
    if (request.headers.get("cf-ipcountry")) headers.set("cf-ipcountry", request.headers.get("cf-ipcountry"));

    try {
      return await fetch(new Request(target, { method: request.method, headers, body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body, redirect: "manual", duplex: "half" }));
    } catch {
      return Response.json({ ok: false, error: "api_unreachable", message: "The server is starting up or unavailable. Please try again in a minute." }, { status: 502 });
    }
  },
};
