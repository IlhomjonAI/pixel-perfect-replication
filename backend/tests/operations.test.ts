// @vitest-environment node
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { SqliteDatabase } from "@backend/database/sqlite";
import { ContactBot } from "@backend/telegram/bot";
import { sendOverdueReminder } from "@backend/telegram/reminders";
import { handleRecycleBin } from "@backend/api/recycle-bin";
import { digest } from "@backend/api/admin-auth";
import { authorizedProxy, clientIp } from "@backend/lib/proxy";
import { createBackup } from "@backend/lib/backups";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
let db: SqliteDatabase;
const token = "a".repeat(64);
beforeEach(async () => {
  db = new SqliteDatabase();
  db.migrate();
  await db
    .prepare("INSERT INTO admin_sessions VALUES(?,?,?)")
    .bind(await digest(token), await digest("test"), Math.floor(Date.now() / 1000) + 3600)
    .run();
});
afterEach(() => {
  db.close();
  vi.unstubAllGlobals();
});
const insert = () =>
  db
    .prepare(
      "INSERT INTO contact_messages(name,contact,type,message,created_at) VALUES('Test','+998901234567','Savol','Testing','2026-10-14T00:00:00Z') RETURNING id",
    )
    .first<{ id: number }>();
const request = (path = "", method = "GET", origin = "https://school.test", cookie = true) =>
  handleRecycleBin(
    new Request(`https://school.test/api/admin/trash${path}`, {
      method,
      headers: { origin, ...(cookie ? { cookie: `bekobod_admin=${token}` } : {}) },
    }),
    { DB: db, ADMIN_PASSWORD_HASH: "test" },
  );

it("archives and atomically restores a contact without resending its Telegram notification", async () => {
  const item = await insert();
  await db.prepare("DELETE FROM contact_messages WHERE id=?").bind(item!.id).run();
  const listing = await (await request()).json();
  expect(listing.data).toHaveLength(1);
  expect(listing.data[0].payload).toBeUndefined();
  expect(
    (await request(`/${listing.data[0].id}/restore`, "POST", "https://evil.test")).status,
  ).toBe(403);
  expect((await request("", "GET", undefined, false)).status).toBe(401);
  expect((await request(`/${listing.data[0].id}/restore`, "POST")).status).toBe(200);
  expect(
    await db.prepare("SELECT version FROM contact_messages WHERE id=?").bind(item!.id).first(),
  ).toEqual({ version: 1 });
  expect(
    (await db.prepare("SELECT sent_at FROM telegram_outbox").first<{ sent_at: string }>())?.sent_at,
  ).toBeTruthy();
  expect((await (await request()).json()).data).toHaveLength(0);
});
it("keeps the archive if a replacement record conflicts during restore", async () => {
  await db
    .prepare(
      "INSERT INTO posts(slug,title,category,date,excerpt,body) VALUES('same','Original','News','2026-10-16','','[]')",
    )
    .run();
  await db.prepare("DELETE FROM posts WHERE slug='same'").run();
  await db
    .prepare(
      "INSERT INTO posts(slug,title,category,date,excerpt,body) VALUES('same','Replacement','News','2026-10-16','','[]')",
    )
    .run();
  expect((await request("/1/restore", "POST")).status).toBe(409);
  expect((await (await request()).json()).data).toHaveLength(1);
  expect(await db.prepare("SELECT title FROM posts WHERE slug='same'").first()).toEqual({
    title: "Replacement",
  });
});
it("changes bot status only with the current version and authorized private owner", async () => {
  const item = await insert();
  const call = vi.fn(async () => ({}));
  const bot = new ContactBot(db, { call: call as never }, 123);
  const update = (from: number, version: number, status: string) => ({
    update_id: 1,
    callback_query: {
      id: "cb",
      from: { id: from },
      data: `status:${item!.id}:${version}:${status}`,
      message: { message_id: 1, chat: { id: 123, type: "private" } },
    },
  });
  await bot.handleUpdate(update(999, 0, "resolved"));
  expect(await db.prepare("SELECT status FROM contact_messages").first()).toEqual({
    status: "new",
  });
  await bot.handleUpdate(update(123, 0, "in_progress"));
  await bot.handleUpdate(update(123, 0, "resolved"));
  expect(await db.prepare("SELECT status,version FROM contact_messages").first()).toEqual({
    status: "in_progress",
    version: 1,
  });
  await bot.handleUpdate(update(123, 1, "resolved"));
  expect(await db.prepare("SELECT status FROM contact_messages").first()).toEqual({
    status: "resolved",
  });
});
it("sends one daytime overdue digest per day, excluding resolved contacts", async () => {
  await insert();
  const call = vi.fn(async () => ({}));
  const api = { call: call as never };
  await sendOverdueReminder(db, api, 123, new Date("2026-10-16T00:00:00Z"));
  expect(call).not.toHaveBeenCalled();
  await sendOverdueReminder(db, api, 123, new Date("2026-10-16T05:00:00Z"));
  await sendOverdueReminder(db, api, 123, new Date("2026-10-16T07:00:00Z"));
  expect(call).toHaveBeenCalledTimes(1);
  await db.prepare("UPDATE contact_messages SET status='resolved'").run();
  await sendOverdueReminder(db, api, 123, new Date("2026-10-17T05:00:00Z"));
  expect(call).toHaveBeenCalledTimes(1);
});
it("does not trust forwarded addresses without the proxy secret", () => {
  const headers = new Headers({ "x-school-client-ip": "1.2.3.4", "x-school-proxy-secret": "fake" });
  expect(authorizedProxy(headers, "secret")).toBe(false);
  expect(clientIp(headers, "peer", "secret")).toBe("peer");
  headers.set("x-school-proxy-secret", "secret");
  expect(authorizedProxy(headers, "secret")).toBe(true);
  expect(clientIp(headers, "peer", "secret")).toBe("1.2.3.4");
  expect(clientIp(headers, "peer", undefined)).toBe("peer");
});
it("creates a consistent, readable SQLite backup with a manifest", async () => {
  await insert();
  const dir = await mkdtemp(path.join(tmpdir(), "school-backup-"));
  try {
    const output = await createBackup(db, dir, { NODE_ENV: "test" });
    const manifest = JSON.parse(await readFile(path.join(output, "manifest.json"), "utf8"));
    expect(manifest.files[0].sha256).toMatch(/^[a-f0-9]{64}$/);
    const restored = new DatabaseSync(path.join(output, "school.sqlite"), { readOnly: true });
    try {
      expect(restored.prepare("SELECT count(*) AS n FROM contact_messages").get()?.["n"]).toBe(1);
    } finally {
      restored.close();
    }
    expect(await readFile(path.join(output, "complete"), "utf8")).toBe("1");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
