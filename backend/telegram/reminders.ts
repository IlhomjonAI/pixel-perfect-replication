import type { TelegramApi } from "./client";
import { menuKeyboard } from "./messages";

/** One daily digest, during daytime in Tashkent. Persisted across restarts. */
export async function sendOverdueReminder(
  db: Database,
  api: TelegramApi,
  adminId: number,
  now = new Date(),
) {
  const local = new Date(now.getTime() + 5 * 3600000);
  if (local.getUTCHours() < 9 || local.getUTCHours() >= 18) return;
  const day = local.toISOString().slice(0, 10);
  const previous = await db
    .prepare("SELECT value FROM telegram_state WHERE key='reminder_day'")
    .first<{ value: string }>();
  if (previous?.value === day) return;
  const count = await db
    .prepare(
      "SELECT COUNT(*) AS count FROM contact_messages WHERE status!='resolved' AND julianday(created_at)<=julianday(?) - 1",
    )
    .bind(now.toISOString())
    .first<{ count: number }>();
  if (!count?.count) return;
  await api.call("sendMessage", {
    chat_id: adminId,
    text: `⏰ ${count.count} ta murojaat 24 soatdan beri javob kutmoqda. Murojaatni ko‘rib chiqqach, holatini yangilang.`,
    reply_markup: menuKeyboard,
  });
  await db
    .prepare(
      "INSERT INTO telegram_state(key,value) VALUES('reminder_day',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
    )
    .bind(day)
    .run();
}
