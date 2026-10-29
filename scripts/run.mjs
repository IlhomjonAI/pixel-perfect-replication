import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:net";
import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
if (existsSync(".env")) loadEnvFile(".env");
const production = process.argv[2] === "start";
const frontendPort = Number(process.env.PORT ?? 3000);
const apiPort = Number(process.env.API_PORT ?? 4000);

async function checkPort(port, label, host = "127.0.0.1") {
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error(`${label}: port noto‘g‘ri (${port}).`);
  }
  await new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once("error", (error) =>
      reject(
        new Error(
          error.code === "EADDRINUSE"
            ? `${label}: ${port}-port band. Avval ishlayotgan saytni uning terminalida Ctrl+C bilan to‘xtating, keyin qayta urinib ko‘ring.`
            : `${label}: portni ochib bo‘lmadi (${error.code}).`,
        ),
      ),
    );
    probe.listen(port, host, () => probe.close(resolve));
  });
}
// Check both ports before starting either child: an old API must never be
// mistaken for the new backend merely because its health check succeeds.
try {
  await checkPort(frontendPort, "Frontend");
  await checkPort(apiPort, "Backend", process.env.API_HOST ?? "127.0.0.1");
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
const children = [];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (child.exitCode !== null || child.signalCode !== null) continue;
    if (process.platform === "win32") {
      // Node watch mode and Next dev have descendants. Stop only the trees
      // started by this launcher so they cannot leave occupied ports behind.
      spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], {
        stdio: "ignore",
        windowsHide: true,
      });
    } else child.kill();
  }
  process.exitCode = code;
}
const api = spawn(
  process.execPath,
  ["--import", "tsx", ...(production ? [] : ["--watch"]), "backend/server.ts"],
  { stdio: "inherit", env: { ...process.env, PORT: String(apiPort) } },
);
children.push(api);
api.on("exit", (code) => stop(code ?? 1));
process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());
const url = (process.env.API_INTERNAL_URL ?? `http://127.0.0.1:${apiPort}`) + "/api/health";
let ready = false;
for (let attempt = 0; attempt < 100 && !stopping; attempt++) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(1000) });
    if (response.ok) {
      ready = true;
      break;
    }
  } catch {
    /* Wait until the API has migrated the database. */
  }
  await new Promise((resolve) => setTimeout(resolve, 200));
}
if (!ready) {
  console.error("Backend did not start. Check database and API port settings.");
  stop(1);
} else if (!stopping) {
  const frontend = spawn(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      production ? "start" : "dev",
      "frontend",
      "--port",
      String(frontendPort),
    ],
    { stdio: "inherit" },
  );
  children.push(frontend);
  frontend.on("exit", (code) => stop(code ?? 1));
}
