import type { SqliteDatabase } from "./sqlite";
import { SCHOOL_TEACHERS } from "../contracts/staff";

/** One-time content import: future admin edits, archives and deletions stay intact. */
export function seedSchoolStaff(database: SqliteDatabase) {
  const db = database.connection;
  db.exec(
    "CREATE TABLE IF NOT EXISTS content_imports (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
  );
  const name = "bekobod-staff-2026-10-27";
  db.exec("BEGIN IMMEDIATE");
  try {
    if (!db.prepare("SELECT name FROM content_imports WHERE name=?").get(name)) {
      const insert = db.prepare(`INSERT INTO teachers
        (slug,name,photo,subject,qualification,education,experience,biography,certificates,certificate_images,is_demo,status)
        SELECT ?,?,?,?,?,?,?,?,?,?,0,'published'
        WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE slug=? OR name=?)`);
      for (const t of SCHOOL_TEACHERS)
        insert.run(
          t.slug,
          t.name,
          t.photo,
          t.subject,
          t.qualification,
          t.education,
          t.experience,
          t.biography,
          JSON.stringify(t.certificates),
          JSON.stringify(t.certificateImages),
          t.slug,
          t.name,
        );
      db.prepare("INSERT INTO content_imports(name) VALUES (?)").run(name);
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
