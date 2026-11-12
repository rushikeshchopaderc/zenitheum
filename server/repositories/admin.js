import { camel, camelAll } from "./shared.js";

export function createAdminRepository(db) {
  return {
    async count() {
      return (await db.query("SELECT count(*)::int AS n FROM admin_users")).rows[0].n;
    },

    async createUser({ email, name, passwordHash }) {
      const { rows } = await db.query(
        "INSERT INTO admin_users (email, name, password_hash) VALUES ($1, $2, $3) RETURNING id, email, name, created_at",
        [email, name || null, passwordHash]
      );
      return camel(rows[0]);
    },

    async setPassword(email, passwordHash) {
      const { rowCount } = await db.query(
        "UPDATE admin_users SET password_hash = $2, failed_logins = 0, locked_until = NULL WHERE email = $1",
        [email, passwordHash]
      );
      if (rowCount) await db.query("DELETE FROM admin_sessions WHERE admin_id = (SELECT id FROM admin_users WHERE email = $1)", [email]);
      return rowCount > 0;
    },

    async findByEmail(email) {
      return camel((await db.query("SELECT * FROM admin_users WHERE email = $1", [email])).rows[0]);
    },

    /** Count a failed login; lock the account for `lockMinutes` once `maxFailures` is reached. */
    async recordFailure(id, { maxFailures, lockMinutes }) {
      await db.query(
        `UPDATE admin_users SET
           failed_logins = failed_logins + 1,
           locked_until = CASE WHEN failed_logins + 1 >= $2 THEN now() + make_interval(mins => $3::int) ELSE locked_until END
         WHERE id = $1`,
        [id, maxFailures, lockMinutes]
      );
    },

    async recordSuccess(id) {
      await db.query("UPDATE admin_users SET failed_logins = 0, locked_until = NULL, last_login_at = now() WHERE id = $1", [id]);
    },

    async createSession({ tokenHash, adminId, hours, userAgent }) {
      await db.query(
        `INSERT INTO admin_sessions (token_hash, admin_id, expires_at, user_agent)
         VALUES ($1, $2, now() + make_interval(hours => $3::int), $4)`,
        [tokenHash, adminId, hours, userAgent ? String(userAgent).slice(0, 300) : null]
      );
      // Housekeeping: drop sessions that have already expired.
      await db.query("DELETE FROM admin_sessions WHERE expires_at < now()");
    },

    async findSession(tokenHash) {
      const { rows } = await db.query(
        `SELECT u.id, u.email, u.name, s.expires_at
           FROM admin_sessions s JOIN admin_users u ON u.id = s.admin_id
          WHERE s.token_hash = $1 AND s.expires_at > now()`,
        [tokenHash]
      );
      return camel(rows[0]);
    },

    async deleteSession(tokenHash) {
      await db.query("DELETE FROM admin_sessions WHERE token_hash = $1", [tokenHash]);
    },

    async audit(adminId, action, entity, entityId, detail = {}) {
      await db.query(
        "INSERT INTO audit_log (admin_id, action, entity, entity_id, detail) VALUES ($1, $2, $3, $4, $5::jsonb)",
        [adminId ?? null, action, entity ?? null, entityId ?? null, JSON.stringify(detail)]
      );
    },

    async listAudit(limit = 50) {
      const { rows } = await db.query(
        `SELECT a.action, a.entity, a.entity_id, a.detail, a.occurred_at, u.email AS admin_email
           FROM audit_log a LEFT JOIN admin_users u ON u.id = a.admin_id
          ORDER BY a.occurred_at DESC, a.id DESC LIMIT $1`,
        [Math.min(limit, 200)]
      );
      return camelAll(rows);
    },
  };
}
