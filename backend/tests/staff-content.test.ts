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

it("provides 25 distinct teacher profiles and five leaders with real bundled portraits", () => {
  expect(SCHOOL_TEACHERS).toHaveLength(25);
  expect(SCHOOL_LEADERSHIP).toHaveLength(5);
  expect(new Set(SCHOOL_TEACHERS.map((t) => t.name)).size).toBe(25);
  for (const person of [...SCHOOL_TEACHERS, ...SCHOOL_LEADERSHIP]) {
    expect(existsSync(path.join("frontend/public", person.photo!))).toBe(true);
  }
  for (const { slug: _slug, isDemo: _demo, ...profile } of SCHOOL_TEACHERS)
    expect(teacherInput.safeParse({ ...profile, status: "published", version: 0 }).success).toBe(
      true,
    );
});

it("imports once and preserves later admin edits and deletions on restart", async () => {
  await seedSchoolStaff(db);
  expect(await listTeachers(db, 50)).toHaveLength(25);
  const [first, second] = SCHOOL_TEACHERS;
  db.connection
    .prepare("UPDATE teachers SET biography=?,version=version+1 WHERE slug=?")
    .run("Administrator tahrirlagan tarjimai hol.", first!.slug);
  db.connection.prepare("DELETE FROM teachers WHERE slug=?").run(second!.slug);
  await seedSchoolStaff(db);
  expect(await listTeachers(db, 50)).toHaveLength(24);
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
  expect(await listTeachers(db, 50)).toHaveLength(24);
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
