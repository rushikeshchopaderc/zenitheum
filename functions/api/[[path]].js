/**
 * Cloudflare Pages Function: when the site is deployed as a Cloudflare *Pages* project (an address ending in .pages.dev),
 * Pages ignores worker/index.js, so this file forwards every /api/* request to the Node API instead.
 * It does nothing under a Workers deployment (that one uses worker/index.js).
 */
import { proxyToApi } from "../../worker/proxy.js";

export const onRequest = ({ request, env }) => proxyToApi(request, env);
