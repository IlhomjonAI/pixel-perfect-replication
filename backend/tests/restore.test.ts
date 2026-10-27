// @vitest-environment node
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, it } from "vitest";
import { SqliteDatabase } from "../database/sqlite";
import { createBackup } from "../lib/backups";
import { restoreBackup } from "../lib/restore";

it("restores verified data without overwriting files and rejects unchecked or corrupted snapshots", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "school-restore-"));
  const db = new SqliteDatabase();
  db.migrate();
  try {
    const snapshot = await createBackup(db, directory, { NODE_ENV: "test" });
    const target = path.join(directory, "restored.sqlite");
    await restoreBackup(snapshot, target);
    const original = await readFile(target);
    await expect(restoreBackup(snapshot, target)).rejects.toThrow();
    expect(await readFile(target)).toEqual(original);
    const manifestPath = path.join(snapshot, "manifest.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    await writeFile(manifestPath, JSON.stringify({ ...manifest, files: [] }));
    await expect(restoreBackup(snapshot, path.join(directory, "unchecked.sqlite"))).rejects.toThrow(
      "checksum missing",
    );
    await writeFile(manifestPath, JSON.stringify(manifest));
    await writeFile(path.join(snapshot, "school.sqlite"), "corrupted");
    await expect(restoreBackup(snapshot, path.join(directory, "corrupt.sqlite"))).rejects.toThrow(
      "checksum mismatch",
    );
  } finally {
    db.close();
    await rm(directory, { recursive: true, force: true });
  }
});
