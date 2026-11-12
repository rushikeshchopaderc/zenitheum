import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { email, integer, isUuid, isoDate, optionalOneOf, optionalUuid, phone, safeFileName, text, url, validate } from "../lib/validate.js";

describe("validators", () => {
  it("normalise and reject", () => {
    assert.deepEqual(email()("  Asha@Example.COM "), { value: "asha@example.com" });
    assert.ok(email()("no-at-sign").error);
    assert.ok(email()("a@b").error, "a dotted domain is required");
    assert.deepEqual(phone()("+91 70664-97023"), { value: "+91 70664-97023" });
    assert.ok(phone()("12ab").error);
    assert.equal(url()("github.com/priya").value, "https://github.com/priya");
    assert.ok(url()("javascript:alert(1)").error);
    assert.deepEqual(text({ max: 5 })("a\u0000b\r\nc"), { value: "ab c" }, "control characters are dropped and newlines flattened");
    assert.ok(text({ max: 3 })("abcd").error);
    assert.ok(text({ required: true })("   ").error);
    const { value, errors } = validate({ name: "Asha", extra: "ignored" }, { name: text({ required: true }), note: text() });
    assert.deepEqual(value, { name: "Asha", note: "" });
    assert.deepEqual(errors, {});
  });

  it("safeFileName strips paths and odd characters", () => {
    assert.equal(safeFileName("../../etc/passwd"), "passwd");
    assert.equal(safeFileName("C:\\Users\\me\\résumé (final).pdf"), "r_sum_ _final_.pdf");
    assert.equal(safeFileName(""), "resume");
    assert.ok(safeFileName("a".repeat(400)).length <= 120);
  });

  it("recognise uuids and bound optional ids", () => {
    assert.equal(isUuid("0c7e4c9e-3b0d-4b6e-9f4a-6a7b8c9d0e1f"), true);
    assert.equal(isUuid("0c7e4c9e3b0d4b6e9f4a6a7b8c9d0e1f"), false);
    assert.equal(isUuid("'; DROP TABLE sessions;--"), false);
    assert.equal(optionalUuid("garbage"), null);
    assert.equal(optionalUuid("0C7E4C9E-3B0D-4B6E-9F4A-6A7B8C9D0E1F"), "0c7e4c9e-3b0d-4b6e-9f4a-6a7b8c9d0e1f");
  });

  it("validate dates, enumerations and integers", () => {
    assert.deepEqual(isoDate()("2027-02-28"), { value: "2027-02-28" });
    assert.ok(isoDate()("2027-02-30").error, "a date that does not exist");
    assert.ok(isoDate()("27-02-28").error);
    assert.deepEqual(isoDate({ required: false })(""), { value: null });
    assert.deepEqual(optionalOneOf(["a", "b"])(""), { value: "" });
    assert.ok(optionalOneOf(["a", "b"])("c").error);
    assert.deepEqual(integer({ min: 1, max: 5 })("3"), { value: 3 });
    assert.ok(integer({ min: 1, max: 5 })("9").error);
    assert.ok(integer({ min: 1, max: 5 })("1.5").error);
    assert.deepEqual(integer({ fallback: 7 })(undefined), { value: 7 });
  });
});
