import type { TelegramApi } from "./client";
import { TelegramError } from "./client";
import { contactButtons, contactText, MESSAGE_FIELDS, splitTelegramText } from "./messages";
import type { AdminMessage } from "@backend/contracts/contact-workflow";

export async function deliverPendingContacts(
  db: Database,
  api: TelegramApi,
  adminId: number,
  now = Math.floor(Date.now() / 1000),
) {
  const { results } = await db
    .prepare(
      "SELECT id,contact_id,delivery_part,attempts FROM telegram_outbox WHERE sent_at IS NULL AND next_attempt_at<=? ORDER BY id LIMIT 10",
    )
    .bind(now)
    .all<{ id: number; contact_id: number; delivery_part: number; attempts: number }>();
  for (const entry of results) {
    const item = await db
      .prepare(`SELECT ${MESSAGE_FIELDS} FROM contact_messages WHERE id=?`)
      .bind(entry.contact_id)
      .first<AdminMessage>();
    if (!item) continue;
    try {
      const parts = splitTelegramText(contactText(item));
      for (let index = entry.delivery_part; index < parts.length; index++) {
        const buttons = contactButtons(item);
        await api.call("sendMessage", {
          chat_id: adminId,
          text: parts[index]!,
          link_preview_options: { is_disabled: true },
          ...(index === parts.length - 1
            ? {
                reply_markup: {
                  inline_keyboard: [
                    ...(buttons.length ? [buttons] : []),
                    [{ text: "Holatni boshqarish", callback_data: `view:${item.id}:0` }],
                  ],
                },
              }
            : {}),
        });
        await db
          .prepare("UPDATE telegram_outbox SET delivery_part=? WHERE id=?")
          .bind(index + 1, entry.id)
          .run();
      }
      await db
        .prepare("UPDATE telegram_outbox SET sent_at=?,last_error=NULL WHERE id=?")
        .bind(new Date(now * 1000).toISOString(), entry.id)
        .run();
    } catch (error) {
      const retry = Math.max(
        error instanceof TelegramError ? error.retryAfter : 0,
        Math.min(3600, 30 * 2 ** Math.min(entry.attempts, 7)),
      );
      const reason = error instanceof TelegramError ? `telegram_${error.code}` : "delivery_failed";
      await db
        .prepare(
          "UPDATE telegram_outbox SET attempts=attempts+1,next_attempt_at=?,last_error=? WHERE id=?",
        )
        .bind(now + retry, reason, entry.id)
        .run();
      // Respect Telegram's rate limit for the whole batch, not just one contact.
      if (error instanceof TelegramError && error.code === 429) break;
    }
  }
}
