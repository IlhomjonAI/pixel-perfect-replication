import "../config";
import { databasePath } from "../config";
import { SqliteDatabase } from "../database/sqlite";
import { createBackup } from "../lib/backups";
const db = new SqliteDatabase(databasePath);
try {
  db.migrate();
  console.log(
    "Backup saved:",
    await createBackup(db, process.env["BACKUP_DIR"] ?? "backend/data/backups"),
  );
} finally {
  db.close();
}
