import { DatabaseSync } from "node:sqlite";
import type { ManagedDatabase } from "./managed";

const tables = [
  "posts",
  "achievements",
  "teachers",
  "school_life",
  "contact_messages",
  "image_assets",
  "recycle_bin",
  "content_imports",
] as const;

/** Read-only source snapshot, all-or-nothing target import; never merge live databases. */
export async function importSqlite(filename: string, target: ManagedDatabase) {
  if (target.dialect !== "postgres") throw new Error("Import maqsadi PostgreSQL bo‘lishi kerak.");
  const source = new DatabaseSync(filename, { readOnly: true });
  try {
    source.exec("BEGIN");
    if (source.prepare("PRAGMA integrity_check").get()?.["integrity_check"] !== "ok")
      throw new Error("SQLite integrity check failed");
    return await target.transaction(async (db) => {
      await db.prepare(`LOCK TABLE ${tables.join(",")} IN SHARE ROW EXCLUSIVE MODE`).run();
      for (const table of tables) {
        const existing = await db
          .prepare(`SELECT COUNT(*) AS count FROM ${table}`)
          .first<{ count: number }>();
        if (Number(existing?.count))
          throw new Error("Maqsad baza bo‘sh emas. Import bekor qilindi.");
      }
      const counts: Record<string, number> = {};
      for (const table of tables) {
        if (
          !source.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(table)
        )
          continue;
        const columns = source
          .prepare(`PRAGMA table_info(${table})`)
          .all()
          .map((c) => String(c["name"]));
        if (columns.some((c) => !/^[a-z_]+$/.test(c))) throw new Error("Unexpected column name");
        const rows = source.prepare(`SELECT * FROM ${table}`).all();
        for (const row of rows)
          await db
            .prepare(
              `INSERT INTO ${table}(${columns.join(",")}) VALUES(${columns.map(() => "?").join(",")})`,
            )
            .bind(...columns.map((c) => row[c]))
            .run();
        counts[table] = rows.length;
        const result = await db
          .prepare(`SELECT COUNT(*) AS count FROM ${table}`)
          .first<{ count: number }>();
        if (Number(result?.count) !== rows.length) throw new Error("Import count mismatch");
      }
      // Historical contacts stay in admin but must not send fresh Telegram notifications.
      await db.prepare("UPDATE telegram_outbox SET sent_at=CURRENT_TIMESTAMP::text").run();
      for (const table of ["contact_messages", "recycle_bin"])
        await db
          .prepare(
            `SELECT setval(pg_get_serial_sequence('school_app.${table}','id'),COALESCE(MAX(id),1),COUNT(*)>0) FROM ${table}`,
          )
          .first();
      return counts;
    });
  } finally {
    source.close();
  }
}
