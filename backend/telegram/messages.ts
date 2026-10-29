import { TELEGRAM_USERNAME } from "@school/contracts/contact";
import { messageStatusLabels, type AdminMessage } from "@school/contracts/contact-workflow";

export const MESSAGE_FIELDS =
  "id,name,contact,telegram_username,email,type,message,created_at,consent_at,status,version";
export const MENU_LABEL = "📥 Kelgan murojaatlar";
export const menuKeyboard = {
  keyboard: [[{ text: MENU_LABEL }]],
  resize_keyboard: true,
  is_persistent: true,
};

export function contactButtons(item: AdminMessage) {
  const username = item.telegram_username?.replace(/^@/, "") ?? "";
  return username && TELEGRAM_USERNAME.test(username)
    ? [{ text: "Telegram orqali yozish", url: `https://t.me/${username}` }]
    : [];
}

/** Plain text avoids user-supplied HTML/Markdown being interpreted by Telegram. */
export function contactText(item: AdminMessage) {
  const iso = item.created_at.includes("T")
    ? item.created_at
    : item.created_at.replace(" ", "T") + "Z";
  const date = new Date(iso).toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" });
  return [
    `📩 Murojaat #${item.id}`,
    `Ism: ${item.name}`,
    `${item.contact.includes("@") ? "Aloqa" : "Telefon"}: ${item.contact}`,
    `Telegram: ${item.telegram_username ?? "Eski murojaatda ko‘rsatilmagan"}`,
    ...(item.email ? [`Email: ${item.email}`] : []),
    `Turi: ${item.type}`,
    `Holat: ${messageStatusLabels[item.status] ?? item.status}`,
    `Sana: ${date}`,
    "",
    "Xabar:",
    item.message,
  ].join("\n");
}

export function splitTelegramText(text: string, limit = 3500): string[] {
  const parts: string[] = [];
  let current = "";
  for (const char of text) {
    if (current.length + char.length > limit) {
      parts.push(current);
      current = "";
    }
    current += char;
  }
  if (current) parts.push(current);
  return parts;
}
