import crypto from "node:crypto";

import { hashPassword, passwordProblem } from "./auth.js";

export const DEV_ADMIN_EMAIL = "admin@zenitheum.local";

/**
 * First start with an empty database: make sure someone can sign in to the staff console.
 *
 *  1. ADMIN_EMAIL + ADMIN_PASSWORD are set -> create that account.
 *  2. Otherwise, on a developer's machine only (not production, embedded database), create a throw-away
 *     account with a random password and print it once, so `npm run dev` never dead-ends at a login screen.
 *  3. Otherwise log what to do.
 *
 * Never overwrites an existing account, and never logs a password that the operator chose.
 */
export async function bootstrapAdmin(adminRepo, config, log = console, { devAccount = false } = {}) {
  if ((await adminRepo.count()) > 0) return false;

  const { bootstrapEmail: email, bootstrapPassword: password } = config.admin;
  if (email && password) {
    const problem = passwordProblem(password);
    if (problem) {
      log.warn?.(`[admin] ADMIN_PASSWORD was not used: ${problem}`);
      return false;
    }
    await adminRepo.createUser({ email: email.trim().toLowerCase(), name: null, passwordHash: await hashPassword(password) });
    log.info?.(`[admin] created the first administrator (${email.trim().toLowerCase()})`);
    return true;
  }

  if (devAccount && config.env !== "production") {
    const generated = crypto.randomBytes(15).toString("base64url");
    await adminRepo.createUser({ email: DEV_ADMIN_EMAIL, name: "Development admin", passwordHash: await hashPassword(generated) });
    log.info?.(`[admin] development console login (shown once): ${DEV_ADMIN_EMAIL}  /  ${generated}`);
    log.info?.("[admin] set ADMIN_EMAIL and ADMIN_PASSWORD in .env, or run `npm run admin:create`, to use your own account.");
    return true;
  }

  log.warn?.("[admin] no administrator exists yet. Set ADMIN_EMAIL and ADMIN_PASSWORD, or run `npm run admin:create`.");
  return false;
}
