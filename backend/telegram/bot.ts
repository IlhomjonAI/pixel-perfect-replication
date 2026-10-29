import type { TelegramApi } from "./client";
import {
  contactButtons,
  contactText,
  MENU_LABEL,
  menuKeyboard,
  MESSAGE_FIELDS,
  splitTelegramText,
} from "./messages";
import {
  messageStatuses,
  messageStatusLabels,
  type AdminMessage,
} from "@school/contracts/contact-workflow";

interface TelegramMessage {
  message_id: number;
  text?: string;
  from?: { id: number; is_bot?: boolean };
  chat: { id: number; type: string };
}
export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: {
    id: string;
    from: { id: number; is_bot?: boolean };
    data?: string;
    message?: TelegramMessage;
  };
}

export class ContactBot {
  constructor(
    private readonly db: Database,
    private readonly api: TelegramApi,
    private readonly adminId: number,
  ) {}

  async configureMenu() {
    await this.api.call("setMyCommands", { commands: [], scope: { type: "default" } });
    await this.api.call("setMyCommands", {
      commands: [{ command: "murojaatlar", description: "Kelgan murojaatlarni ko‘rish" }],
      scope: { type: "chat", chat_id: this.adminId },
    });
  }

  async handleUpdate(update: TelegramUpdate) {
    const callback = update.callback_query;
    const message = callback?.message ?? update.message;
    const from = callback?.from ?? message?.from;
    // Both sender and destination must be the allowed private account. An allowed
    // user issuing a command in a group must never expose contacts to that group.
    if (
      !message ||
      !from ||
      from.is_bot ||
      from.id !== this.adminId ||
      message.chat.id !== this.adminId ||
      message.chat.type !== "private"
    ) {
      if (callback)
        await this.api.call("answerCallbackQuery", {
          callback_query_id: callback.id,
          text: "Ruxsat yo‘q.",
          show_alert: true,
        });
      return;
    }
    if (callback) {
      await this.api.call("answerCallbackQuery", { callback_query_id: callback.id });
      const change = /^status:(\d{1,15}):(\d{1,10}):(new|in_progress|resolved)$/.exec(
        callback.data ?? "",
      );
      if (change) {
        const updated = await this.db
          .prepare(
            "UPDATE contact_messages SET status=?,version=version+1,updated_at=? WHERE id=? AND version=? RETURNING id",
          )
          .bind(change[3], new Date().toISOString(), Number(change[1]), Number(change[2]))
          .first();
        if (!updated)
          await this.api.call("sendMessage", {
            chat_id: this.adminId,
            text: "Murojaat o‘zgargan yoki o‘chirilgan. Yangilangan holatni tekshiring.",
          });
        await this.showContact(Number(change[1]), 0);
        return;
      }
      const list = /^list:(\d{1,6})$/.exec(callback.data ?? "");
      if (list) {
        await this.showList(Number(list[1]));
        return;
      }
      const view = /^view:(\d{1,15}):(\d{1,6})$/.exec(callback.data ?? "");
      if (view) {
        await this.showContact(Number(view[1]), Number(view[2]));
        return;
      }
      return;
    }
    const command = message.text?.split(/\s/)[0]?.split("@")[0];
    if (command === "/start") {
      await this.api.call("sendMessage", {
        chat_id: this.adminId,
        text: "Xush kelibsiz! Bu bot faqat siz uchun. Kelgan murojaatlarni quyidagi tugma orqali ko‘ring. Javobni murojaatchining Telegram username’i yoki telefon raqami orqali o‘zingiz yuborasiz.",
        reply_markup: menuKeyboard,
      });
      return;
    }
    if (command === "/murojaatlar" || message.text === MENU_LABEL) {
      await this.showList(0);
      return;
    }
    await this.api.call("sendMessage", {
      chat_id: this.adminId,
      text: "Murojaatlarni ko‘rish uchun quyidagi tugmani bosing.",
      reply_markup: menuKeyboard,
    });
  }

  private async showList(offset: number) {
    if (!Number.isSafeInteger(offset) || offset < 0 || offset > 100000) return;
    const { results } = await this.db
      .prepare(
        "SELECT id,name,type,status,created_at FROM contact_messages ORDER BY id DESC LIMIT 6 OFFSET ?",
      )
      .bind(offset)
      .all<AdminMessage>();
    const items = results.slice(0, 5);
    const counts = await this.db
      .prepare("SELECT COUNT(*) AS count FROM contact_messages WHERE status!='resolved'")
      .first<{ count: number }>();
    if (!items.length) {
      await this.api.call("sendMessage", {
        chat_id: this.adminId,
        text: "Hozircha bu sahifada murojaat yo‘q.",
        reply_markup: {
          inline_keyboard: [[{ text: "Murojaatlarni yangilash", callback_data: "list:0" }]],
        },
      });
      return;
    }
    const keyboard = items.map((item) => [
      {
        text: `#${item.id} · ${item.name.slice(0, 35)}`,
        callback_data: `view:${item.id}:${offset}`,
      },
    ]);
    const pager = [];
    if (offset > 0)
      pager.push({ text: "← Oldingi", callback_data: `list:${Math.max(0, offset - 5)}` });
    if (results.length > 5) pager.push({ text: "Keyingi →", callback_data: `list:${offset + 5}` });
    if (pager.length) keyboard.push(pager);
    keyboard.push([{ text: "Yangilash", callback_data: "list:0" }]);
    await this.api.call("sendMessage", {
      chat_id: this.adminId,
      text: `📥 Kelgan murojaatlar · ${Math.floor(offset / 5) + 1}-sahifa\nJavob kutilmoqda: ${counts?.count ?? 0}\n\nTafsilotlarni ko‘rish uchun murojaatni tanlang.`,
      reply_markup: { inline_keyboard: keyboard },
    });
  }

  private async showContact(id: number, offset: number) {
    if (!Number.isSafeInteger(id) || id < 1 || offset > 100000) return;
    const item = await this.db
      .prepare(`SELECT ${MESSAGE_FIELDS} FROM contact_messages WHERE id=?`)
      .bind(id)
      .first<AdminMessage>();
    if (!item) {
      await this.api.call("sendMessage", {
        chat_id: this.adminId,
        text: "Murojaat topilmadi yoki admin panelida o‘chirilgan.",
      });
      return;
    }
    const buttons = contactButtons(item);
    const keyboard = [
      ...(buttons.length ? [buttons] : []),
      ...messageStatuses.map((status) => [
        {
          text: `${item.status === status ? "✓ " : ""}${messageStatusLabels[status]}`,
          callback_data: `status:${id}:${item.version}:${status}`,
        },
      ]),
      [{ text: "← Murojaatlar", callback_data: `list:${offset}` }],
    ];
    const parts = splitTelegramText(contactText(item));
    for (const [index, text] of parts.entries()) {
      await this.api.call("sendMessage", {
        chat_id: this.adminId,
        text,
        link_preview_options: { is_disabled: true },
        ...(index === parts.length - 1 ? { reply_markup: { inline_keyboard: keyboard } } : {}),
      });
    }
  }
}
