import { existsSync, readFileSync } from "node:fs";
import { parseEnv } from "node:util";
// Keep existing local credentials usable; environment variables take precedence.
const original = { ...process.env };
for (const file of [".dev.vars", ".env"]) {
  if (existsSync(file)) Object.assign(process.env, parseEnv(readFileSync(file, "utf8")));
}
Object.assign(process.env, original);
export const databasePath = process.env["DATABASE_PATH"] ?? "backend/data/school.sqlite";
