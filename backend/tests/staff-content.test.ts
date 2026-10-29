// @vitest-environment node
import { existsSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, expect, it } from "vitest";
import { SqliteDatabase } from "../database/sqlite";
import { seedSchoolStaff } from "../database/seed-staff";
import { SCHOOL_LEADERSHIP, SCHOOL_TEACHERS } from "@school/contracts/staff";
import { teacherInput } from "@school/contracts/teacher";
import { imageUrl } from "@school/contracts/post";
import { listTeachers } from "../database/queries";

let db: SqliteDatabase;
beforeEach(() => {
  db = new SqliteDatabase();
  db.migrate();
});
afterEach(() => db.close());

it("provides 29 teacher profiles and six leaders with real bundled portraits", () => {
  expect(SCHOOL_TEACHERS).toHaveLength(29);
  expect(SCHOOL_LEADERSHIP).toHaveLength(6);
  expect(new Set(SCHOOL_TEACHERS.map((t) => t.name)).size).toBe(29);
  for (const person of [...SCHOOL_TEACHERS, ...SCHOOL_LEADERSHIP]) {
    if (person.photo) expect(existsSync(path.join("frontend/public", person.photo))).toBe(true);
  }
  for (const { slug: _slug, isDemo: _demo, ...profile } of SCHOOL_TEACHERS)
    expect(teacherInput.safeParse({ ...profile, status: "published", version: 0 }).success).toBe(
      true,
    );
});

it("imports once and preserves later admin edits and deletions on restart", async () => {
  await seedSchoolStaff(db);
  expect(await listTeachers(db, 50)).toHaveLength(29);
  const [first, second] = SCHOOL_TEACHERS;
  db.connection
    .prepare("UPDATE teachers SET biography=?,version=version+1 WHERE slug=?")
    .run("Administrator tahrirlagan tarjimai hol.", first!.slug);
  db.connection.prepare("DELETE FROM teachers WHERE slug=?").run(second!.slug);
  await seedSchoolStaff(db);
  expect(await listTeachers(db, 50)).toHaveLength(28);
  expect(
    db.connection.prepare("SELECT biography FROM teachers WHERE slug=?").get(first!.slug)?.[
      "biography"
    ],
  ).toBe("Administrator tahrirlagan tarjimai hol.");
});

it("does not replace an existing profile when importing the archive", async () => {
  const first = SCHOOL_TEACHERS[0]!;
  db.connection
    .prepare(
      "INSERT INTO teachers(slug,name,subject,qualification,education,experience,biography,status) VALUES(?,?,?,?,?,?,?,'draft')",
    )
    .run(
      "existing-profile",
      first.name,
      "Matematika",
      "Oldingi tavsif",
      "Ma’lumot",
      "Tajriba",
      "Oldingi tarjimai hol",
    );
  await seedSchoolStaff(db);
  expect(
    db.connection.prepare("SELECT COUNT(*) AS count FROM teachers WHERE name=?").get(first.name)?.[
      "count"
    ],
  ).toBe(1);
  expect(await listTeachers(db, 50)).toHaveLength(28);
});

it("allows bundled staff photos to be saved from admin while rejecting unsafe local paths", () => {
  expect(imageUrl.safeParse("/media/staff/dusmatova-nodira.webp").success).toBe(true);
  for (const value of [
    "/media/staff/../secret.webp",
    "//evil.test/photo.webp",
    "/api/admin/session",
    "javascript:alert(1)",
    "http://example.test/photo.webp",
  ])
    expect(imageUrl.safeParse(value).success).toBe(false);
});

it("upgrades archive placeholders while preserving edited and deleted staff", async () => {
  await seedSchoolStaff(db);
  db.connection
    .prepare("DELETE FROM content_imports WHERE name=?")
    .run("bekobod-registry-2026-10-29");
  const [untouched, edited, deleted] = SCHOOL_TEACHERS.filter((t) => t.photo);
  for (const teacher of [untouched!, edited!]) {
    db.connection
      .prepare("UPDATE teachers SET qualification='Oliy darajadagi ustoz',version=0 WHERE slug=?")
      .run(teacher.slug);
  }
  db.connection
    .prepare("UPDATE teachers SET biography='Admin tahriri',version=1 WHERE slug=?")
    .run(edited!.slug);
  db.connection.prepare("DELETE FROM teachers WHERE slug=?").run(deleted!.slug);
  const missingPhoto = SCHOOL_TEACHERS.filter((t) => !t.photo);
  for (const teacher of missingPhoto)
    db.connection.prepare("DELETE FROM teachers WHERE slug=?").run(teacher.slug);
  // Only the first missing-photo profile was deliberately removed by an admin.
  for (const teacher of missingPhoto.slice(1))
    db.connection
      .prepare("DELETE FROM recycle_bin WHERE resource='teachers' AND record_key=?")
      .run(teacher.slug);
  await seedSchoolStaff(db);
  expect(
    db.connection.prepare("SELECT qualification FROM teachers WHERE slug=?").get(untouched!.slug)?.[
      "qualification"
    ],
  ).toBe(untouched!.qualification);
  expect(
    db.connection.prepare("SELECT biography FROM teachers WHERE slug=?").get(edited!.slug)?.[
      "biography"
    ],
  ).toBe("Admin tahriri");
  expect(
    db.connection.prepare("SELECT slug FROM teachers WHERE slug=?").get(deleted!.slug),
  ).toBeUndefined();
  expect(
    db.connection.prepare("SELECT slug FROM teachers WHERE slug=?").get(missingPhoto[0]!.slug),
  ).toBeUndefined();
  expect(await listTeachers(db, 50)).toHaveLength(27);
  await seedSchoolStaff(db);
  expect(await listTeachers(db, 50)).toHaveLength(27);
});
