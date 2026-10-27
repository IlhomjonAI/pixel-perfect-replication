import { restoreBackup } from "../lib/restore";
const [directory, target] = process.argv.slice(2);
if (!directory || !target)
  throw new Error("Usage: npm run backup:restore -- snapshot-directory NEW-database-path");
await restoreBackup(directory, target);
console.log(
  "Verified database restored to a new file. Images remain in the snapshot with their original URLs in manifest.json. Stop the backend before switching DATABASE_PATH.",
);
