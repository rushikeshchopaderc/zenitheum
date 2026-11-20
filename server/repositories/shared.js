import crypto from "node:crypto";

/** snake_case row -> camelCase object (Dates stay Dates; JSON serialises them as ISO strings). */
export const camel = (row) =>
  row && Object.fromEntries(Object.entries(row).map(([key, value]) => [key.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase()), value]));

export const camelAll = (rows) => rows.map(camel);

/** Reference shown to the visitor after a submission: ZT-1A2B3C4D. */
export const newRef = () => `ZT-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

export const isUniqueViolation = (error) => error?.code === "23505";

/** Run `attempt(ref)` with a fresh reference, retrying on the (very unlikely) reference collision only. */
export async function withUniqueRef(attempt) {
  for (let i = 0; ; i += 1) {
    try {
      return await attempt(newRef());
    } catch (error) {
      const refCollision = isUniqueViolation(error) && /ref/i.test(error.constraint ?? error.detail ?? error.message ?? "");
      if (!refCollision || i >= 3) throw error;
    }
  }
}

/** Escape a user search term for ILIKE ... (backslash is Postgres' default LIKE escape). */
export const likePattern = (term) => `%${String(term).replace(/[\\%_]/g, "\\$&")}%`;

/**
 * Tiny WHERE builder. `add("status = ?", value)` appends a parameterised clause; a `?` may appear
 * several times in one clause and always refers to the same value.
 */
export function whereBuilder() {
  const clauses = [];
  const params = [];
  return {
    params,
    add(sql, value) {
      params.push(value);
      clauses.push(sql.replaceAll("?", `$${params.length}`));
    },
    /** A fixed clause with no value, e.g. addRaw("slot_start >= now()"). */
    addRaw(sql) {
      clauses.push(sql);
    },
    get sql() {
      return clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    },
  };
}

/** `maxLimit` is only ever set by trusted server code (CSV export); request input is capped at 500. */
export const page = ({ limit = 25, offset = 0, maxLimit = 500 } = {}) => ({
  limit: Math.min(Math.max(Number(limit) || 25, 1), maxLimit),
  offset: Math.max(Number(offset) || 0, 0),
});
