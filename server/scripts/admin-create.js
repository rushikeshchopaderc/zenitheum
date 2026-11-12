/**
 * Create an administrator for the staff console, or reset one's password.
 *
 *   npm run admin:create -- --email you@zenitheum.com [--name "Your Name"] [--reset]
 *
 * The password is asked for twice with no echo. For automation, set ADMIN_PASSWORD instead.
 * (Without DATABASE_URL this opens the embedded dev database, so stop `npm run dev` first; or simply set
 * ADMIN_EMAIL and ADMIN_PASSWORD in .env and the first start creates the account.)
 */
import { createAdminRepository } from "../repositories/admin.js";
import { hashPassword, passwordProblem } from "../services/auth.js";
import { askHidden, flag, openDatabase } from "./_boot.js";

const email = String(flag("email") === true ? "" : flag("email") || process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const name = flag("name") === true ? null : flag("name") || null;
const reset = flag("reset") === true;

if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
  console.error("Usage: npm run admin:create -- --email you@zenitheum.com [--name \"Your Name\"] [--reset]");
  process.exit(2);
}

const { db } = await openDatabase({ quiet: true });
try {
  const admin = createAdminRepository(db);
  const existing = await admin.findByEmail(email);
  if (existing && !reset) {
    console.error(`${email} already exists. Add --reset to set a new password for it.`);
    process.exitCode = 1;
  } else {
    let password = process.env.ADMIN_PASSWORD;
    if (!password) {
      password = await askHidden("Password (12+ characters): ");
      if ((await askHidden("Repeat password: ")) !== password) {
        console.error("The passwords do not match.");
        process.exit(1);
      }
    }
    const problem = passwordProblem(password);
    if (problem) {
      console.error(problem);
      process.exit(1);
    }
    const passwordHash = await hashPassword(password);
    if (existing) {
      await admin.setPassword(email, passwordHash);
      await admin.audit(existing.id, "password_reset", "admin", existing.id, { via: "cli" });
      console.log(`Password reset for ${email}. Any open sessions were signed out.`);
    } else {
      const created = await admin.createUser({ email, name, passwordHash });
      await admin.audit(created.id, "admin_created", "admin", created.id, { via: "cli" });
      console.log(`Created administrator ${email}. Sign in at /admin.`);
    }
  }
} finally {
  await db.close();
}
