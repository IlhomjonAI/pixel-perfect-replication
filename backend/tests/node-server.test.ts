// @vitest-environment node
import { spawn, type ChildProcess } from "node:child_process";
import { pbkdf2Sync } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, expect, it } from "vitest";

let child: ChildProcess;
let origin: string;
let dir: string;
const password = "integration-test-only-password";
const salt = Buffer.alloc(16, 11);
beforeAll(async () => {
  dir = mkdtempSync(path.join(tmpdir(), "school-server-"));
  const credential = `pbkdf2:100000:${salt.toString("hex")}:${pbkdf2Sync(password, salt, 100000, 32, "sha256").toString("hex")}`;
  child = spawn(process.execPath, ["--import", "tsx", "backend/server.ts"], {
    env: {
      ...process.env,
      API_PORT: "0",
      PORT: "0",
      PUBLIC_ORIGIN: "https://school.test",
      DATABASE_PATH: path.join(dir, "test.sqlite"),
      ADMIN_PASSWORD_HASH: credential,
      TELEGRAM_ENABLED: "false",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  origin = await new Promise<string>((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code) => reject(new Error(`API exited before becoming ready (${code})`)));
    let output = "";
    child.stdout!.on("data", (chunk) => {
      output += String(chunk);
      const match = /Node.js API: (http:\/\/127\.0\.0\.1:\d+)/.exec(output);
      if (match) resolve(match[1]!);
    });
  });
}, 20000);
afterAll(async () => {
  if (child && child.exitCode === null) {
    const stopped = new Promise<void>((resolve) => child.once("exit", () => resolve()));
    child.kill();
    await stopped;
  }
  if (dir) rmSync(dir, { recursive: true, force: true });
});
it("serves real HTTP, streams JSON, sets session cookies and rejects foreign origins", async () => {
  const health = await fetch(origin + "/api/health");
  expect(health.status).toBe(200);
  expect(await health.json()).toEqual({ data: { status: "ok", database: "ready" } });
  const login = await fetch(origin + "/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://school.test" },
    body: JSON.stringify({ password }),
  });
  expect(login.status).toBe(200);
  const cookie = login.headers.get("set-cookie")!;
  expect(cookie).toContain("HttpOnly");
  expect(cookie).toContain("Secure");
  const session = await fetch(origin + "/api/admin/session", {
    headers: { Cookie: cookie.split(";")[0]! },
  });
  expect(session.status).toBe(200);
  const denied = await fetch(origin + "/api/admin/logout", {
    method: "POST",
    headers: { Origin: "https://foreign.test" },
  });
  expect(denied.status).toBe(403);
  const oversized = await fetch(origin + "/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://school.test" },
    body: JSON.stringify({ password: "x".repeat(3000) }),
  });
  expect(oversized.status).toBe(413);
});
