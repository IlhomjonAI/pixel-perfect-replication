import type { ManagedDatabase } from "./managed";
import { SCHOOL_TEACHERS } from "@school/contracts/staff";

/** One-time content import: future admin edits, archives and deletions stay intact. */
export async function seedSchoolStaff(database: ManagedDatabase) {
  await database
    .prepare(
      "CREATE TABLE IF NOT EXISTS content_imports (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
    )
    .run();
  const name = "bekobod-staff-2026-10-27";
  await database.transaction(async (db) => {
    // Claim the import marker inside the same transaction, including concurrent starts.
    const claimed = await db
      .prepare(
        "INSERT INTO content_imports(name) VALUES(?) ON CONFLICT(name) DO NOTHING RETURNING name",
      )
      .bind(name)
      .first();
    if (!claimed) return;
    for (const t of SCHOOL_TEACHERS) {
      await db
        .prepare(
          `INSERT INTO teachers
        (slug,name,photo,subject,qualification,education,experience,biography,certificates,certificate_images,is_demo,status)
        SELECT ?,?,?,?,?,?,?,?,?,?,0,'published'
        WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE slug=? OR name=?)`,
        )
        .bind(
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
        )
        .run();
    }
  });
}
