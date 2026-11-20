/**
 * Cloudflare Worker for the website.
 *
 *   /api/*  -> forwarded to the Node API (see proxy.js)
 *   anything else -> the built React app (static assets; unknown paths fall back to index.html)
 *
 * Because the browser only ever talks to the site's own address, the admin sign-in cookie (SameSite=Strict) keeps working
 * and the API needs no CORS settings.
 */
import { proxyToApi } from "./proxy.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(request);
    return proxyToApi(request, env);
  },
};
