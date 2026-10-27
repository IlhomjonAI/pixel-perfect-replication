import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
if (!existsSync(".dev.vars")) {
  console.error("Local admin config is missing. Complete admin:setup first.");
  process.exit(1);
}
let muted = false;
const output = new Writable({
  write(chunk, encoding, done) {
    if (!muted) process.stdout.write(chunk, encoding);
    done();
  },
});
const rl = createInterface({ input: process.stdin, output, terminal: process.stdin.isTTY });
try {
  const project = (await rl.question("Supabase Project URL: ")).trim();
  const bucket = (await rl.question("Bucket name [school-images]: ")).trim() || "school-images";
  process.stdout.write("Supabase Secret key (sb_secret_..., input is hidden): ");
  muted = true;
  const secret = (await rl.question("")).trim();
  muted = false;
  process.stdout.write("\n");
  let url;
  try {
    url = new URL(project);
  } catch {
    throw new Error("Invalid Supabase Project URL.");
  }
  if (
    url.protocol !== "https:" ||
    !/^[a-z0-9-]+\.supabase\.co$/.test(url.hostname) ||
    url.port ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    !/^[a-z0-9][a-z0-9_-]{0,62}$/.test(bucket) ||
    !/^sb_secret_[A-Za-z0-9_-]{20,200}$/.test(secret)
  )
    throw new Error(
      "Invalid settings. Use Project URL, bucket name and a sb_secret_ key from Settings > API Keys.",
    );
  const original = readFileSync(".dev.vars", "utf8")
    .split(/\r?\n/)
    .filter(
      (line) =>
        !/^(CLOUDINARY_(CLOUD_NAME|API_KEY|API_SECRET)|SUPABASE_(URL|SECRET_KEY|STORAGE_BUCKET))\s*=/.test(
          line,
        ),
    )
    .join("\n")
    .trimEnd();
  writeFileSync(
    ".dev.vars",
    original +
      `\nSUPABASE_URL=${JSON.stringify(url.origin)}\nSUPABASE_STORAGE_BUCKET=${JSON.stringify(bucket)}\nSUPABASE_SECRET_KEY=${JSON.stringify(secret)}\n`,
    { mode: 0o600 },
  );
  console.log(
    "Supabase Storage config saved locally. Admin password unchanged. Restart worker:local.",
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : "Configuration failed.");
  process.exitCode = 1;
} finally {
  muted = false;
  rl.close();
}
