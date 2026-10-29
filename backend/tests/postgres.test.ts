// @vitest-environment node
import { PGlite } from "@electric-sql/pglite";
import { Pool } from "pg";
import { pbkdf2Sync } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { beforeAll, afterAll, expect, it } from "vitest";
import { PostgresDatabase, postgresConfig, postgresQuery } from "../database/postgres";
import { seedSchoolStaff } from "../database/seed-staff";
import { SqliteDatabase } from "../database/sqlite";
import { importSqlite } from "../database/import-sqlite";
import { handle } from "../api/handler";
import { acquireWorkerLease } from "../telegram/worker";
import { sendOverdueReminder } from "../telegram/reminders";

let engine: PGlite;
let db: PostgresDatabase;
let cookie = "";
const password = "postgres-integration-password";
const salt = Buffer.alloc(16, 9);
const hash = `pbkdf2:100000:${salt.toString("hex")}:${pbkdf2Sync(password, salt, 100000, 32, "sha256").toString("hex")}`;
const call = (route: string, method = "GET", body?: unknown) =>
  handle({
    request: new Request(`https://school.test/api/${route}`, {
      method,
      headers: { origin: "https://school.test", "content-type": "application/json", cookie },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    }),
    env: { DB: db, ADMIN_PASSWORD_HASH: hash },
  });

beforeAll(async () => {
  const testUrl = process.env["TEST_DATABASE_URL"];
  if (testUrl) {
    const parsed = new URL(testUrl);
    if (parsed.hostname !== "127.0.0.1" || parsed.pathname !== "/school_test")
      throw new Error("PostgreSQL tests require a disposable localhost school_test database");
    db = new PostgresDatabase(
      new Pool(postgresConfig({ DATABASE_URL: testUrl, DATABASE_SSL: "false" })),
    );
    await db.migrate();
    return;
  }
  // PGlite runs the real PostgreSQL engine locally, including PL/pgSQL triggers.
  engine = new PGlite();
  const connection = {
    async query(sql: string, values?: unknown[]) {
      const result = values ? await engine.query(sql, values) : (await engine.exec(sql)).at(-1)!;
      return { rows: result.rows, rowCount: result.affectedRows };
    },
    release() {},
    on() {},
    async end() {
      await engine.close();
    },
    async connect() {
      return connection;
    },
  };
  db = new PostgresDatabase(connection as unknown as Pool);
  await db.migrate();
  await engine.exec("SET search_path TO school_app,pg_catalog; SET timezone TO 'UTC'");
}, 30000);
afterAll(async () => {
  await db?.close();
});

it("keeps placeholder literals intact and verifies TLS for external databases", () => {
  expect(postgresQuery("SELECT '?' AS text, ? AS value -- ?\n, $$?$$ AS literal")).toBe(
    "SELECT '?' AS text, $1 AS value -- ?\n, $$?$$ AS literal",
  );
  const config = postgresConfig({
    DATABASE_URL: "postgresql://user:secret@db.example.test/postgres?sslmode=require",
  });
  expect(config.ssl).toEqual({ rejectUnauthorized: true });
  expect(config.connectionString).not.toContain("sslmode");
  expect(() => postgresConfig({ DATABASE_URL: "https://example.test" })).toThrow();
});

