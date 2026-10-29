// @vitest-environment node
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SqliteDatabase } from "@backend/database/sqlite";
import { handlePublicApi } from "@backend/api/public-api";

describe("Node SQLite persistence and public filters", () => {
  it("reopens persisted data and applies migrations exactly once", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "school-sqlite-"));
    try {
      const filename = path.join(dir, "school.sqlite");
      const first = new SqliteDatabase(filename);
      first.migrate();
      await first
        .prepare(
          "INSERT INTO posts (slug,title,category,date,excerpt,body,status) VALUES ('persisted','Saved','Yangilik','2026-10-16','Saved','[]','published')",
        )
        .run();
      first.close();
      const second = new SqliteDatabase(filename);
      try {
        second.migrate();
        expect(
          await second.prepare("SELECT title FROM posts WHERE slug=?").bind("persisted").first(),
        ).toMatchObject({ title: "Saved" });
        expect(
          await second.prepare("SELECT count(*) AS total FROM schema_migrations").first(),
        ).toMatchObject({ total: 12 });
      } finally {
        second.close();
      }
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
  it("filters published achievements and validates query parameters", async () => {
    const db = new SqliteDatabase();
    try {
      db.migrate();
      for (const [id, status, subject] of [
        ["one", "published", "Math"],
        ["two", "published", "Physics"],
        ["draft", "draft", "Private subject"],
      ]) {
        await db
          .prepare(
            "INSERT INTO achievements (id,student_name,class_at_achievement,type,title,subject,stage,result,achievement_date,status) VALUES (?,'Test','9-sinf','STEM','Test',?,'Tuman','1','2026-10-16',?)",
          )
          .bind(id, subject, status)
          .run();
      }
      const get = (path: string) =>
        handlePublicApi(new Request("https://school.test/api/" + path), { DB: db });
      const page = await (await get("achievement-page?subject=Math&year=2026&limit=1")).json();
      expect(page.data.items).toHaveLength(1);
      expect(page.data.items[0].id).toBe("one");
      expect(page.data.hasMore).toBe(false);
      const filters = await (await get("achievement-filters")).json();
      expect(filters.data).toEqual({ year: ["2026"], subject: ["Math", "Physics"] });
      expect((await get("achievement-page?limit=0")).status).toBe(400);
      expect((await get("achievement-page?stage=unknown")).status).toBe(400);
    } finally {
      db.close();
    }
  });
});
