import { Pool } from "pg";
import { databasePath } from "../config";
import { PostgresDatabase, postgresConfig } from "./postgres";
import type { ManagedDatabase } from "./managed";

export async function connectDatabase(
  env: NodeJS.ProcessEnv = process.env,
): Promise<ManagedDatabase> {
  if (env["DATABASE_URL"]) return new PostgresDatabase(new Pool(postgresConfig(env)));
  if (env["NODE_ENV"] === "production" || env["RENDER"])
    throw new Error("Production uchun DATABASE_URL kerak; SQLite faqat mahalliy rejim uchun.");
  const { SqliteDatabase } = await import("./sqlite");
  return new SqliteDatabase(databasePath);
}
