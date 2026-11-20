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
    { key: "organisation", header: "Company" },
    { key: "jobTitle", header: "Role" },
    { key: "segment", header: "Customer segment" },
    { key: "topic", header: "Type" },
    { key: "chip", header: "Chip" },
    { key: "analogFormat", header: "ZT-AFE1 delivery" },
    { key: "message", header: "Message" },
    { key: "notes", header: "Notes" },
  ],
  demos: [
    { key: "ref", header: "Reference" },
    { key: "preferredDate", header: "Preferred date" },
    { key: "preferredTime", header: "Preferred time (IST)" },
    { key: "status", header: "Status" },
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
    { key: "organisation", header: "Company" },
    { key: "jobTitle", header: "Role" },
    { key: "segment", header: "Customer segment" },
    { key: "chip", header: "Chip" },
    { key: "analogFormat", header: "ZT-AFE1 delivery" },
    { key: "message", header: "Message" },
    { key: "notes", header: "Notes" },
    { key: "createdAt", header: "Requested on" },
  ],
  orders: [
    { key: "ref", header: "Reference" },
    { key: "createdAt", header: "Received" },
    { key: "status", header: "Status" },
    { key: "organisation", header: "Company" },
    { key: "contactName", header: "Contact person" },
    { key: "jobTitle", header: "Role" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
    { key: "chip", header: "Chip" },
    { key: "analogFormat", header: "ZT-AFE1 delivery" },
    { key: "quantity", header: "Quantity" },
    { key: "deliveryDate", header: "Delivery date" },
    { key: "deliveryLocation", header: "Delivery location" },
    { key: "customisation", header: "Customisation" },
    { key: "notes", header: "Customer notes" },
    { key: "internalNotes", header: "Internal notes" },
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
    { key: "resumeUrl", header: "Resume (Google Drive)" },
    { key: "note", header: "Note" },
    { key: "notes", header: "Internal notes" },
  ],
  subscribers: [
    { key: "email", header: "Email" },
    { key: "name", header: "Name" },
    { key: "status", header: "Status" },
    { key: "chip", header: "Chip" },
    { key: "analogFormat", header: "ZT-AFE1 delivery" },
    { key: "source", header: "Signed up from" },
    { key: "createdAt", header: "Subscribed" },
  ],
};
