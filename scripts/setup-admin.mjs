import { randomBytes, pbkdf2Sync } from "node:crypto";
import { writeFileSync, existsSync } from "node:fs";
if (existsSync(".dev.vars")) {
  console.error(".dev.vars already exists. Keep it; do not overwrite existing secrets.");
  process.exit(1);
}
const password = randomBytes(24).toString("base64url");
const salt = randomBytes(16);
const hash = pbkdf2Sync(password, salt, 100000, 32, "sha256");
writeFileSync(
  ".dev.vars",
  `ADMIN_PASSWORD_HASH="pbkdf2:100000:${salt.toString("hex")}:${hash.toString("hex")}"\n`,
  { flag: "wx", mode: 0o600 },
);
console.log("Admin password (save privately; do not post it in chat or GitHub):\n" + password);
console.log("Local credential saved. Run npm run worker:local, then open /admin.");
