import { randomBytes, pbkdf2Sync } from "node:crypto";
import { writeFileSync, existsSync, readFileSync } from "node:fs";
const reset = process.argv.includes("--reset");
const existing = existsSync(".dev.vars");
if (existing && !reset) {
  console.error(".dev.vars already exists. Keep it; do not overwrite existing secrets.");
  process.exit(1);
}
const password = randomBytes(24).toString("base64url");
const salt = randomBytes(16);
const hash = pbkdf2Sync(password, salt, 100000, 32, "sha256");
const otherSettings = existing
  ? readFileSync(".dev.vars", "utf8")
      .split(/\r?\n/)
      .filter((line) => !/^\s*ADMIN_PASSWORD_HASH\s*=/.test(line))
      .join("\n")
      .trimEnd()
  : "";
writeFileSync(
  ".dev.vars",
  (otherSettings ? otherSettings + "\n" : "") +
    `ADMIN_PASSWORD_HASH="pbkdf2:100000:${salt.toString("hex")}:${hash.toString("hex")}"\n`,
  { flag: existing ? "w" : "wx", mode: 0o600 },
);
console.log("Admin password (save privately; do not post it in chat or GitHub):\n" + password);
console.log("Local credential saved. Run npm run worker:local, then open /admin.");
