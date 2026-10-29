import "../config";
import path from "node:path";
import { connectDatabase } from "../database/connect";
import { importSqlite } from "../database/import-sqlite";

const source = process.argv[2];
if (!source || !process.env["DATABASE_URL"]) {
  throw new Error(
    "DATABASE_URL ni backend/.env ga kiriting. Foydalanish: npm run db:import:postgres -- ABSOLUTE_SQLITE_PATH",
  );
}
const db = await connectDatabase();
try {
  await db.migrate();
  console.log("Imported records:", await importSqlite(path.resolve(source), db));
} finally {
  await db.close();
}
