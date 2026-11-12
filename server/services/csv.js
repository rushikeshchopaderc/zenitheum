/**
 * RFC 4180 CSV with two extras: a UTF-8 byte-order mark so Excel reads non-ASCII names correctly, and
 * protection against spreadsheet formula injection (a cell that starts with = + - @ gets a leading
 * apostrophe, so a hostile "name" typed into a public form cannot run when the marketer opens the export).
 */
export function toCsv(rows, columns, { timeZone = "UTC" } = {}) {
  // "2026-11-11 23:36:12" in the business time zone: sortable, and Excel reads it as a date-time.
  const stamp = new Intl.DateTimeFormat("sv-SE", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
  });
  const cell = (value) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "boolean") return value ? "yes" : "no";
    let text = value instanceof Date ? stamp.format(value) : Array.isArray(value) ? value.join(" > ") : typeof value === "object" ? JSON.stringify(value) : String(value);
    if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const lines = [columns.map((c) => cell(c.header)).join(",")];
  for (const row of rows) lines.push(columns.map((c) => cell(row[c.key])).join(","));
  return `\uFEFF${lines.join("\r\n")}\r\n`;
}

export const COLUMNS = {
  contacts: [
    { key: "ref", header: "Reference" },
    { key: "createdAt", header: "Received" },
    { key: "status", header: "Status" },
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
    { key: "organisation", header: "Organisation" },
    { key: "jobTitle", header: "Job title" },
    { key: "topic", header: "Topic" },
    { key: "segment", header: "Segment" },
    { key: "chip", header: "Chip" },
    { key: "volume", header: "Annual volume" },
    { key: "message", header: "Message" },
    { key: "notes", header: "Notes" },
    { key: "channel", header: "Channel" },
    { key: "utmSource", header: "UTM source" },
    { key: "utmMedium", header: "UTM medium" },
    { key: "utmCampaign", header: "UTM campaign" },
    { key: "referrerHost", header: "Referrer" },
    { key: "landingPath", header: "Landing page" },
  ],
  applications: [
    { key: "ref", header: "Reference" },
    { key: "createdAt", header: "Received" },
    { key: "status", header: "Status" },
    { key: "jobTitle", header: "Role" },
    { key: "track", header: "Track" },
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
    { key: "organisation", header: "Institute / employer" },
    { key: "profileUrl", header: "Profile" },
    { key: "note", header: "Note" },
    { key: "hasResume", header: "Resume attached" },
    { key: "notes", header: "Internal notes" },
    { key: "channel", header: "Channel" },
    { key: "utmSource", header: "UTM source" },
    { key: "utmCampaign", header: "UTM campaign" },
  ],
  subscribers: [
    { key: "email", header: "Email" },
    { key: "status", header: "Status" },
    { key: "source", header: "Signed up from" },
    { key: "createdAt", header: "Subscribed" },
    { key: "channel", header: "Channel" },
    { key: "utmSource", header: "UTM source" },
    { key: "utmCampaign", header: "UTM campaign" },
  ],
  sessions: [
    { key: "startedAt", header: "Started" },
    { key: "channel", header: "Channel" },
    { key: "referrerHost", header: "Referrer" },
    { key: "utmSource", header: "UTM source" },
    { key: "utmMedium", header: "UTM medium" },
    { key: "utmCampaign", header: "UTM campaign" },
    { key: "landingPath", header: "Landing page" },
    { key: "pages", header: "Pages viewed" },
    { key: "pageViews", header: "Page views" },
    { key: "activeMs", header: "Active time (ms)" },
    { key: "deviceType", header: "Device" },
    { key: "browser", header: "Browser" },
    { key: "os", header: "OS" },
    { key: "timezone", header: "Time zone" },
    { key: "language", header: "Language" },
    { key: "lead", header: "Became a lead" },
    { key: "applied", header: "Applied for a job" },
  ],
  events: [
    { key: "occurredAt", header: "Time" },
    { key: "name", header: "Event" },
    { key: "path", header: "Page" },
    { key: "props", header: "Details" },
    { key: "channel", header: "Channel" },
    { key: "deviceType", header: "Device" },
  ],
};
