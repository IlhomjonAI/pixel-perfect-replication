import { readFile, copyFile } from "node:fs/promises";
import { constants } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import path from "node:path";

export async function restoreBackup(directory: string, target: string) {
  const manifest = JSON.parse(await readFile(path.join(directory, "manifest.json"), "utf8"));
  if (manifest.format !== 1 || !Array.isArray(manifest.files)) throw new Error("Invalid manifest");
  const names = new Set<string>();
  for (const entry of manifest.files) {
    if (
      !entry ||
      typeof entry.file !== "string" ||
      !/^(school\.sqlite|image-[a-f0-9]{64})$/.test(entry.file) ||
      !/^[a-f0-9]{64}$/.test(entry.sha256 ?? "") ||
      names.has(entry.file)
    )
      throw new Error("Invalid manifest entry");
    names.add(entry.file);
    const bytes = await readFile(path.join(directory, entry.file));
    if (createHash("sha256").update(bytes).digest("hex") !== entry.sha256)
      throw new Error("Backup checksum mismatch");
  }
  if (!names.has("school.sqlite")) throw new Error("Database checksum missing");
  const source = path.join(directory, "school.sqlite");
  const db = new DatabaseSync(source, { readOnly: true });
  try {
    if (db.prepare("PRAGMA integrity_check").get()?.["integrity_check"] !== "ok")
      throw new Error("Invalid database");
    for (const asset of db.prepare("SELECT public_id FROM image_assets").all()) {
      const name = `image-${createHash("sha256").update(String(asset["public_id"])).digest("hex")}`;
      if (!names.has(name)) throw new Error("Image backup missing");
    }
  } finally {
    db.close();
  }
  await copyFile(source, target, constants.COPYFILE_EXCL);
}
