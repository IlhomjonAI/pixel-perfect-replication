// @vitest-environment node
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
describe("Next App Router", () => {
  it("provides all public, detail, admin and redirect pages", () => {
    for (const route of [
      "",
      "maktab/",
      "yangiliklar/",
      "yangiliklar/[slug]/",
      "oqituvchilar/",
      "oqituvchilar/[slug]/",
      "yutuqlar/",
      "maktab-hayoti/",
      "qabul/",
      "aloqa/",
      "admin/",
      "murojaat/",
    ])
      expect(existsSync(`frontend/app/${route}page.tsx`)).toBe(true);
  });
  it("keeps server implementation outside the frontend", () => {
    for (const name of ["news", "teacher", "achievement", "school-life"])
      expect(readFileSync(`frontend/api/${name}.ts`, "utf8")).not.toContain("@backend/database");
  });
});
