// @vitest-environment node
import { readFile } from "node:fs/promises";
import { SqliteDatabase } from "@backend/database/sqlite";
import { beforeAll, afterAll, it, expect } from "vitest";
import { handleAdminAchievements } from "@backend/api/admin-achievements";
import { getAchievementPage, getAchievementOptions } from "@backend/database/achievement-page";
import { digest } from "@backend/api/admin-auth";
let runtime: SqliteDatabase;
let db: Database;
const token = "c".repeat(64);
const credential = "achievement-test-credential";
const env = () => ({ DB: db, ADMIN_PASSWORD_HASH: credential });
const fixture = {
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
  new Request("https://school.test/api/admin/achievements" + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      origin,
      ...(authenticated ? { cookie: "bekobod_admin=" + token } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
const call = (path = "", method = "GET", body?: unknown) =>
  handleAdminAchievements(req(path, method, body), env());
const page = (query: Record<string, unknown> = {}) =>
  getAchievementPage(db, { limit: 12, offset: 0, ...query });
beforeAll(async () => {
  runtime = new SqliteDatabase();
  db = runtime;
  for (const file of [
    "0001_init.sql",
    "0002_publication.sql",
    "0003_admin_auth.sql",
    "0004_post_versions.sql",
    "0005_achievement_versions.sql",
  ]) {
    const sql = await readFile(new URL("../migrations/" + file, import.meta.url), "utf8");
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
  await runtime?.close();
});
it("denies unauthenticated access and cross-origin writes", async () => {
  for (const method of ["GET", "POST"])
    expect(
      (
        await handleAdminAchievements(
          req("", method, method === "POST" ? fixture : undefined, false),
          env(),
        )
      ).status,
    ).toBe(401);
  expect(
    (await handleAdminAchievements(req("", "POST", fixture, true, "https://evil.test"), env()))
      .status,
  ).toBe(403);
  expect((await page()).items).toEqual([]);
});
it.each([
  { studentName: "" },
  { achievementDate: "2026-02-30" },
  { type: "Unknown" },
  { stage: "Unknown" },
  { type: "IELTS", stage: "Viloyat" },
  { type: "STEM", stage: "Sertifikat" },
  { certificateImage: "javascript:alert(1)" },
  { isDemo: true },
  { version: 1 },
])("rejects invalid achievement %j", async (patch) => {
  expect((await call("", "POST", { ...fixture, ...patch })).status).toBe(400);
});
it("publishes, prevents stale updates, and archives without deletion", async () => {
  const created = await call("", "POST", fixture);
  expect(created.status).toBe(201);
  const item = (await created.json()).data;
  expect(item.isDemo).toBe(false);
  expect((await page()).items).toEqual([]);
  expect((await call("/" + item.id)).status).toBe(200);
  const publish = await call("/" + item.id, "PUT", { ...fixture, status: "published" });
  expect(publish.status).toBe(200);
  expect((await publish.json()).data.version).toBe(1);
  expect((await page()).items[0]?.studentName).toBe(fixture.studentName);
  expect((await call("/" + item.id, "PUT", { ...fixture, result: "Old edit" })).status).toBe(409);
  expect(
    (await call("/" + item.id, "PUT", { ...fixture, status: "archived", version: 1 })).status,
  ).toBe(200);
  expect((await page()).items).toEqual([]);
  expect((await call("/" + item.id)).status).toBe(200);
});
it("accepts IELTS as a certificate with optional teacher and image", async () => {
  expect(
    (
      await call("", "POST", {
        ...fixture,
        type: "IELTS",
        stage: "Sertifikat",
        result: "7.5",
        teacherName: null,
        certificateImage: "https://example.test/certificate.png",
      })
    ).status,
  ).toBe(201);
});
it("filters a 300-record dataset across all pages and excludes unpublished metadata", async () => {
  for (let i = 0; i < 300; i++)
    await db
      .prepare(
        "INSERT INTO achievements (id,student_name,class_at_achievement,type,title,subject,stage,result,achievement_date,status) VALUES (?,'Fixture','9-sinf','STEM','Fixture','Matematika','Tuman','1-o‘rin','2025-10-10','published')",
      )
      .bind("fixture-" + String(i).padStart(3, "0"))
      .run();
  await db
    .prepare(
      "INSERT INTO achievements (id,student_name,class_at_achievement,type,title,subject,stage,result,achievement_date,status) VALUES ('target','Unique target','9-sinf','SAT','SAT','Ingliz tili','Sertifikat','1500','2024-10-10','published'),('secret','Draft','9-sinf','STEM','Secret','Yashirin fan','Tuman','1','2023-10-10','draft')",
    )
    .run();
  const first = await page();
  expect(first.items).toHaveLength(12);
  expect(first.hasMore).toBe(true);
  const second = await page({ offset: 12 });
  expect(second.items[0]?.id).not.toBe(first.items[0]?.id);
  const filtered = await page({
    year: "2024",
    subject: "Ingliz tili",
    type: "SAT",
    stage: "Sertifikat",
  });
  expect(filtered.items.map((v) => v.id)).toEqual(["target"]);
  expect(filtered.hasMore).toBe(false);
  expect((await page({ subject: "' OR 1=1 --" })).items).toEqual([]);
  const options = await getAchievementOptions(db);
  expect(options.year).toEqual(["2025", "2024"]);
  expect(options.subject).not.toContain("Yashirin fan");
  const admin = await (await call("?offset=300")).json();
  expect(admin.data.length).toBeGreaterThan(0);
}, 30_000);
it("enforces body limits, offsets, missing rows and disabled deletes", async () => {
  expect((await call("", "POST", { ...fixture, title: "x".repeat(33000) })).status).toBe(413);
  expect((await call("?offset=-1")).status).toBe(400);
  expect((await call("/missing", "PUT", fixture)).status).toBe(404);
  expect((await call("", "DELETE")).status).toBe(405);
});
