import { backup, DatabaseSync } from "node:sqlite";
import { mkdir, readFile, writeFile, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import type { SqliteDatabase } from "../database/sqlite";
import { storageConfig } from "../api/image-upload";

export async function createBackup(
  db: SqliteDatabase,
  directory: string,
  environment: NodeJS.ProcessEnv = process.env,
) {
  const root = path.resolve(directory);
  const destination = path.join(
    root,
    `snapshot-${new Date().toISOString().replace(/[:.]/g, "-")}-${crypto.randomUUID()}`,
  );
  await mkdir(destination, { recursive: true });
  const filename = path.join(destination, "school.sqlite");
  await backup(db.connection, filename);
  const check = new DatabaseSync(filename, { readOnly: true });
  let assets: { public_id: string; url: string; bytes: number }[];
  try {
    if (check.prepare("PRAGMA quick_check").get()?.["quick_check"] !== "ok")
      throw new Error("Backup verification failed");
    assets = check.prepare("SELECT public_id,url,bytes FROM image_assets").all() as typeof assets;
  } finally {
    check.close();
  }
  const storage = storageConfig({
    SUPABASE_URL: environment["SUPABASE_URL"] ?? "",
    SUPABASE_SECRET_KEY: environment["SUPABASE_SECRET_KEY"] ?? "",
    SUPABASE_STORAGE_BUCKET: environment["SUPABASE_STORAGE_BUCKET"] ?? "school-images",
  });
  const files: { file: string; sha256: string; publicId?: string; url?: string }[] = [];
  const save = async (file: string, bytes: Uint8Array, asset?: (typeof assets)[number]) => {
    await writeFile(path.join(destination, file), bytes);
    files.push({
      file,
      sha256: createHash("sha256").update(bytes).digest("hex"),
      ...(asset ? { publicId: asset.public_id, url: asset.url } : {}),
    });
  };
  await save("school.sqlite", await readFile(filename));
  for (const asset of assets) {
    if (
      !storage ||
      !asset.url.startsWith(`${storage.base}/storage/v1/object/public/${storage.bucket}/`)
    )
      throw new Error("Image backup storage configuration missing");
    const response = await fetch(asset.url, {
      signal: AbortSignal.timeout(30000),
      redirect: "error",
    });
    if (!response.ok) throw new Error("Image backup failed");
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.length !== asset.bytes) throw new Error("Image size mismatch");
    await save(`image-${createHash("sha256").update(asset.public_id).digest("hex")}`, bytes, asset);
  }
  const manifest = JSON.stringify(
    { format: 1, createdAt: new Date().toISOString(), files },
    null,
    2,
  );
  await writeFile(path.join(destination, "manifest.json"), manifest);
  const remote = environment["BACKUP_STORAGE_BUCKET"];
  if (remote) {
    if (!storage || !/^[a-z0-9][a-z0-9_-]{0,62}$/.test(remote) || remote === storage.bucket)
      throw new Error("Use a separate private backup bucket");
    // Dedicated bucket must already exist and be private; never upload contact data publicly.
    const bucketResponse = await fetch(`${storage.base}/storage/v1/bucket/${remote}`, {
      headers: { apikey: storage.secret },
      signal: AbortSignal.timeout(30000),
    });
    const bucket = await bucketResponse.json();
    if (!bucketResponse.ok || bucket.public !== false)
      throw new Error("Backup bucket must be private");
    for (const file of [...files.map((f) => f.file), "manifest.json"]) {
      const response = await fetch(
        `${storage.base}/storage/v1/object/${remote}/${path.basename(destination)}/${file}`,
        {
          method: "POST",
          headers: { apikey: storage.secret, "Content-Type": "application/octet-stream" },
          body: await readFile(path.join(destination, file)),
          signal: AbortSignal.timeout(60000),
        },
      );
      if (!response.ok) throw new Error("Remote backup failed");
    }
  }
  await writeFile(path.join(destination, "complete"), "1");
  // Only completed, tool-owned snapshot folders are eligible for local retention.
  const entries = (await readdir(root, { withFileTypes: true }))
    .filter((e) => e.isDirectory() && /^snapshot-[\dTZ-]+-[a-f0-9-]{36}$/.test(e.name))
    .map((e) => e.name)
    .sort()
    .reverse();
  let retained = 0;
  for (const name of entries) {
    const candidate = path.resolve(root, name);
    if (path.dirname(candidate) !== root) continue;
    try {
      await readFile(path.join(candidate, "complete"));
    } catch {
      continue;
    }
    if (++retained > 14) await rm(candidate, { recursive: true });
  }
  return destination;
}

export function startBackups(db: SqliteDatabase, environment: NodeJS.ProcessEnv = process.env) {
  if (environment["NODE_ENV"] === "test" || environment["BACKUP_ENABLED"] !== "true")
    return async () => {};
  let stopped = false;
  let active: Promise<void> | undefined;
  const run = () => {
    if (stopped || active) return;
    active = (async () => {
      const state = await db
        .prepare("SELECT value FROM telegram_state WHERE key='backup_completed_at'")
        .first<{ value: string }>();
      if (state && Date.now() - Date.parse(state.value) < 86400000) return;
      await createBackup(db, environment["BACKUP_DIR"] ?? "backend/data/backups", environment);
      await db
        .prepare(
          "INSERT INTO telegram_state(key,value) VALUES('backup_completed_at',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
        )
        .bind(new Date().toISOString())
        .run();
      console.log("Zaxira nusxa va rasmlar tekshirildi va saqlandi.");
    })()
      .catch(() => {
        console.error("Zaxira nusxa olinmadi. Disk va storage sozlamalarini tekshiring.");
      })
      .finally(() => {
        active = undefined;
      });
  };
  run();
  const timer = setInterval(run, 3600000);
  return async () => {
    stopped = true;
    clearInterval(timer);
    await active;
  };
}
