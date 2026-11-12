import { camel, camelAll } from "./shared.js";

/**
 * Read-only aggregates behind the admin dashboard. Every window is [from, to) in exact instants,
 * derived from calendar dates in the business time zone so "today" means today in India.
 */
export function createReportRepository(db, { timezone, productPaths }) {
  const between = (column) => `${column} >= $1::timestamptz AND ${column} < $2::timestamptz`;

  async function bounds({ fromDate, toDate }) {
    const { rows } = await db.query(
      "SELECT (($1::date)::timestamp AT TIME ZONE $3::text) AS f, ((($2::date) + 1)::timestamp AT TIME ZONE $3::text) AS t",
      [fromDate, toDate, timezone]
    );
    return { from: new Date(rows[0].f).toISOString(), to: new Date(rows[0].t).toISOString() };
  }

  const totalsSql = `
    SELECT
      (SELECT count(DISTINCT visitor_id) FROM sessions WHERE ${between("started_at")})::int AS visitors,
      (SELECT count(*) FROM sessions WHERE ${between("started_at")})::int AS sessions,
      (SELECT count(*) FROM page_views WHERE ${between("occurred_at")})::int AS page_views,
      (SELECT count(*) FROM sessions WHERE ${between("started_at")} AND page_views <= 1 AND events_count = 0)::int AS bounces,
      (SELECT COALESCE(avg(active_ms) FILTER (WHERE active_ms > 0), 0) FROM sessions WHERE ${between("started_at")})::int AS avg_active_ms,
      (SELECT count(*) FROM contacts WHERE ${between("created_at")} AND status <> 'spam')::int AS leads,
      (SELECT count(*) FROM applications WHERE ${between("created_at")})::int AS applications,
      (SELECT count(*) FROM subscribers WHERE ${between("created_at")})::int AS subscribers`;

  const group = async (sql, params) => (await db.query(sql, params)).rows;

  return {
    /** [from, to) instants for an inclusive pair of calendar dates in the business time zone. */
    bounds,

    /** Where every lead currently sits in the pipeline (all time, not the selected range). */
    async pipeline() {
      const count = async (table) =>
        Object.fromEntries((await db.query(`SELECT status, count(*)::int AS n FROM ${table} GROUP BY status`)).rows.map((r) => [r.status, r.n]));
      const [contacts, applications, subscribers] = await Promise.all([count("contacts"), count("applications"), count("subscribers")]);
      return { contacts, applications, subscribers };
    },

    async overview(range, previous) {
      const { from, to } = await bounds(range);
      const prev = await bounds(previous);
      const p = [from, to];

      const [totals, prevTotals, series, topPages, channels, referrers, devices, funnel, live, leadMix] = await Promise.all([
        db.query(totalsSql, p).then((r) => r.rows[0]),
        db.query(totalsSql, [prev.from, prev.to]).then((r) => r.rows[0]),
        group(
          `SELECT g.day::date::text AS day,
             (SELECT count(*) FROM sessions s WHERE ${between("s.started_at")} AND (s.started_at AT TIME ZONE $4::text)::date = g.day::date)::int AS sessions,
             (SELECT count(*) FROM page_views v WHERE ${between("v.occurred_at")} AND (v.occurred_at AT TIME ZONE $4::text)::date = g.day::date)::int AS page_views,
             (SELECT count(*) FROM contacts c WHERE ${between("c.created_at")} AND c.status <> 'spam' AND (c.created_at AT TIME ZONE $4::text)::date = g.day::date)::int AS leads,
             (SELECT count(*) FROM applications a WHERE ${between("a.created_at")} AND (a.created_at AT TIME ZONE $4::text)::date = g.day::date)::int AS applications
           FROM generate_series($3::timestamp, $5::timestamp, interval '1 day') AS g(day) ORDER BY 1`,
          [from, to, range.fromDate, timezone, range.toDate]
        ),
        group(
          `SELECT path, count(*)::int AS views, count(DISTINCT visitor_id)::int AS visitors,
                  COALESCE(avg(duration_ms) FILTER (WHERE duration_ms IS NOT NULL), 0)::int AS avg_ms,
                  COALESCE(avg(max_scroll_pct) FILTER (WHERE max_scroll_pct IS NOT NULL), 0)::int AS avg_scroll
             FROM page_views WHERE ${between("occurred_at")} GROUP BY path ORDER BY views DESC LIMIT 12`,
          p
        ),
        group(
          `SELECT s.channel, count(*)::int AS sessions, count(DISTINCT s.visitor_id)::int AS visitors,
             (SELECT count(*) FROM contacts c WHERE ${between("c.created_at")} AND c.status <> 'spam' AND c.channel = s.channel)::int AS leads,
             (SELECT count(*) FROM applications a WHERE ${between("a.created_at")} AND a.channel = s.channel)::int AS applications
             FROM sessions s WHERE ${between("s.started_at")} GROUP BY s.channel ORDER BY sessions DESC`,
          p
        ),
        group(
          `SELECT referrer_host AS host, count(*)::int AS sessions FROM sessions
            WHERE ${between("started_at")} AND referrer_host IS NOT NULL GROUP BY referrer_host ORDER BY sessions DESC LIMIT 8`,
          p
        ),
        group(`SELECT device_type, count(*)::int AS sessions FROM sessions WHERE ${between("started_at")} GROUP BY device_type ORDER BY sessions DESC`, p),
        db
          .query(
            `SELECT
               (SELECT count(*) FROM sessions WHERE ${between("started_at")})::int AS visits,
               (SELECT count(DISTINCT session_id) FROM page_views WHERE ${between("occurred_at")} AND path = ANY($3::text[]))::int AS viewed_products,
               (SELECT count(DISTINCT session_id) FROM events WHERE ${between("occurred_at")} AND name = 'cta_click')::int AS clicked_cta,
               (SELECT count(DISTINCT session_id) FROM events WHERE ${between("occurred_at")} AND name = 'form_start')::int AS started_form,
               (SELECT count(DISTINCT session_id) FROM events WHERE ${between("occurred_at")} AND name = 'form_submit')::int AS submitted_form`,
            [from, to, productPaths]
          )
          .then((r) => r.rows[0]),
        db.query("SELECT count(*)::int AS n FROM sessions WHERE last_activity_at > now() - interval '5 minutes'").then((r) => r.rows[0].n),
        group(
          `SELECT COALESCE(segment, 'unspecified') AS segment, COALESCE(chip, 'unspecified') AS chip, count(*)::int AS leads
             FROM contacts WHERE ${between("created_at")} AND status <> 'spam' GROUP BY 1, 2 ORDER BY leads DESC LIMIT 12`,
          p
        ),
      ]);

      return {
        range: { from: range.fromDate, to: range.toDate, days: range.days, timezone },
        totals: camel(totals),
        previous: camel(prevTotals),
        activeNow: live,
        series: camelAll(series),
        topPages: camelAll(topPages),
        channels: camelAll(channels),
        referrers,
        devices: camelAll(devices),
        funnel: camel(funnel),
        leadMix,
      };
    },

    async campaigns(range) {
      const { from, to } = await bounds(range);
      const rows = await group(
        `SELECT s.utm_campaign AS campaign, COALESCE(s.utm_source, '') AS source, COALESCE(s.utm_medium, '') AS medium,
                count(*)::int AS sessions, count(DISTINCT s.visitor_id)::int AS visitors,
                (SELECT count(*) FROM contacts c WHERE ${between("c.created_at")} AND c.status <> 'spam'
                    AND c.utm_campaign = s.utm_campaign AND COALESCE(c.utm_source, '') = COALESCE(s.utm_source, ''))::int AS leads,
                (SELECT count(*) FROM applications a WHERE ${between("a.created_at")}
                    AND a.utm_campaign = s.utm_campaign AND COALESCE(a.utm_source, '') = COALESCE(s.utm_source, ''))::int AS applications,
                (SELECT count(*) FROM subscribers b WHERE ${between("b.created_at")}
                    AND b.utm_campaign = s.utm_campaign AND COALESCE(b.utm_source, '') = COALESCE(s.utm_source, ''))::int AS subscribers
           FROM sessions s WHERE ${between("s.started_at")} AND s.utm_campaign IS NOT NULL
          GROUP BY s.utm_campaign, s.utm_source, s.utm_medium ORDER BY sessions DESC LIMIT 50`,
        [from, to]
      );
      const channels = await group(
        `SELECT channel, count(*)::int AS sessions FROM sessions WHERE ${between("started_at")} GROUP BY channel ORDER BY sessions DESC`,
        [from, to]
      );
      return { rows, channels };
    },

    async audience(range) {
      const { from, to } = await bounds(range);
      const p = [from, to];
      const top = (col, n = 8) =>
        group(
          `SELECT COALESCE(${col}, 'Unknown') AS label, count(*)::int AS sessions FROM sessions
            WHERE ${between("started_at")} GROUP BY 1 ORDER BY sessions DESC LIMIT ${n}`,
          p
        );
      const [devices, browsers, systems, languages, places, screens, returning] = await Promise.all([
        top("device_type"),
        top("browser"),
        top("os"),
        top("language"),
        top("COALESCE(country, timezone)"),
        group(
          `SELECT CASE WHEN viewport_width IS NULL THEN 'Unknown' WHEN viewport_width < 480 THEN 'Under 480 px'
                       WHEN viewport_width < 768 THEN '480–767 px' WHEN viewport_width < 1024 THEN '768–1023 px'
                       WHEN viewport_width < 1440 THEN '1024–1439 px' ELSE '1440 px and up' END AS label,
                  count(*)::int AS sessions
             FROM sessions WHERE ${between("started_at")} GROUP BY 1 ORDER BY sessions DESC`,
          p
        ),
        // NB: despite the key name, "sessions" here counts DISTINCT VISITORS (people), not visits; the console labels it that way.
        group(
          `SELECT CASE WHEN v.first_seen_at >= $1::timestamptz THEN 'New' ELSE 'Returning' END AS label,
                  count(DISTINCT s.visitor_id)::int AS sessions
             FROM sessions s JOIN visitors v ON v.id = s.visitor_id
            WHERE ${between("s.started_at")} GROUP BY 1 ORDER BY sessions DESC`,
          p
        ),
      ]);
      return { devices, browsers, systems, languages, places, screens, returning };
    },
  };
}

