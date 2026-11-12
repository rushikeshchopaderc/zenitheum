import { camel, camelAll, page, whereBuilder } from "./shared.js";

export function createAnalyticsRepository(db) {
  return {
    /**
     * Store one validated batch from a browser. Everything happens in a single transaction.
     * Returns { accepted: false } when the session id already belongs to a different visitor (a
     * forged or replayed id must not be able to write into someone else's session).
     */
    ingest({ visitorId, sessionId, session, pageviews, leaves, events }) {
      return db.tx(async (q) => {
        await q.query(
          `INSERT INTO visitors (id, first_seen_at, last_seen_at, first_channel, first_referrer_host,
                                 first_utm_source, first_utm_medium, first_utm_campaign, first_landing_path,
                                 country, timezone, language)
           VALUES ($1, $2, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           ON CONFLICT (id) DO UPDATE SET
             last_seen_at = GREATEST(visitors.last_seen_at, EXCLUDED.last_seen_at),
             country  = COALESCE(EXCLUDED.country,  visitors.country),
             timezone = COALESCE(EXCLUDED.timezone, visitors.timezone),
             language = COALESCE(EXCLUDED.language, visitors.language)`,
          [
            visitorId, session.startedAt, session.channel, session.referrerHost, session.utm.source, session.utm.medium,
            session.utm.campaign, session.landingPath, session.country, session.timezone, session.language,
          ]
        );

        let known = (await q.query("SELECT visitor_id FROM sessions WHERE id = $1", [sessionId])).rows[0];
        if (!known) {
          // Two beacons of a brand-new session can arrive together; ON CONFLICT lets the loser carry on.
          const inserted = await q.query(
            `INSERT INTO sessions (id, visitor_id, started_at, last_activity_at, landing_path, referrer_host, referrer_url,
                                   channel, utm_source, utm_medium, utm_campaign, utm_term, utm_content, device_type,
                                   browser, browser_version, os, os_version, screen_width, screen_height, viewport_width,
                                   pixel_ratio, language, timezone, country)
             VALUES ($1, $2, $3, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
             ON CONFLICT (id) DO NOTHING`,
            [
              sessionId, visitorId, session.startedAt, session.landingPath, session.referrerHost, session.referrerUrl,
              session.channel, session.utm.source, session.utm.medium, session.utm.campaign, session.utm.term, session.utm.content,
              session.device.deviceType, session.device.browser, session.device.browserVersion, session.device.os, session.device.osVersion,
              session.screen.width, session.screen.height, session.screen.viewport, session.screen.pixelRatio,
              session.language, session.timezone, session.country,
            ]
          );
          if (inserted.rowCount) {
            await q.query("UPDATE visitors SET sessions_count = sessions_count + 1 WHERE id = $1", [visitorId]);
            known = { visitor_id: visitorId };
          } else {
            known = (await q.query("SELECT visitor_id FROM sessions WHERE id = $1", [sessionId])).rows[0];
          }
        }
        if (!known || known.visitor_id !== visitorId) return { accepted: false };

        let activeMs = 0;
        let lastPath = null;

        for (const view of pageviews) {
          await q.query(
            "INSERT INTO page_views (session_id, visitor_id, path, title, occurred_at) VALUES ($1, $2, $3, $4, $5)",
            [sessionId, visitorId, view.path, view.title, view.at]
          );
          lastPath = view.path;
        }

        for (const leave of leaves) {
          await q.query(
            `UPDATE page_views
                SET duration_ms = COALESCE(duration_ms, 0) + $3, max_scroll_pct = GREATEST(COALESCE(max_scroll_pct, 0), $4)
              WHERE id = (SELECT id FROM page_views WHERE session_id = $1 AND path = $2
                           ORDER BY occurred_at DESC, id DESC LIMIT 1)`,
            [sessionId, leave.path, leave.durationMs, leave.scrollPct]
          );
          activeMs += leave.durationMs;
        }

        for (const event of events) {
          await q.query(
            "INSERT INTO events (session_id, visitor_id, name, path, props, occurred_at) VALUES ($1, $2, $3, $4, $5::jsonb, $6)",
            [sessionId, visitorId, event.name, event.path, JSON.stringify(event.props), event.at]
          );
        }

        await q.query(
          `UPDATE sessions SET
             page_views = page_views + $2, events_count = events_count + $3, active_ms = active_ms + $4,
             last_activity_at = GREATEST(last_activity_at, now()), exit_path = COALESCE($5, exit_path)
           WHERE id = $1`,
          [sessionId, pageviews.length, events.length, activeMs, lastPath]
        );
        return { accepted: true };
      });
    },

    async listSessions({ channel, device, converted, from, to, ...paging } = {}) {
      const w = whereBuilder();
      if (channel) w.add("s.channel = ?", channel);
      if (device) w.add("s.device_type = ?", device);
      if (from) w.add("s.started_at >= ?::timestamptz", from);
      if (to) w.add("s.started_at < ?::timestamptz", to);
      if (converted) {
        w.add("(EXISTS (SELECT 1 FROM contacts c WHERE c.session_id = s.id) OR EXISTS (SELECT 1 FROM applications a WHERE a.session_id = s.id) OR ?::boolean = false)", true);
      }
      const { limit, offset } = page(paging);
      const total = (await db.query(`SELECT count(*)::int AS n FROM sessions s ${w.sql}`, w.params)).rows[0].n;
      const { rows } = await db.query(
        `SELECT s.id, s.visitor_id, s.started_at, s.landing_path, s.channel, s.referrer_host, s.utm_source, s.utm_medium,
                s.utm_campaign, s.device_type, s.browser, s.os, s.country, s.timezone, s.language, s.page_views,
                s.events_count, s.active_ms,
                (SELECT array_agg(p.path ORDER BY p.occurred_at, p.id) FROM page_views p WHERE p.session_id = s.id) AS pages,
                EXISTS (SELECT 1 FROM contacts c WHERE c.session_id = s.id) AS lead,
                EXISTS (SELECT 1 FROM applications a WHERE a.session_id = s.id) AS applied
           FROM sessions s ${w.sql} ORDER BY s.started_at DESC LIMIT ${limit} OFFSET ${offset}`,
        w.params
      );
      return { rows: camelAll(rows), total };
    },

    /** One visit in full: the pages in order and every event, so a lead can be traced back to what they read. */
    async getSession(id) {
      const session = (await db.query("SELECT * FROM sessions WHERE id = $1", [id])).rows[0];
      if (!session) return null;
      const [views, events] = await Promise.all([
        db.query("SELECT path, title, occurred_at, duration_ms, max_scroll_pct FROM page_views WHERE session_id = $1 ORDER BY occurred_at, id", [id]),
        db.query("SELECT name, path, props, occurred_at FROM events WHERE session_id = $1 ORDER BY occurred_at, id", [id]),
      ]);
      return { session: camel(session), pageViews: camelAll(views.rows), events: camelAll(events.rows) };
    },

    async listEvents({ name, from, to, ...paging } = {}) {
      const w = whereBuilder();
      if (name) w.add("e.name = ?", name);
      if (from) w.add("e.occurred_at >= ?::timestamptz", from);
      if (to) w.add("e.occurred_at < ?::timestamptz", to);
      const { limit, offset } = page(paging);
      const total = (await db.query(`SELECT count(*)::int AS n FROM events e ${w.sql}`, w.params)).rows[0].n;
      const { rows } = await db.query(
        `SELECT e.name, e.path, e.props, e.occurred_at, e.visitor_id, e.session_id, s.channel, s.device_type
           FROM events e JOIN sessions s ON s.id = e.session_id
           ${w.sql} ORDER BY e.occurred_at DESC, e.id DESC LIMIT ${limit} OFFSET ${offset}`,
        w.params
      );
      return { rows: camelAll(rows), total };
    },

    async eventNames() {
      return (await db.query("SELECT name, count(*)::int AS n FROM events GROUP BY name ORDER BY n DESC")).rows;
    },

    /** Erase everything stored about one visitor (right-to-erasure requests). Leads keep only what they typed. */
    async eraseVisitor(visitorId) {
      await db.query("UPDATE contacts SET visitor_id = NULL, session_id = NULL WHERE visitor_id = $1", [visitorId]);
      await db.query("UPDATE applications SET visitor_id = NULL, session_id = NULL WHERE visitor_id = $1", [visitorId]);
      await db.query("UPDATE subscribers SET visitor_id = NULL WHERE visitor_id = $1", [visitorId]);
      return (await db.query("DELETE FROM visitors WHERE id = $1", [visitorId])).rowCount > 0;
    },

    camel,
  };
}
