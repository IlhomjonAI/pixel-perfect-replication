import { databasePath } from "../config";
import { SqliteDatabase } from "../database/sqlite";
const db = new SqliteDatabase(databasePath);
try {
  db.migrate();
  console.log("Database migrations applied.");
} finally {
  db.close();
}
