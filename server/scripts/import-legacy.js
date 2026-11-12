/**
 * One-time import of the old flat-file store (server/data/*.jsonl and server/data/uploads/) into the database.
 *
 *   npm run db:import-legacy                 import from server/data
 *   npm run db:import-legacy -- --dir path   import from another folder
 *
 * Safe to run twice: a record keeps the reference it was given before (ZT-XXXXXXXX), and references that
 * already exist are skipped.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { flag, openDatabase } from "./_boot.js";

const { config, db } = await openDatabase({ quiet: true });
const dir = path.resolve(String(flag("dir") === true ? "" : flag("dir") || path.join(config.root, "server", "data")));

const read = (name) => {
  const file = path.join(dir, `${name}.jsonl`);
  if (!fs.existsSync(file)) return [];
  return fs
    .readFileSync(file, "utf8")
    .split("\n")
    .filter((line) => line.trim())
    .flatMap((line) => {
      try {
        return [JSON.parse(line)];
      } catch {
        console.warn(`  skipped an unreadable line in ${name}.jsonl`);
        return [];
      }
    });
};
const refOf = (record) => `ZT-${String(record.id).slice(0, 8).toUpperCase()}`;
const when = (record) => (record.createdAt && !Number.isNaN(Date.parse(record.createdAt)) ? record.createdAt : new Date().toISOString());
const MIME = { ".pdf": "application/pdf", ".doc": "application/msword", ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document" };

let counts = { contacts: 0, applications: 0, resumes: 0, subscribers: 0, skipped: 0 };
try {
  for (const r of read("contacts")) {
    const res = await db.query(
      `INSERT INTO contacts (ref, name, email, organisation, topic, message, created_at, updated_at)
       VALUES ($1, $2, lower($3), $4, $5, $6, $7::timestamptz, $7::timestamptz) ON CONFLICT (ref) DO NOTHING`,
      [refOf(r), r.name, r.email, r.organisation || null, r.topic || "other", r.message || "", when(r)]
    );
    res.rowCount ? (counts.contacts += 1) : (counts.skipped += 1);
  }

  for (const r of read("applications")) {
    const inserted = await db.query(
      `INSERT INTO applications (ref, job_slug, job_title, track, name, email, phone, organisation, profile_url, note, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, lower($6), $7, $8, $9, $10, $11::timestamptz, $11::timestamptz) ON CONFLICT (ref) DO NOTHING RETURNING id`,
      [refOf(r), r.job, r.jobTitle || r.job, r.track || null, r.name, r.email, r.phone || "", r.organisation || null, r.profile || null, r.note || null, when(r)]
    );
    if (!inserted.rowCount) {
      counts.skipped += 1;
      continue;
    }
    counts.applications += 1;
    const stored = r.resumeFile && path.join(dir, "uploads", path.basename(String(r.resumeFile)));
    if (stored && fs.existsSync(stored)) {
      const content = fs.readFileSync(stored);
      const ext = path.extname(String(r.resumeName || r.resumeFile)).toLowerCase();
      await db.query(
        "INSERT INTO application_files (application_id, filename, mime_type, size_bytes, sha256, content) VALUES ($1, $2, $3, $4, $5, $6)",
        [inserted.rows[0].id, String(r.resumeName || r.resumeFile).slice(0, 120), MIME[ext] || "application/octet-stream", content.length, crypto.createHash("sha256").update(content).digest("hex"), content]
      );
      counts.resumes += 1;
    }
  }

  for (const r of read("subscribers")) {
    const res = await db.query(
      "INSERT INTO subscribers (email, source, created_at) VALUES (lower($1), $2, $3::timestamptz) ON CONFLICT (email) DO NOTHING",
      [r.email, r.source || null, when(r)]
    );
    res.rowCount ? (counts.subscribers += 1) : (counts.skipped += 1);
  }

  console.log(`Imported from ${dir}: ${counts.contacts} contacts, ${counts.applications} applications (${counts.resumes} resumes), ${counts.subscribers} subscribers; ${counts.skipped} already present.`);
  console.log("The original files are untouched. Once you have checked the data you can archive or delete them.");
} finally {
  await db.close();
}
