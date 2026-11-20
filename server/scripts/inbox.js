/**
 * Print what the website has captured, from the terminal.
 *
 *   npm run inbox                     latest of everything
 *   npm run inbox -- demos --limit 20
 *   npm run inbox -- summary          counts only
 */
import { createDemoRepository } from "../repositories/demos.js";
import { createLeadRepository } from "../repositories/leads.js";
import { createOrderRepository } from "../repositories/orders.js";
import { flag, openDatabase } from "./_boot.js";

const kinds = ["demos", "orders", "contacts", "applications", "subscribers"];
const what = process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : "all";
const limit = Math.min(Number.parseInt(String(flag("limit") ?? ""), 10) || 10, 200);
const when = (d) => new Date(d).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });

const { db } = await openDatabase({ quiet: true });
try {
  const leads = createLeadRepository(db);
  const demos = createDemoRepository(db);
  const orders = createOrderRepository(db);
  if (what === "summary") {
    for (const table of kinds) {
      const { rows } = await db.query(`SELECT status, count(*)::int AS n FROM ${table} GROUP BY status ORDER BY n DESC`);
      console.log(`${table.padEnd(13)} ${rows.map((r) => `${r.status}: ${r.n}`).join("  ") || "none yet"}`);
    }
  } else {
    const show = (kind) => what === "all" || what === kind;
    if (show("demos")) {
      const { rows, total } = await demos.list({ limit });
      console.log(`\nDEMO REQUESTS (${rows.length} of ${total})`);
      for (const r of rows) console.log(`  ${when(r.createdAt)}  ${r.ref}  ${r.status.padEnd(9)} ${r.name} · ${r.organisation} · ${r.chip}${r.analogFormat ? `/${r.analogFormat}` : ""}${r.preferredDate ? ` · wants ${r.preferredDate}${r.preferredTime ? ` ${r.preferredTime}` : ""}` : ""}`);
    }
    if (show("orders")) {
      const { rows, total } = await orders.list({ limit });
      console.log(`\nORDERS (${rows.length} of ${total})`);
      for (const r of rows) console.log(`  ${when(r.createdAt)}  ${r.ref}  ${r.status.padEnd(10)} ${r.organisation} · ${r.quantity} × ${r.chip}${r.analogFormat ? `/${r.analogFormat}` : ""} · by ${r.deliveryDate} · ${r.deliveryLocation.split("\n")[0]}`);
    }
    if (show("contacts")) {
      const { rows, total } = await leads.listContacts({ limit });
      console.log(`\nQUESTIONS (${rows.length} of ${total})`);
      for (const r of rows) console.log(`  ${when(r.createdAt)}  ${r.ref}  ${r.status.padEnd(9)} ${r.name} <${r.email}>${r.organisation ? ` · ${r.organisation}` : ""}`);
    }
    if (show("applications")) {
      const { rows, total } = await leads.listApplications({ limit });
      console.log(`\nAPPLICATIONS (${rows.length} of ${total})`);
      for (const r of rows) console.log(`  ${when(r.createdAt)}  ${r.ref}  ${r.status.padEnd(9)} ${r.name} <${r.email}> · ${r.jobTitle}${r.track ? ` (${r.track})` : ""}${r.resumeUrl ? ` · ${r.resumeUrl}` : ""}`);
    }
    if (show("subscribers")) {
      const { rows, total } = await leads.listSubscribers({ limit });
      console.log(`\nCHIP NEWS SUBSCRIBERS (${rows.length} of ${total})`);
      for (const r of rows) console.log(`  ${when(r.createdAt)}  ${r.status.padEnd(12)} ${r.email}${r.chip ? ` · ${r.chip}` : ""}${r.analogFormat ? ` · AFE1 ${r.analogFormat}` : ""}`);
    }
  }
} finally {
  await db.close();
}
