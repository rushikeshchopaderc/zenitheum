/** Counts for the console's home screen. */
export function createOverviewRepository(db) {
  const byStatus = async (table) =>
    Object.fromEntries((await db.query(`SELECT status, count(*)::int AS n FROM ${table} GROUP BY status`)).rows.map((r) => [r.status, r.n]));

  return {
    async counts() {
      const [contacts, demos, orders, applications, subscribers] = await Promise.all(["contacts", "demos", "orders", "applications", "subscribers"].map(byStatus));
      return { contacts, demos, orders, applications, subscribers };
    },
  };
}
