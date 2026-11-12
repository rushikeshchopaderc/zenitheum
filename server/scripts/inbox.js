/**
 * Print what the website has captured, from the terminal.
 *
 *   npm run inbox                       latest contacts, applications and subscribers
 *   npm run inbox -- contacts --limit 50
 *   npm run inbox -- summary            counts only
 */
import { createLeadRepository } from "../repositories/leads.js";
import { flag, openDatabase } from "./_boot.js";

const kinds = ["contacts", "applications", "subscribers"];
const what = process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : "all";
const limit = Math.min(Number.parseInt(String(flag("limit") ?? ""), 10) || 10, 200);
const when = (d) => new Date(d).toISOString().slice(0, 16).replace("T", " ");

const { db } = await openDatabase({ quiet: true });
try {
  const leads = createLeadRepository(db);
  if (what === "summary") {
    for (const table of kinds) {
      const { rows } = await db.query(`SELECT status, count(*)::int AS n FROM ${table} GROUP BY status ORDER BY n DESC`);
      console.log(`${table.padEnd(13)} ${rows.map((r) => `${r.status}: ${r.n}`).join("  ") || "none yet"}`);
    }
  } else {
    if (what === "all" || what === "contacts") {
      const { rows, total } = await leads.listContacts({ limit });
      console.log(`\nCONTACTS (${rows.length} of ${total})`);
      for (const r of rows) console.log(`  ${when(r.createdAt)}  ${r.ref}  ${r.status.padEnd(9)} ${r.name} <${r.email}>${r.organisation ? ` · ${r.organisation}` : ""} · ${r.topic}${r.segment ? ` · ${r.segment}` : ""}${r.channel ? ` · via ${r.channel}` : ""}`);
    }
    if (what === "all" || what === "applications") {
      const { rows, total } = await leads.listApplications({ limit });
      console.log(`\nAPPLICATIONS (${rows.length} of ${total})`);
      for (const r of rows) console.log(`  ${when(r.createdAt)}  ${r.ref}  ${r.status.padEnd(9)} ${r.name} <${r.email}> · ${r.jobTitle}${r.track ? ` (${r.track})` : ""}${r.hasResume ? " · resume" : ""}`);
    }
    if (what === "all" || what === "subscribers") {
      const { rows, total } = await leads.listSubscribers({ limit });
      console.log(`\nSUBSCRIBERS (${rows.length} of ${total})`);
      for (const r of rows) console.log(`  ${when(r.createdAt)}  ${r.status.padEnd(12)} ${r.email}${r.source ? ` · ${r.source}` : ""}`);
    }
  }
} finally {
  await db.close();
}
