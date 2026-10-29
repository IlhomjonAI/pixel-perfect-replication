import { existsSync, readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { fileURLToPath } from "node:url";
import path from "node:path";
export const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
// Keep existing local credentials usable; environment variables take precedence.
const original = { ...process.env };
for (const relative of [".dev.vars", ".env", "backend/.env"]) {
  const file = path.join(repositoryRoot, relative);
  if (existsSync(file)) Object.assign(process.env, parseEnv(readFileSync(file, "utf8")));
}
Object.assign(process.env, original);
export const databasePath = path.resolve(
  repositoryRoot,
  process.env["DATABASE_PATH"] ?? "backend/data/school.sqlite",
);
