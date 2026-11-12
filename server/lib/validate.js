/**
 * Tiny, dependency-free validation. A schema is { field: rule } where a rule is
 * a function (raw) => ({ value }) | ({ error }). Every rule trims input and
 * strips control characters, so nothing reaches storage or an e-mail header
 * with a stray newline in it.
 */

// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

// HTML Living Standard e-mail pattern, tightened to require a dotted domain.
const EMAIL =
  /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

const clean = (input, multiline) => {
  const stripped = String(input).replace(CONTROL, "");
  return (
    multiline
      ? stripped.replace(/\r\n?/g, "\n").replace(/\n{3,}/g, "\n\n")
      : stripped.replace(/[\r\n\t]+/g, " ")
  ).trim();
};

const isEmpty = (raw) => raw === undefined || raw === null || raw === "";

export const text =
  ({ label = "This field", required = false, min = 0, max = 200, multiline = false } = {}) =>
  (raw) => {
    if (isEmpty(raw)) return required ? { error: `${label} is required.` } : { value: "" };
    if (typeof raw !== "string") return { error: `${label} must be text.` };
    const value = clean(raw, multiline);
    if (!value) return required ? { error: `${label} is required.` } : { value: "" };
    if (value.length < min) return { error: `${label} must be at least ${min} characters.` };
    if (value.length > max) return { error: `${label} must be at most ${max} characters.` };
    return { value };
  };

export const email =
  ({ label = "Email", required = true } = {}) =>
  (raw) => {
    const base = text({ label, required, max: 254 })(raw);
    if (base.error || !base.value) return base;
    if (!EMAIL.test(base.value)) return { error: "Enter a valid email address." };
    return { value: base.value.toLowerCase() };
  };

export const phone =
  ({ label = "Phone", required = false } = {}) =>
  (raw) => {
    const base = text({ label, required, max: 24 })(raw);
    if (base.error || !base.value) return base;
    const digits = base.value.replace(/\D/g, "");
    if (!/^[+()\d\s.-]+$/.test(base.value) || digits.length < 7 || digits.length > 15) {
      return { error: "Enter a valid phone number." };
    }
    return { value: base.value };
  };

export const url =
  ({ label = "Link", required = false } = {}) =>
  (raw) => {
    const base = text({ label, required, max: 300 })(raw);
    if (base.error || !base.value) return base;
    try {
      const parsed = new URL(/^https?:\/\//i.test(base.value) ? base.value : `https://${base.value}`);
      if (!["http:", "https:"].includes(parsed.protocol) || !parsed.hostname.includes(".")) throw new Error("bad url");
      return { value: parsed.href };
    } catch {
      return { error: "Enter a valid link, e.g. https://github.com/you." };
    }
  };

export const oneOf =
  (values, { label = "This field", required = true } = {}) =>
  (raw) => {
    if (isEmpty(raw)) return required ? { error: `${label} is required.` } : { value: "" };
    return values.includes(raw) ? { value: raw } : { error: `${label} is not a valid choice.` };
  };

export const consent =
  ({ message = "Please agree to the privacy notice to continue." } = {}) =>
  (raw) =>
    raw === true || raw === "true" || raw === "on" || raw === "1" ? { value: true } : { error: message };

/** Run a schema against untrusted input. Returns { value, errors }; errors is {} when valid. */
export function validate(input, schema) {
  const source = input && typeof input === "object" ? input : {};
  const value = {};
  const errors = {};
  for (const [field, rule] of Object.entries(schema)) {
    const result = rule(source[field]);
    if (result.error) errors[field] = result.error;
    else value[field] = result.value;
  }
  return { value, errors };
}

/** Make a client-supplied file name safe to store and to put in an e-mail. */
export function safeFileName(name) {
  const base = String(name ?? "")
    .replace(CONTROL, "")
    .split(/[\\/]/)
    .pop()
    .replace(/[^\w. -]/g, "_")
    .trim();
  return (base || "resume").slice(0, 120);
}

// ---------------------------------------------------------------------------------------------
// Rules added for the database-backed API
// ---------------------------------------------------------------------------------------------

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const isUuid = (value) => typeof value === "string" && UUID.test(value);

/** An optional uuid (visitor / session ids sent by the browser): anything else becomes null, never an error. */
export const optionalUuid = (raw) => (isUuid(raw) ? raw.toLowerCase() : null);

/** One of a fixed set, or empty. Unknown values are an error. */
export const optionalOneOf =
  (values, { label = "This field" } = {}) =>
  (raw) => {
    if (raw === undefined || raw === null || raw === "") return { value: "" };
    return values.includes(raw) ? { value: raw } : { error: `${label} is not a valid choice.` };
  };

/** ISO calendar date (YYYY-MM-DD) that really exists. */
export const isoDate =
  ({ label = "Date", required = true } = {}) =>
  (raw) => {
    if (raw === undefined || raw === null || raw === "") return required ? { error: `${label} is required.` } : { value: null };
    if (typeof raw !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return { error: `${label} must be a date like 2027-03-31.` };
    const parsed = new Date(`${raw}T00:00:00Z`);
    return Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== raw ? { error: `${label} is not a real date.` } : { value: raw };
  };

/** Integer within bounds, parsed from a number or a numeric string. */
export const integer =
  ({ label = "Number", min = 0, max = Number.MAX_SAFE_INTEGER, fallback } = {}) =>
  (raw) => {
    if (raw === undefined || raw === null || raw === "") return fallback === undefined ? { error: `${label} is required.` } : { value: fallback };
    const n = typeof raw === "number" ? raw : Number(raw);
    if (!Number.isInteger(n) || n < min || n > max) return { error: `${label} must be a whole number from ${min} to ${max}.` };
    return { value: n };
  };
