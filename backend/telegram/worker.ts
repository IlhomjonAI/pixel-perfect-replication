import { setTimeout as delay } from "node:timers/promises";
import { ContactBot, type TelegramUpdate } from "./bot";
import { TelegramClient, TelegramError } from "./client";
import { deliverPendingContacts } from "./outbox";
import { sendOverdueReminder } from "./reminders";

export async function acquireWorkerLease(
  db: Database,
  owner: string,
  now = Math.floor(Date.now() / 1000),
) {
  const row = await db
    .prepare(
      "INSERT INTO telegram_worker_lock (id,owner,expires_at) VALUES (1,?,?) ON CONFLICT(id) DO UPDATE SET owner=excluded.owner,expires_at=excluded.expires_at WHERE telegram_worker_lock.expires_at<=? OR telegram_worker_lock.owner=? RETURNING owner",
    )
    .bind(owner, now + 60, now, owner)
    .first<{ owner: string }>();
  return row?.owner === owner;
}

export function startTelegramWorker(
  db: Database,
  environment: NodeJS.ProcessEnv = process.env,
): () => Promise<void> {
  if (environment["TELEGRAM_ENABLED"] === "false" || environment["NODE_ENV"] === "test")
    return async () => {};
  const token = environment["TELEGRAM_BOT_TOKEN"];
  const adminId = Number(environment["TELEGRAM_ADMIN_ID"]);
  if (!token && !environment["TELEGRAM_ADMIN_ID"]) return async () => {};
  if (
    !token ||
    !/^\d{5,}:[A-Za-z0-9_-]{20,}$/.test(token) ||
    !Number.isSafeInteger(adminId) ||
    adminId < 1
  ) {
    console.error("Telegram sozlamalari noto‘g‘ri. Token va raqamli admin ID’ni tekshiring.");
    return async () => {};
  }
  const controller = new AbortController();
  const { signal } = controller;
  const api = new TelegramClient(token, signal);
  const bot = new ContactBot(db, api, adminId);
  const owner = crypto.randomUUID();
  const sleep = (ms: number) => delay(ms, undefined, { signal }).catch(() => {});
  let heartbeat: ReturnType<typeof setInterval> | undefined;
  let lastLog = 0;
  const report = (error: unknown) => {
    if (signal.aborted || Date.now() - lastLog < 60000) return;
    lastLog = Date.now();
    const code = error instanceof TelegramError ? error.code : 0;
    console.error(
      `Telegram vaqtincha ulanmagan (${code}). Murojaatlar bazada saqlanmoqda; qayta uriniladi.`,
    );
  };

  const task = (async () => {
    while (!signal.aborted && !(await acquireWorkerLease(db, owner))) await sleep(5000);
    if (signal.aborted) return;
    heartbeat = setInterval(() => {
      void acquireWorkerLease(db, owner)
        .then((held) => {
          if (!held) controller.abort();
        })
        .catch(() => controller.abort());
    }, 10000);
    try {
      while (!signal.aborted) {
        try {
          const webhook = await api.call<{ url: string }>("getWebhookInfo");
          if (webhook.url) {
            console.error(
              "Telegram botda webhook mavjud. Polling ishga tushirilmadi; mavjud webhook o‘zgartirilmadi.",
            );
            return;
          }
          await bot.configureMenu();
          break;
        } catch (error) {
          report(error);
          await sleep(10000);
        }
      }
      if (signal.aborted) return;
      console.log(
        "Telegram bot ulandi. Murojaatlar faqat ruxsat berilgan shaxsiy chatga yuboriladi.",
      );
      const state = await db
        .prepare("SELECT value FROM telegram_state WHERE key='update_offset'")
        .first<{ value: string }>();
      let offset = Number(state?.value ?? 0);
      if (!Number.isSafeInteger(offset) || offset < 0) offset = 0;
      const poll = async () => {
        while (!signal.aborted) {
          try {
            const updates = await api.call<TelegramUpdate[]>("getUpdates", {
              offset,
              timeout: 25,
              limit: 50,
              allowed_updates: ["message", "callback_query"],
            });
            for (const update of updates) {
              if (signal.aborted) break;
              if (!Number.isSafeInteger(update.update_id) || update.update_id < offset) continue;
              await bot.handleUpdate(update);
              offset = update.update_id + 1;
              await db
                .prepare(
                  "INSERT INTO telegram_state (key,value) VALUES ('update_offset',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
                )
                .bind(String(offset))
                .run();
            }
          } catch (error) {
            report(error);
            await sleep(
              Math.max(5000, error instanceof TelegramError ? error.retryAfter * 1000 : 0),
            );
          }
        }
      };
      const notify = async () => {
        while (!signal.aborted) {
          try {
            await deliverPendingContacts(db, api, adminId);
            await sendOverdueReminder(db, api, adminId);
          } catch (error) {
            report(error);
          }
          await sleep(5000);
        }
      };
      await Promise.all([poll(), notify()]);
    } finally {
      if (heartbeat) clearInterval(heartbeat);
      await db.prepare("DELETE FROM telegram_worker_lock WHERE owner=?").bind(owner).run();
    }
  })().catch((error) => {
    report(error);
    controller.abort();
  });

  return async () => {
    controller.abort();
    await task;
  };
}