it("imports SQLite content atomically into empty PostgreSQL and refuses overwrites", async () => {
  const directory = mkdtempSync(path.join(tmpdir(), "school-pg-import-"));
  const filename = path.join(directory, "source.sqlite");
  const source = new SqliteDatabase(filename);
  try {
    source.migrate();
    await source
      .prepare(
        "INSERT INTO contact_messages(id,name,contact,type,message) VALUES(41,'Ali','+998901234567','Savol','Imported contact')",
      )
      .run();
    source.close();
    expect((await importSqlite(filename, db))["contact_messages"]).toBe(1);
    expect(await db.prepare("SELECT id FROM contact_messages").first()).toEqual({ id: 41 });
    expect(
      await db.prepare("SELECT id FROM telegram_outbox WHERE sent_at IS NULL").first(),
    ).toBeNull();
    await expect(importSqlite(filename, db)).rejects.toThrow("bo‘sh emas");
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

it("migrates twice, seeds once and supports public content and admin login", async () => {
  await db.migrate();
  await seedSchoolStaff(db);
  await seedSchoolStaff(db);
  expect(
    (await db.prepare("SELECT COUNT(*) AS count FROM teachers").first<{ count: number }>())?.count,
  ).toBe(25);
  expect((await call("health")).status).toBe(200);
  expect((await call("teachers")).status).toBe(200);
  const response = await call("admin/login", "POST", { password });
  expect(response.status).toBe(200);
  cookie = response.headers.get("set-cookie")!.split(";")[0]!;
  expect((await call("admin/session")).status).toBe(200);
});

it("supports optimistic edits, recycle triggers, conflict rollback and restore", async () => {
  const teacher = (await (await call("admin/teachers")).json()).data[0];
  const slug = teacher.slug;
  expect((await call(`admin/teachers/${slug}?version=99`, "DELETE")).status).toBe(409);
  expect((await call(`admin/teachers/${slug}?version=0`, "DELETE")).status).toBe(200);
  const archived = (await (await call("admin/trash")).json()).data[0];
  expect((await call(`admin/trash/${archived.id}/restore`, "POST")).status).toBe(200);
  expect(await db.prepare("SELECT version FROM teachers WHERE slug=?").bind(slug).first()).toEqual({
    version: 1,
  });
});

it("saves idempotent contacts with atomic outbox, counters, worker lease and reminders", async () => {
  const body = {
    name: "Ali Valiyev",
    contact: "+998901234568",
    telegramUsername: "@ali_valiyev",
    email: "",
    type: "Savol",
    message: "Maktab haqida savolim bor.",
    consent: true,
    requestId: crypto.randomUUID(),
  };
  expect((await call("contact", "POST", body)).status).toBe(202);
  expect((await call("contact", "POST", body)).status).toBe(202);
  const pending = await db
    .prepare("SELECT contact_id FROM telegram_outbox WHERE sent_at IS NULL")
    .all();
  expect(pending.results).toHaveLength(1);
  expect(await acquireWorkerLease(db, "first", 1000)).toBe(true);
  expect(await acquireWorkerLease(db, "second", 1001)).toBe(false);
  const sent: string[] = [];
  await sendOverdueReminder(
    db,
    {
      async call(method) {
        sent.push(method);
        return {} as never;
      },
    },
    123,
    new Date("2027-01-01T05:00:00Z"),
  );
  expect(sent).toEqual(["sendMessage"]);
  const contact = await db
    .prepare("SELECT id FROM contact_messages WHERE request_id=?")
    .bind(body.requestId)
    .first<{ id: number }>();
  expect(contact!.id).toBeGreaterThan(41);
  expect((await call(`admin/messages/${contact!.id}?version=0`, "DELETE")).status).toBe(200);
  const archived = (await (await call("admin/trash")).json()).data[0];
  expect((await call(`admin/trash/${archived.id}/restore`, "POST")).status).toBe(200);
  expect(
    await db
      .prepare("SELECT contact_id FROM telegram_outbox WHERE contact_id=? AND sent_at IS NULL")
      .bind(contact!.id)
      .first(),
  ).toBeNull();
});

it.each([
  {
    resource: "posts",
    input: {
      title: "Maktab tadbiri",
      category: "Tadbir",
      date: "2026-10-10",
      excerpt: "Tadbir haqida qisqa izoh",
      body: ["Birinchi abzas."],
      coverImage: null,
      gallery: [],
    },
  },
  {
    resource: "achievements",
    input: {
      studentName: "Test o‘quvchi",
      classAtAchievement: "9-A sinf",
      type: "Fan olimpiadasi",
      title: "Informatika olimpiadasi",
      subject: "Informatika",
      stage: "Viloyat",
      result: "1-o‘rin",
      achievementDate: "2026-10-10",
      teacherName: "Test ustoz",
      certificateImage: null,
    },
  },
  {
    resource: "school-life",
    input: {
      title: "STEM haftaligi",
      description: "Maktabda yangi STEM loyihalari namoyish etildi.",
      category: "Tadbir",
      eventDate: "2026-10-10",
      image: null,
      gallery: [],
    },
  },
])(
  "creates, edits, filters, archives and restores $resource in PostgreSQL",
  async ({ resource, input }) => {
    const payload = { ...input, status: "published", version: 0 };
    const created = await call(`admin/${resource}`, "POST", payload);
    expect(created.status).toBe(201);
    const record = (await created.json()).data;
    const key = record.slug ?? record.id;
    expect((await call(resource)).status).toBe(200);
    expect((await call(`admin/${resource}/${key}`, "PUT", payload)).status).toBe(200);
    expect((await call(`admin/${resource}/${key}`, "PUT", payload)).status).toBe(409);
    expect((await call(`admin/${resource}/${key}?version=1`, "DELETE")).status).toBe(200);
    const archive = (await (await call("admin/trash")).json()).data[0];
    expect((await call(`admin/trash/${archive.id}/restore`, "POST")).status).toBe(200);
    expect((await (await call(`admin/${resource}/${key}`)).json()).data.version).toBe(2);
    if (resource === "achievements") {
      expect((await call("achievement-page?year=2026&subject=Informatika")).status).toBe(200);
      expect((await call("achievement-filters")).status).toBe(200);
    }
  },
);

it("rolls back a failed multi-statement transaction without partial writes", async () => {
  await expect(
    db.transaction(async (tx) => {
      await tx
        .prepare("INSERT INTO telegram_state(key,value) VALUES('rollback-test','temporary')")
        .run();
      throw new Error("intentional rollback");
    }),
  ).rejects.toThrow("intentional rollback");
  expect(
    await db.prepare("SELECT value FROM telegram_state WHERE key='rollback-test'").first(),
  ).toBeNull();
});
