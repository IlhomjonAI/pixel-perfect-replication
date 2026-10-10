import { copyFileSync, existsSync } from "node:fs";
if (existsSync(".dev.vars") && existsSync(".output/server/wrangler.json"))
  copyFileSync(".dev.vars", ".output/server/.dev.vars");
