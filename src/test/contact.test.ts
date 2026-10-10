import { describe, expect, it } from "vitest";
import { validateContact } from "@/lib/contact";

const ok = { name: "Ali", contact: "ali@example.com", type: "Savol", message: "Salom, savolim bor.", consent: true };

describe("validateContact", () => {
  it("accepts a valid form", () => expect(validateContact(ok)).toEqual({}));
  it("accepts a phone number with spaces", () =>
    expect(validateContact({ ...ok, contact: "+998 90 123 45 67" })).toEqual({}));
  it("accepts a phone number with parentheses and hyphens", () =>
    expect(validateContact({ ...ok, contact: "(998) 90-123-4567" })).toEqual({}));
  it("accepts a phone number without plus", () =>
    expect(validateContact({ ...ok, contact: "998901234567" })).toEqual({}));
  it("rejects a phone number with too few digits", () =>
    expect(validateContact({ ...ok, contact: "+998 90 123" }).contact).toBeDefined());
  it("rejects a phone number with too many digits", () =>
    expect(validateContact({ ...ok, contact: "+998901234567890123" }).contact).toBeDefined());
  it("rejects a string of only separators", () =>
    expect(validateContact({ ...ok, contact: "() () ()" }).contact).toBeDefined());
  it("rejects a string with letters mixed in", () =>
    expect(validateContact({ ...ok, contact: "+998 90 abc 45 67" }).contact).toBeDefined());
  it("requires consent", () => expect(validateContact({ ...ok, consent: false }).consent).toBeDefined());
  it("rejects unknown request type", () =>
    expect(validateContact({ ...ok, type: "Shikoyat" }).type).toBeDefined());
});
