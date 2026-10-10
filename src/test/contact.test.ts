import { describe, expect, it } from "vitest";
import { validateContact } from "@/lib/contact";

const ok = { name: "Ali", contact: "ali@example.com", type: "Savol", message: "Salom, savolim bor.", consent: true };

describe("validateContact", () => {
  it("accepts a valid form", () => expect(validateContact(ok)).toEqual({}));
  it("accepts a phone number", () => expect(validateContact({ ...ok, contact: "+998 90 123 45 67" })).toEqual({}));
  it("requires consent", () => expect(validateContact({ ...ok, consent: false }).consent).toBeDefined());
  it("rejects unknown request type", () => expect(validateContact({ ...ok, type: "Shikoyat" }).type).toBeDefined());
});
