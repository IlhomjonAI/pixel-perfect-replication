// @vitest-environment node
import { readFile } from "node:fs/promises";
import { Miniflare } from "miniflare";
import { beforeAll, afterAll, it, expect } from "vitest";
import { handleContactSubmit, handleAdminMessages } from "@/server/contact-api";
import { digest } from "@/server/admin-auth";
let runtime: Miniflare;
let db: D1Database;
const token = "e".repeat(64),
  credential = "contact-test-credential";
let ip = 0;
const env = () => ({ DB: db, ADMIN_PASSWORD_HASH: credential });
const fixture = () => ({
  name: "Test murojaatchi",
  contact: "+998 90 123 45 67",
  type: "Savol",
  message: "Maktab haqida savolim bor.",
  consent: true,
  requestId: crypto.randomUUID(),
});
const send = (body: unknown, origin = "https://school.test", address = String(++ip)) =>
  handleContactSubmit(
    new Request("https://school.test/api/contact", {
      method: "POST",
      headers: { origin, "Content-Type": "application/json", "CF-Connecting-IP": address },
      body: JSON.stringify(body),
    }),
    env(),
  );
const admin = (
  path = "",
  method = "GET",
  body?: unknown,
  authenticated = true,
  origin = "https://school.test",
) =>
  handleAdminMessages(
    new Request("https://school.test/api/admin/messages" + path, {
      method,
      headers: {
        origin,
        "Content-Type": "application/json",
        ...(authenticated ? { cookie: "bekobod_admin=" + token } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    }),
    env(),
  );
beforeAll(async () => {
  runtime = new Miniflare({
    modules: true,
    script: 'export default {fetch(){return new Response("ok")}}',
    compatibilityDate: "2026-08-06",
    d1Databases: { DB: "contact-workflow-tests" },
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
it.each([
  { consent: false },
  { contact: "bad" },
  { name: "" },
  { message: "short" },
  { type: "Unknown" },
  { requestId: "not-a-uuid" },
  { name: "x".repeat(151) },
  { status: "resolved" },
])("rejects invalid public input %j", async (patch) => {
  expect((await send({ ...fixture(), ...patch })).status).toBe(400);
});
it("rejects cross-origin requests and public reads", async () => {
  expect((await send(fixture(), "https://evil.test")).status).toBe(403);
  expect(
    (await handleContactSubmit(new Request("https://school.test/api/contact"), env())).status,
  ).toBe(405);
});
it("records consent and privately stores exactly one request across concurrent retries", async () => {
  const input = fixture();
  const responses = await Promise.all([send(input), send(input)]);
  expect(responses.map((v) => v.status)).toEqual([202, 202]);
  for (const r of responses) expect(await r.json()).toEqual({ data: { received: true } });
  const count = await db
    .prepare("SELECT COUNT(*) AS count FROM contact_messages WHERE request_id=?")
    .bind(input.requestId)
    .first<{ count: number }>();
  expect(count?.count).toBe(1);
  const row = await db
    .prepare("SELECT * FROM contact_messages WHERE request_id=?")
    .bind(input.requestId)
    .first<{ consent_at: string; status: string; contact: string; version: number }>();
  expect(row?.consent_at).toMatch(/Z$/);
  expect(row?.contact).toBe(input.contact);
  expect(row?.status).toBe("new");
  expect(row?.version).toBe(0);
});
it("rejects unauthenticated admin reads and writes", async () => {
  expect((await admin("", "GET", undefined, false)).status).toBe(401);
  expect((await admin("/1", "PATCH", { status: "resolved", version: 0 }, false)).status).toBe(401);
});
it("updates status with version checks and filters counts", async () => {
  const listing = await (await admin()).json();
  const message = listing.data[0];
  expect(message.contact).toBeDefined();
  expect(
    (
      await admin(
        "/" + message.id,
        "PATCH",
        { status: "in_progress", version: 0 },
        true,
        "https://evil.test",
      )
    ).status,
  ).toBe(403);
  expect(
    (await admin("/" + message.id, "PATCH", { status: "in_progress", version: 0 })).status,
  ).toBe(200);
  expect((await admin("/" + message.id, "PATCH", { status: "resolved", version: 0 })).status).toBe(
    409,
  );
  const filtered = await (await admin("?status=in_progress")).json();
  expect(filtered.data.map((v: { id: number }) => v.id)).toContain(message.id);
  expect(filtered.counts.in_progress).toBe(1);
  expect((await admin("/" + message.id, "PATCH", { status: "resolved", version: 1 })).status).toBe(
    200,
  );
  expect((await (await admin("?status=in_progress")).json()).data).toEqual([]);
});
it("limits new submissions but permits retries of an existing request", async () => {
  const first = fixture();
  expect((await send(first, undefined, "limited")).status).toBe(202);
  for (let i = 0; i < 2; i++)
    expect((await send(fixture(), undefined, "limited")).status).toBe(202);
  const blocked = await send(fixture(), undefined, "limited");
  expect(blocked.status).toBe(429);
  expect(blocked.headers.get("retry-after")).toBe("900");
  expect((await send(first, undefined, "limited")).status).toBe(202);
});
it("bounds payloads, validates statuses and leaves messages undeleted", async () => {
  expect((await send({ ...fixture(), message: "x".repeat(17000) })).status).toBe(413);
  expect((await admin("?offset=-1")).status).toBe(400);
  expect((await admin("?status=invalid")).status).toBe(400);
  expect((await admin("/9007199254740992")).status).toBe(404);
  expect((await admin("/9999", "PATCH", { status: "resolved", version: 0 })).status).toBe(404);
  expect(
    (await admin("/1", "PATCH", { status: "resolved", version: 0, message: "overwrite" })).status,
  ).toBe(400);
  expect((await admin("/1", "DELETE")).status).toBe(405);
});
