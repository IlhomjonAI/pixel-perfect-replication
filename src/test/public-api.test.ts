// @vitest-environment node
import { readFile } from "node:fs/promises";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { Miniflare } from "miniflare";
import { handlePublicApi } from "@/server/public-api";
import { boundPagination, listPosts } from "@/server/db";

let runtime: Miniflare;
let db: D1Database;
const request = (path: string, method = "GET") =>
  handlePublicApi(new Request(`https://school.test${path}`, { method }), { DB: db });

beforeAll(async () => {
  runtime = new Miniflare({
    modules: true,
    script: "export default { fetch() { return new Response('test'); } }",
    compatibilityDate: "2026-08-06",
    d1Databases: { DB: "school-api-tests" },
  });
  db = await runtime.getD1Database("DB");
  for (const file of ["0001_init.sql", "0002_publication.sql"]) {
    const sql = await readFile(new URL(`../../migrations/${file}`, import.meta.url), "utf8");
    // Execute complete migration statements in real local D1, not a mocked SQL matcher.
    for (const statement of sql
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean)) {
      await db.prepare(statement).run();
    }
  }
  for (const status of ["draft", "published", "archived"]) {
    await db
      .prepare(
        "INSERT INTO posts (slug,title,category,date,excerpt,body,status) VALUES (?,?, 'Yangilik','2026-10-10','Namuna','[]',?)",
      )
      .bind(status, `Namuna ${status}`, status)
      .run();
    await db
      .prepare(
        "INSERT INTO teachers (slug,name,subject,qualification,education,experience,biography,status) VALUES (?,?,'Namuna','Namuna','Namuna','Namuna','Namuna',?)",
      )
      .bind(status, `Namuna ${status}`, status)
      .run();
    await db
      .prepare(
        "INSERT INTO achievements (id,student_name,class_at_achievement,type,title,subject,stage,result,achievement_date,status) VALUES (?,'Namuna','9-sinf','STEM','Namuna','Namuna','Tuman','Namuna','2026-10-10',?)",
      )
      .bind(status, status)
      .run();
  }
  await db
    .prepare(
      "INSERT INTO posts (slug,title,category,date,excerpt,body,status) VALUES ('published-2','Namuna 2','Yangilik','2026-10-09','Namuna','[]','published')",
    )
    .run();
}, 30_000);

afterAll(async () => {
  await runtime?.dispose();
});

describe("Public API with real local D1", () => {
  it("checks the binding and migrated schema", async () => {
    const response = await request("/api/health");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ data: { status: "ok", database: "ready" } });
  });

  it.each(["posts", "teachers", "achievements"])(
    "excludes drafts and archives from %s",
    async (resource) => {
      const response = await request(`/api/${resource}`);
      const body = await response.json();
      expect(response.status).toBe(200);
      expect(body.data.length).toBeGreaterThan(0);
      expect(
        body.data.every((item: { slug?: string; id?: string }) =>
          (item.slug ?? item.id)?.startsWith("published"),
        ),
      ).toBe(true);
    },
  );

  it.each(["posts", "teachers"])("hides unpublished %s detail", async (resource) => {
    expect((await request(`/api/${resource}/draft`)).status).toBe(404);
    expect((await request(`/api/${resource}/archived`)).status).toBe(404);
    expect((await request(`/api/${resource}/missing`)).status).toBe(404);
    expect((await request(`/api/${resource}/published`)).status).toBe(200);
  });

  it("pages results in stable order", async () => {
    const a = await (await request("/api/posts?limit=1&offset=0")).json();
    const b = await (await request("/api/posts?limit=1&offset=1")).json();
    expect(a.data.map((p: { slug: string }) => p.slug)).toEqual(["published"]);
    expect(b.data.map((p: { slug: string }) => p.slug)).toEqual(["published-2"]);
    expect(a.pagination).toEqual({ limit: 1, offset: 0 });
  });

  it.each([
    "limit=0",
    "limit=51",
    "limit=-1",
    "limit=1.5",
    "offset=-1",
    "offset=100001",
    "offset=no",
    "limit=",
  ])("rejects invalid pagination %s", async (query) => {
    expect((await request(`/api/posts?${query}`)).status).toBe(400);
  });

  it("bounds helper queries even without API validation", async () => {
    expect(boundPagination(Infinity, -4)).toEqual({ limit: 20, offset: 0 });
    expect(boundPagination(1e9, 1e9)).toEqual({ limit: 50, offset: 100_000 });
    expect((await listPosts(db, -5)).length).toBe(1);
  });

  it("binds slugs instead of interpolating SQL", async () => {
    expect((await request(`/api/posts/${encodeURIComponent("' OR 1=1 --")}`)).status).toBe(404);
  });

  it("has no public contact-message endpoint", async () => {
    expect((await request("/api/contact_messages")).status).toBe(404);
    expect((await request("/api/inquiries")).status).toBe(404);
    const response = await request("/api/posts", "POST");
    expect(response.status).toBe(405);
    expect(response.headers.get("Allow")).toBe("GET");
  });

  it("returns safe errors when D1 is unavailable", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const response = await handlePublicApi(new Request("https://school.test/api/posts"), {});
      expect(response.status).toBe(503);
      expect(await response.text()).not.toContain("binding");
    } finally {
      spy.mockRestore();
    }
  });
});
