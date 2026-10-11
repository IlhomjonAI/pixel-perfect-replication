// @vitest-environment node
import { readFile } from "node:fs/promises";
import { Miniflare } from "miniflare";
import { beforeAll, afterAll, it, expect } from "vitest";
import { handleAdminSchoolLife } from "@/server/admin-school-life";
import { listSchoolLife } from "@/server/db";
import { handlePublicApi } from "@/server/public-api";
import { digest } from "@/server/admin-auth";
let runtime: Miniflare;
let db: D1Database;
const token = "d".repeat(64),
  credential = "life-test-credential";
const env = () => ({ DB: db, ADMIN_PASSWORD_HASH: credential });
const fixture = {
  title: "STEM haftaligi",
  description: "Maktabda yangi STEM loyihalari namoyish etildi.",
  category: "Tadbir",
  eventDate: "2026-10-10",
  image: "https://example.test/cover.png",
  gallery: ["https://example.test/photo.png"],
  status: "draft",
  version: 0,
};
const req = (
  path = "",
  method = "GET",
  body?: unknown,
  authenticated = true,
  origin = "https://school.test",
) =>
  new Request("https://school.test/api/admin/school-life" + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      origin,
      ...(authenticated ? { cookie: "bekobod_admin=" + token } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
const call = (path = "", method = "GET", body?: unknown) =>
  handleAdminSchoolLife(req(path, method, body), env());
beforeAll(async () => {
  runtime = new Miniflare({
    modules: true,
    script: 'export default {fetch(){return new Response("ok")}}',
    compatibilityDate: "2026-08-06",
    d1Databases: { DB: "life-edit-tests" },
  });
  db = await runtime.getD1Database("DB");
  for (const file of [
    "0001_init.sql",
    "0002_publication.sql",
    "0003_admin_auth.sql",
    "0004_post_versions.sql",
    "0005_achievement_versions.sql",
    "0006_teacher_versions.sql",
    "0007_contact_workflow.sql",
    "0008_image_uploads.sql",
    "0009_school_life.sql",
  ]) {
    const sql = await readFile(new URL("../../migrations/" + file, import.meta.url), "utf8");
    for (const s of sql
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean))
      await db.prepare(s).run();
  }
  await db
    .prepare("INSERT INTO admin_sessions VALUES (?,?,?)")
    .bind(await digest(token), await digest(credential), Math.floor(Date.now() / 1000) + 3600)
    .run();
});
afterAll(async () => {
  await runtime?.dispose();
});
it("denies anonymous requests and cross-origin writes", async () => {
  for (const method of ["GET", "POST"])
    expect(
      (
        await handleAdminSchoolLife(
          req("", method, method === "POST" ? fixture : undefined, false),
          env(),
        )
      ).status,
    ).toBe(401);
  expect(
    (await handleAdminSchoolLife(req("", "POST", fixture, true, "https://evil.test"), env()))
      .status,
  ).toBe(403);
  expect(await listSchoolLife(db)).toEqual([]);
});
it.each([
  { title: "" },
  { description: "Short" },
  { category: "Unknown" },
  { eventDate: "2026-02-30" },
  { image: "javascript:alert(1)" },
  { gallery: ["http://example.test/a.png"] },
  { gallery: Array(21).fill("https://example.test/a.png") },
  { status: "unknown" },
  { isDemo: true },
  { version: 1 },
])("rejects invalid activity %j", async (patch) => {
  expect((await call("", "POST", { ...fixture, ...patch })).status).toBe(400);
});
it("preserves gallery through publication and archives without deletion", async () => {
  const created = await call("", "POST", fixture);
  expect(created.status).toBe(201);
  const item = (await created.json()).data;
  expect(item.isDemo).toBe(false);
  expect(await listSchoolLife(db)).toEqual([]);
  expect((await call("/" + item.id)).status).toBe(200);
  const published = await call("/" + item.id, "PUT", { ...fixture, status: "published" });
  expect(published.status).toBe(200);
  expect((await published.json()).data.version).toBe(1);
  expect((await listSchoolLife(db))[0]).toMatchObject({
    id: item.id,
    gallery: fixture.gallery,
    eventDate: fixture.eventDate,
    category: "Tadbir",
  });
  expect((await call("/" + item.id, "PUT", { ...fixture, title: "Stale overwrite" })).status).toBe(
    409,
  );
  expect((await listSchoolLife(db))[0]?.title).toBe(fixture.title);
  expect(
    (await call("/" + item.id, "PUT", { ...fixture, status: "archived", version: 1 })).status,
  ).toBe(200);
  expect(await listSchoolLife(db)).toEqual([]);
  expect((await call("/" + item.id)).status).toBe(200);
});
it("accepts activities without dates or photos", async () => {
  expect(
    (await call("", "POST", { ...fixture, eventDate: null, image: null, gallery: [] })).status,
  ).toBe(201);
});
it("allows only one concurrent edit for the same version", async () => {
  const item = (await (await call("", "POST", fixture)).json()).data;
  const results = await Promise.all([
    call("/" + item.id, "PUT", { ...fixture, title: "First edit" }),
    call("/" + item.id, "PUT", { ...fixture, title: "Second edit" }),
  ]);
  expect(results.map((r) => r.status).sort()).toEqual([200, 409]);
});
it("pages 45 activities and exposes only published items through the public API", async () => {
  for (let i = 0; i < 45; i++)
    await db
      .prepare(
        "INSERT INTO school_life (id,title,description,event_date,gallery,status) VALUES (?,?,'Fixture description','2026-11-01','[]','published')",
      )
      .bind("fixture-" + String(i).padStart(2, "0"), "Fixture " + i)
      .run();
  const first = await listSchoolLife(db, 20),
    second = await listSchoolLife(db, 20, 20);
  expect(first).toHaveLength(20);
  expect(second).toHaveLength(20);
  expect(second[0]?.id).toBe("fixture-20");
  expect(new Set([...first, ...second].map((v) => v.id)).size).toBe(40);
  const admin = await (await call("?offset=20")).json();
  expect(admin.pagination.hasMore).toBe(true);
  const api = await handlePublicApi(
    new Request("https://school.test/api/school-life?limit=20&offset=40"),
    env(),
  );
  expect(api.status).toBe(200);
  expect((await api.json()).data).toHaveLength(5);
}, 30000);
it("enforces body size, offsets, missing records and blocked deletion", async () => {
  expect((await call("", "POST", { ...fixture, description: "x".repeat(66000) })).status).toBe(413);
  expect((await call("?offset=-1")).status).toBe(400);
  expect((await call("/missing", "PUT", fixture)).status).toBe(404);
  expect((await call("", "DELETE")).status).toBe(405);
});
it("upgrades old records without losing their fields or publication state", async () => {
  const old = new Miniflare({
    modules: true,
    script: 'export default {fetch(){return new Response("ok")}}',
    compatibilityDate: "2026-08-06",
    d1Databases: { DB: "life-migration-test" },
  });
  try {
    const legacy = await old.getD1Database("DB");
    for (const file of ["0001_init.sql", "0002_publication.sql"]) {
      const sql = await readFile(new URL("../../migrations/" + file, import.meta.url), "utf8");
      for (const s of sql
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean))
        await legacy.prepare(s).run();
    }
    await legacy
      .prepare(
        "INSERT INTO school_life (id,title,description,image,status) VALUES ('old','Old activity','Old activity description','https://example.test/old.png','published')",
      )
      .run();
    const sql = await readFile(
      new URL("../../migrations/0009_school_life.sql", import.meta.url),
      "utf8",
    );
    for (const s of sql
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean))
      await legacy.prepare(s).run();
    expect((await listSchoolLife(legacy))[0]).toMatchObject({
      id: "old",
      title: "Old activity",
      image: "https://example.test/old.png",
      category: "Faoliyat",
      eventDate: null,
      gallery: [],
    });
  } finally {
    await old.dispose();
  }
});
