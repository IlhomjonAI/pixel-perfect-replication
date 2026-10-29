import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
const {
  MONITOR_URL: url,
  MONITOR_STATE_PATH: statePath,
  MONITOR_TELEGRAM_TOKEN: token,
  MONITOR_TELEGRAM_ID: chatId,
} = process.env;
if (!url || !statePath || !token || !/^\d+$/.test(chatId ?? ""))
  throw new Error("Set monitor URL, state path, bot token and numeric recipient ID.");
let healthy = false;
try {
  const response = await fetch(url, { signal: AbortSignal.timeout(20000), cache: "no-store" });
  healthy = response.ok && (await response.json()).data?.status === "ok";
} catch {
  /* Outage */
}
let previous;
try {
  previous = JSON.parse(await readFile(statePath, "utf8")).healthy;
} catch {
  /* First run */
}
if (previous !== healthy && (previous !== undefined || !healthy)) {
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: healthy
        ? "✅ Maktab sayti yana ishlayapti."
        : "⚠️ Maktab saytining tekshiruv so‘rovi bajarilmadi. Hosting va bazani tekshiring.",
    }),
    signal: AbortSignal.timeout(15000),
  }).catch(() => null);
  if (!response?.ok || (await response.json()).ok !== true)
    throw new Error("Monitor notification failed; state unchanged for retry.");
}
await mkdir(path.dirname(path.resolve(statePath)), { recursive: true });
await writeFile(statePath, JSON.stringify({ healthy, checkedAt: new Date().toISOString() }));
console.log(healthy ? "Healthy" : "Unhealthy");
if (!healthy) process.exitCode = 1;
