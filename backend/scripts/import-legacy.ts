import { existsSync, mkdirSync, readdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync, backup } from "node:sqlite";
import { databasePath } from "../config";
import { SqliteDatabase } from "../database/sqlite";

if (existsSync(databasePath))
  throw new Error(
    "Target database already exists. Choose a new DATABASE_PATH; existing data will never be overwritten.",
  );
const directory = ".wrangler/state/v3/d1/miniflare-D1DatabaseObject";
const candidates = existsSync(directory)
  ? readdirSync(directory).filter((f) => f.endsWith(".sqlite") && f !== "metadata.sqlite")
  : [];
const filename =
  process.argv[2] ?? (candidates.length === 1 ? path.join(directory, candidates[0]!) : undefined);
if (!filename) throw new Error("Pass the legacy SQLite file path explicitly.");
mkdirSync(path.dirname(path.resolve(databasePath)), { recursive: true });
const source = new DatabaseSync(filename, { readOnly: true });
try {
  await backup(source, databasePath);
} finally {
  source.close();
}
const target = new SqliteDatabase(databasePath);
try {
  target.migrate();
  console.log("Existing local database imported; original file preserved.");
} finally {
  target.close();
}
