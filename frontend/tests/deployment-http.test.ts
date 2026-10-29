// @vitest-environment node
import { spawn, type ChildProcess } from "node:child_process";
import { pbkdf2Sync } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, expect, it, vi } from "vitest";
import { GET, POST, DELETE } from "../app/api/[...path]/route";

let child: ChildProcess | undefined;
let directory: string;
const secret = "test-proxy-secret-".repeat(3);
const password = "integration-test-password";
const salt = Buffer.alloc(16, 13);
const credential = `pbkdf2:100000:${salt.toString("hex")}:${pbkdf2Sync(password, salt, 100000, 32, "sha256").toString("hex")}`;

async function start() {
  child = spawn(process.execPath, ["--import", "tsx", "backend/server.ts"], {
    env: {
      ...process.env,
      DATABASE_URL: "",
      NODE_ENV: "test",
      RENDER: "",
      PORT: "0",
      API_HOST: "127.0.0.1",
      PUBLIC_ORIGIN: "https://school.test",
      DATABASE_PATH: path.join(directory, "school.sqlite"),
      API_PROXY_SECRET: secret,
      ADMIN_PASSWORD_HASH: credential,
      TELEGRAM_ENABLED: "false",
      BACKUP_ENABLED: "false",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  const origin = await new Promise<string>((resolve, reject) => {
    child!.once("error", reject);
    child!.once("exit", () => reject(new Error("Test API did not start")));
    let output = "";
    child!.stdout!.on("data", (data) => {
      output += String(data);
      const found = /Node.js API: (http:\/\/127\.0\.0\.1:\d+)/.exec(output);
      if (found) resolve(found[1]!);
    });
  });
  vi.stubEnv("VERCEL", "");
  vi.stubEnv("API_PROXY_SECRET", secret);
  vi.stubEnv("API_INTERNAL_URL", origin);
  return origin;
}
async function stop() {
  if (!child || child.exitCode !== null) return;
  const closed = new Promise<void>((resolve) => child!.once("exit", () => resolve()));
  child.kill();
  await closed;
}
afterAll(async () => {
  await stop();
  vi.unstubAllEnvs();
  if (directory) await rm(directory, { recursive: true, force: true });
});

it("passes login, contact, publish, recycle, restart and logout through the frontend proxy", async () => {
  directory = await mkdtemp(path.join(tmpdir(), "school-deployment-"));
  const origin = await start();
  expect((await fetch(origin + "/api/posts")).status).toBe(403);
  const call = (
    route: string,
    method = "GET",
    body?: unknown,
    cookie = "",
    source = "https://school.test",
  ) => {
    const request = new Request("https://school.test/api/" + route, {
      method,
      headers: { origin: source, cookie, "content-type": "application/json" },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    return (method === "GET" ? GET : method === "DELETE" ? DELETE : POST)(request);
  };
  expect((await call("admin/session")).status).toBe(401);
  const login = await call("admin/login", "POST", { password });
  expect(login.status).toBe(200);
  const cookie = login.headers.get("set-cookie")!.split(";")[0]!;
  expect(login.headers.get("set-cookie")).toContain("Secure");
  expect((await call("admin/session", "GET", undefined, cookie)).status).toBe(200);
  const post = {
    title: "Deploy sinovi",
    category: "Yangilik",
    date: "2026-10-24",
    excerpt: "Sinov yangiligi",
    body: ["Bu faqat vaqtinchalik test bazasidagi yangilik."],
    coverImage: null,
    gallery: [],
    status: "published",
    version: 0,
  };
  expect((await call("admin/posts", "POST", post, cookie, "https://foreign.test")).status).toBe(
    403,
  );
  const created = await call("admin/posts", "POST", post, cookie);
  expect(created.status).toBe(201);
  const record = (await created.json()).data;
  expect((await (await call("posts")).json()).data).toHaveLength(1);
  expect(
    (
      await call(
        `admin/posts/${record.slug}?version=${record.version}`,
        "DELETE",
        undefined,
        cookie,
      )
    ).status,
  ).toBe(200);
  expect((await (await call("posts")).json()).data).toHaveLength(0);
  const archive = (await (await call("admin/trash", "GET", undefined, cookie)).json()).data[0];
  expect((await call(`admin/trash/${archive.id}/restore`, "POST", undefined, cookie)).status).toBe(
    200,
  );
  const contact = {
    name: "Test Foydalanuvchi",
    contact: "+998901234567",
    telegramUsername: "@test_user",
    email: "",
    type: "Savol",
    message: "Bu avtomatik integratsiya testi.",
    consent: true,
    requestId: crypto.randomUUID(),
  };
  expect((await call("contact", "POST", contact)).status).toBe(202);
  expect((await call("contact", "POST", contact)).status).toBe(202);
  expect((await (await call("admin/messages", "GET", undefined, cookie)).json()).data).toHaveLength(
    1,
  );
  await stop();
  await start();
  expect((await (await call("posts")).json()).data).toHaveLength(1);
  expect((await (await call("admin/messages", "GET", undefined, cookie)).json()).data).toHaveLength(
    1,
  );
  expect((await call("admin/logout", "POST", undefined, cookie)).status).toBe(200);
  expect((await call("admin/session", "GET", undefined, cookie)).status).toBe(401);
}, 30000);
