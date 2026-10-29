// @vitest-environment node
import { readFile } from "node:fs/promises";
import { pbkdf2Sync } from "node:crypto";
import { SqliteDatabase } from "@backend/database/sqlite";
import { beforeAll, afterAll, it, expect } from "vitest";
import { handleAdminAuth, digest } from "@backend/api/admin-auth";
let runtime: SqliteDatabase;
let db: Database;
const password = "test-only-random-password-123456";
const salt = Buffer.alloc(16, 7);
const credential = `pbkdf2:100000:${salt.toString("hex")}:${pbkdf2Sync(password, salt, 100000, 32, "sha256").toString("hex")}`;
const env = () => ({ DB: db, ADMIN_PASSWORD_HASH: credential });
let ip = 0;
const req = (
  path: string,
  method = "GET",
  body?: unknown,
  cookie?: string,
  origin = "https://school.test",
) =>
  new Request("https://school.test/api/admin/" + path, {
    method,
    headers: {
      origin,
      "Content-Type": "application/json",
      "CF-Connecting-IP": String(++ip),
      ...(cookie ? { cookie } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
beforeAll(async () => {
  runtime = new SqliteDatabase();
  db = runtime;
  const sql = await readFile(new URL("../migrations/0003_admin_auth.sql", import.meta.url), "utf8");
  for (const s of sql
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean))
    await db.prepare(s).run();
});
afterAll(async () => {
  await runtime?.close();
});
it("fails closed without credentials or an authenticated session", async () => {
  expect((await handleAdminAuth(req("session"), {})).status).toBe(503);
  expect((await handleAdminAuth(req("session"), env())).status).toBe(401);
});
it("rejects cross-origin login and logout", async () => {
  for (const path of ["login", "logout"])
    expect(
      (
        await handleAdminAuth(
          req(path, "POST", { password }, undefined, "https://evil.test"),
          env(),
        )
      ).status,
    ).toBe(403);
});
it("rejects unsupported methods and unknown paths", async () => {
  expect((await handleAdminAuth(req("login"), env())).status).toBe(405);
  expect((await handleAdminAuth(req("messages"), env())).status).toBe(404);
});
it("rejects a wrong password and oversized input", async () => {
  expect((await handleAdminAuth(req("login", "POST", { password: "wrong" }), env())).status).toBe(
    401,
  );
  expect(
    (await handleAdminAuth(req("login", "POST", { password: "x".repeat(3000) }), env())).status,
  ).toBe(413);
});
it("creates a hashed session, authenticates and revokes on logout", async () => {
  const login = await handleAdminAuth(req("login", "POST", { password }), env());
  expect(login.status).toBe(200);
  const set = login.headers.get("set-cookie")!;
  expect(set).toContain("HttpOnly");
  expect(set).toContain("Secure");
  expect(set).toContain("SameSite=Strict");
  expect(set).toContain("Path=/api/admin");
  const cookie = set.split(";")[0]!;
  const raw = cookie.split("=")[1]!;
  const row = await db
    .prepare("SELECT token_hash FROM admin_sessions WHERE token_hash=?")
    .bind(await digest(raw))
    .first<{ token_hash: string }>();
  expect(row?.token_hash).not.toBe(raw);
  expect((await handleAdminAuth(req("session", "GET", undefined, cookie), env())).status).toBe(200);
  expect(
    (
      await handleAdminAuth(req("session", "GET", undefined, cookie), {
        DB: db,
        ADMIN_PASSWORD_HASH: credential + "changed",
      })
    ).status,
  ).toBe(401);
  expect((await handleAdminAuth(req("logout", "POST", undefined, cookie), env())).status).toBe(200);
  expect((await handleAdminAuth(req("session", "GET", undefined, cookie), env())).status).toBe(401);
});
it("rejects expired sessions", async () => {
  const raw = "a".repeat(64);
  await db
    .prepare("INSERT INTO admin_sessions VALUES (?,?,?)")
    .bind(await digest(raw), await digest(credential), 1)
    .run();
  expect(
    (await handleAdminAuth(req("session", "GET", undefined, "bekobod_admin=" + raw), env())).status,
  ).toBe(401);
});
it("atomically limits repeated attempts from one IP", async () => {
  const call = () =>
    handleAdminAuth(
      new Request("https://school.test/api/admin/login", {
        method: "POST",
        headers: {
          origin: "https://school.test",
          "Content-Type": "application/json",
          "CF-Connecting-IP": "limited",
        },
        body: JSON.stringify({ password: "wrong" }),
      }),
      env(),
    );
  for (let i = 0; i < 5; i++) expect((await call()).status).toBe(401);
  const blocked = await call();
  expect(blocked.status).toBe(429);
  expect(blocked.headers.get("retry-after")).toBe("900");
});
