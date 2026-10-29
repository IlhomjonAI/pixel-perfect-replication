// @vitest-environment node
import { readFile } from "node:fs/promises";
import { SqliteDatabase } from "@backend/database/sqlite";
import { beforeAll, afterAll, it, expect } from "vitest";
import { handleAdminTeachers } from "@backend/api/admin-teachers";
import { getTeacherBySlug, listTeachers } from "@backend/database/queries";
import { digest } from "@backend/api/admin-auth";
let runtime: SqliteDatabase;
let db: Database;
const token = "d".repeat(64),
  credential = "teacher-test-credential";
const env = () => ({ DB: db, ADMIN_PASSWORD_HASH: credential });
const fixture = {
  name: "Test ustoz",
  photo: null,
  subject: "Informatika",
  qualification: "Oliy toifa",
  education: "Universitet bakalavri",
  experience: "10 yil",
  biography: "Test ustoz haqida batafsil tarjimai hol.",
  certificates: ["C1", "Milliy sertifikat"],
  certificateImages: ["https://example.test/certificate.png"],
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
  new Request("https://school.test/api/admin/teachers" + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      origin,
      ...(authenticated ? { cookie: "bekobod_admin=" + token } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
const call = (path = "", method = "GET", body?: unknown) =>
  handleAdminTeachers(req(path, method, body), env());
beforeAll(async () => {
  runtime = new SqliteDatabase();
  db = runtime;
  for (const file of [
    "0001_init.sql",
    "0002_publication.sql",
    "0003_admin_auth.sql",
    "0004_post_versions.sql",
    "0005_achievement_versions.sql",
    "0006_teacher_versions.sql",
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
it("denies unauthenticated requests and cross-origin writes", async () => {
  for (const method of ["GET", "POST"])
    expect(
      (
        await handleAdminTeachers(
          req("", method, method === "POST" ? fixture : undefined, false),
          env(),
        )
      ).status,
    ).toBe(401);
  expect(
    (await handleAdminTeachers(req("", "POST", fixture, true, "https://evil.test"), env())).status,
  ).toBe(403);
  expect(await listTeachers(db)).toEqual([]);
});
it.each([
  { name: "" },
  { subject: "" },
  { biography: "Short" },
  { photo: "javascript:alert(1)" },
  { certificateImages: ["http://example.test/a.jpg"] },
  { certificateImages: Array(21).fill("https://example.test/a.jpg") },
  { certificates: [""] },
  { status: "unknown" },
  { isDemo: true },
  { version: 1 },
])("rejects invalid teacher %j", async (patch) => {
  expect((await call("", "POST", { ...fixture, ...patch })).status).toBe(400);
});
it("publishes complete profiles, prevents stale edits and archives", async () => {
  const created = await call("", "POST", fixture);
  expect(created.status).toBe(201);
  const teacher = (await created.json()).data;
  expect(teacher.isDemo).toBe(false);
  expect(await getTeacherBySlug(db, teacher.slug)).toBeNull();
  expect((await call("/" + teacher.slug)).status).toBe(200);
  const publish = await call("/" + teacher.slug, "PUT", { ...fixture, status: "published" });
  expect(publish.status).toBe(200);
  expect((await publish.json()).data.version).toBe(1);
  const publicProfile = await getTeacherBySlug(db, teacher.slug);
  expect(publicProfile?.certificates).toEqual(fixture.certificates);
  expect(publicProfile?.certificateImages).toEqual(fixture.certificateImages);
  expect(
    (await call("/" + teacher.slug, "PUT", { ...fixture, name: "Stale overwrite" })).status,
  ).toBe(409);
  expect((await getTeacherBySlug(db, teacher.slug))?.name).toBe(fixture.name);
  expect(
    (await call("/" + teacher.slug, "PUT", { ...fixture, status: "archived", version: 1 })).status,
  ).toBe(200);
  expect(await getTeacherBySlug(db, teacher.slug)).toBeNull();
  expect((await call("/" + teacher.slug)).status).toBe(200);
});
it("accepts profiles without photos or certificates", async () => {
  expect(
    (await call("", "POST", { ...fixture, certificates: [], certificateImages: [] })).status,
  ).toBe(201);
});
it("pages a 50-teacher dataset in stable order", async () => {
  for (let i = 0; i < 50; i++)
    await db
      .prepare(
        "INSERT INTO teachers (slug,name,subject,qualification,education,experience,biography,status) VALUES (?,?,'Matematika','Oliy','Universitet','10 yil','Fixture profile','published')",
      )
      .bind("fixture-" + i, "Fixture " + String(i).padStart(2, "0"))
      .run();
  expect(await listTeachers(db, 50)).toHaveLength(50);
  expect((await listTeachers(db, 20, 20))[0]?.name).toBe("Fixture 20");
  const admin = await (await call("?offset=20")).json();
  expect(admin.data).toHaveLength(20);
  expect(admin.pagination.hasMore).toBe(true);
}, 30_000);
it("enforces request limits, offsets, missing records and blocked deletion", async () => {
  expect((await call("", "POST", { ...fixture, biography: "x".repeat(33000) })).status).toBe(413);
  expect((await call("?offset=-1")).status).toBe(400);
  expect((await call("/missing", "PUT", fixture)).status).toBe(404);
  expect((await call("", "DELETE")).status).toBe(405);
});
