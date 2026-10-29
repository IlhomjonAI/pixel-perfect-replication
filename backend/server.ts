import "./config";
import { createServer } from "node:http";
import { Readable } from "node:stream";
import { handle } from "./api/handler";
import { connectDatabase } from "./database/connect";
import { seedSchoolStaff } from "./database/seed-staff";
import { startTelegramWorker } from "./telegram/worker";
import { authorizedProxy, clientIp } from "./lib/proxy";

import { deploymentErrors } from "./lib/deployment";

if (process.env["RENDER"]) {
  const errors = deploymentErrors("backend", process.env);
  if (errors.length) throw new Error(errors.join("\n"));
}

const db = await connectDatabase();
try {
  await db.migrate();
  await seedSchoolStaff(db);
} catch (error) {
  await db.close();
  throw error;
}
const env: AppBindings = { DB: db };
for (const key of [
  "ADMIN_PASSWORD_HASH",
  "SUPABASE_URL",
  "SUPABASE_SECRET_KEY",
  "SUPABASE_STORAGE_BUCKET",
] as const) {
  if (process.env[key]) env[key] = process.env[key];
}
const publicOrigin = new URL(process.env["PUBLIC_ORIGIN"] ?? "http://localhost:3000").origin;
if (process.env["RENDER"] && (!process.env["API_PROXY_SECRET"] || publicOrigin.startsWith("http:")))
  throw new Error("Render requires HTTPS PUBLIC_ORIGIN and API_PROXY_SECRET.");
const server = createServer(async (incoming, outgoing) => {
  try {
    const url = new URL(incoming.url ?? "/", publicOrigin);
    if (url.origin !== publicOrigin) {
      outgoing.writeHead(400).end();
      return;
    }
    if (!url.pathname.startsWith("/api/")) {
      outgoing.writeHead(404).end();
      return;
    }
    const headers = new Headers();
    for (const [name, value] of Object.entries(incoming.headers)) {
      if (value !== undefined) headers.set(name, Array.isArray(value) ? value.join(", ") : value);
    }
    if (
      url.pathname !== "/api/health" &&
      !authorizedProxy(headers, process.env["API_PROXY_SECRET"])
    ) {
      outgoing.writeHead(403).end();
      return;
    }
    headers.set(
      "cf-connecting-ip",
      clientIp(headers, incoming.socket.remoteAddress ?? "local", process.env["API_PROXY_SECRET"]),
    );
    headers.delete("x-school-proxy-secret");
    const method = incoming.method ?? "GET";
    const init: RequestInit & { duplex?: "half" } = { method, headers };
    if (method !== "GET" && method !== "HEAD") {
      init.body = Readable.toWeb(incoming) as ReadableStream<Uint8Array>;
      init.duplex = "half";
    }
    const response = await handle({ request: new Request(url, init), env });
    const responseHeaders: Record<string, string | string[]> = {};
    response.headers.forEach((value, key) => {
      if (key !== "set-cookie") responseHeaders[key] = value;
    });
    const cookies = response.headers.getSetCookie();
    if (cookies.length) responseHeaders["set-cookie"] = cookies;
    outgoing.writeHead(response.status, responseHeaders);
    if (response.body)
      Readable.fromWeb(response.body as import("node:stream/web").ReadableStream).pipe(outgoing);
    else outgoing.end();
  } catch (error) {
    console.error("API request failed", error);
    if (!outgoing.headersSent) outgoing.writeHead(500, { "Content-Type": "application/json" });
    outgoing.end(JSON.stringify({ error: { message: "Server xatosi." } }));
  }
});
const port = Number(process.env["PORT"] ?? process.env["API_PORT"] ?? 4000);
let stopTelegram = async () => {};
let stopBackups = async () => {};
if (db.dialect === "sqlite") {
  const { startBackups } = await import("./lib/backups");
  const { SqliteDatabase } = await import("./database/sqlite");
  if (db instanceof SqliteDatabase) stopBackups = startBackups(db);
}
server.listen(
  port,
  process.env["API_HOST"] ?? (process.env["RENDER"] ? "0.0.0.0" : "127.0.0.1"),
  () => {
    console.log(
      `Node.js API: http://127.0.0.1:${(server.address() as import("node:net").AddressInfo).port}`,
    );
    stopTelegram = startTelegramWorker(db);
  },
);
let stopping = false;
for (const signal of ["SIGINT", "SIGTERM"] as const)
  process.on(signal, () => {
    if (stopping) return;
    stopping = true;
    const deadline = setTimeout(() => process.exit(1), 20000);
    deadline.unref();
    const drained = new Promise<void>((resolve) => server.close(() => resolve()));
    void Promise.all([drained, stopTelegram(), stopBackups()]).finally(async () => {
      clearTimeout(deadline);
      await db.close();
      process.exit(0);
    });
  });
