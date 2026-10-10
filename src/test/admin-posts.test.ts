// @vitest-environment node
import { readFile } from "node:fs/promises";
import { Miniflare } from "miniflare";
import { beforeAll, afterAll, it, expect } from "vitest";
import { handleAdminPosts } from "@/server/admin-posts";
import { handlePublicApi } from "@/server/public-api";
import { digest } from "@/server/admin-auth";
let runtime: Miniflare;
let db: D1Database;
const token = "b".repeat(64);
const credential = "test-credential";
const env = () => ({ DB: db, ADMIN_PASSWORD_HASH: credential });
const fixture = {
  title: "Maktab tadbiri",
  category: "Tadbir",
  date: "2026-10-10",
  excerpt: "Tadbir haqida qisqa izoh",
  body: ["Birinchi abzas.", "Ikkinchi abzas."],
  coverImage: null,
  gallery: [],
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
  new Request("https://school.test/api/admin/posts" + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      origin,
      ...(authenticated ? { cookie: "bekobod_admin=" + token } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
const call = (path = "", method = "GET", body?: unknown) =>
  handleAdminPosts(req(path, method, body), env());
beforeAll(async () => {
  runtime = new Miniflare({
    modules: true,
    script: 'export default {fetch(){return new Response("ok")}}',
    compatibilityDate: "2026-08-06",
    d1Databases: { DB: "post-edit-tests" },
  });
  db = await runtime.getD1Database("DB");
  for (const file of [
    "0001_init.sql",
    "0002_publication.sql",
    "0003_admin_auth.sql",
    "0004_post_versions.sql",
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
it("denies unauthenticated reads and writes", async () => {
  for (const method of ["GET", "POST"])
    expect(
      (
        await handleAdminPosts(
          req("", method, method === "POST" ? fixture : undefined, false),
          env(),
        )
      ).status,
    ).toBe(401);
});
it("denies cross-origin writes without inserting data", async () => {
  expect(
    (await handleAdminPosts(req("", "POST", fixture, true, "https://evil.test"), env())).status,
  ).toBe(403);
  expect((await (await call()).json()).data).toEqual([]);
});
it.each([
  { title: "x" },
  { date: "2026-02-30" },
  { category: "Unknown" },
  { body: [] },
  { coverImage: "javascript:alert(1)" },
  { gallery: ["http://example.test/a.jpg"] },
  { isDemo: true },
  { version: 1 },
])("rejects invalid payload %j", async (patch) => {
  expect((await call("", "POST", { ...fixture, ...patch })).status).toBe(400);
});
it("enforces request size and pagination bounds", async () => {
  expect((await call("", "POST", { ...fixture, body: ["x".repeat(33000)] })).status).toBe(413);
  expect((await call("?offset=-1")).status).toBe(400);
  expect((await call("?offset=100001")).status).toBe(400);
});
it("creates a draft, publishes, prevents stale updates, and archives", async () => {
  const created = await call("", "POST", fixture);
  expect(created.status).toBe(201);
  const post = (await created.json()).data;
  expect(post.isDemo).toBe(false);
  expect(post.version).toBe(0);
  const publicPost = () =>
    handlePublicApi(new Request("https://school.test/api/posts/" + post.slug), env());
  expect((await publicPost()).status).toBe(404);
  expect((await call("/" + post.slug)).status).toBe(200);
  const published = await call("/" + post.slug, "PUT", { ...fixture, status: "published" });
  expect(published.status).toBe(200);
  expect((await published.json()).data.version).toBe(1);
  const publicResult = await publicPost();
  expect(publicResult.status).toBe(200);
  expect((await publicResult.json()).data.body).toEqual(fixture.body);
  expect(
    (await call("/" + post.slug, "PUT", { ...fixture, title: "Stale overwrite", status: "draft" }))
      .status,
  ).toBe(409);
  expect((await publicPost()).status).toBe(200);
  expect(
    (await call("/" + post.slug, "PUT", { ...fixture, status: "archived", version: 1 })).status,
  ).toBe(200);
  expect((await publicPost()).status).toBe(404);
  const listing = await (await call()).json();
  expect(listing.data[0].status).toBe("archived");
});
it("rejects missing records and unsupported deletion", async () => {
  expect((await call("/missing")).status).toBe(404);
  expect((await call("/missing", "PUT", fixture)).status).toBe(404);
  expect((await call("", "DELETE")).status).toBe(405);
});
