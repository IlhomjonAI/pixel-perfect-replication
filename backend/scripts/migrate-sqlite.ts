import { databasePath } from "../config";
import { SqliteDatabase } from "../database/sqlite";
if (process.env["DATABASE_URL"])
  throw new Error(
    "Bu buyruq faqat mahalliy SQLite uchun. PostgreSQL uchun npm run db:migrate ishlating.",
  );
const db = new SqliteDatabase(databasePath);
try {
  db.migrate();
  console.log("Local SQLite migrations applied.");
} finally {
  db.close();
}
