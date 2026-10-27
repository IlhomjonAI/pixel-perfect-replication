export interface ContactForm {
  name: string;
  contact: string;
  telegramUsername: string;
  email: string;
  type: string;
  message: string;
  consent: boolean;
}
export type ContactErrors = Partial<Record<keyof ContactForm, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidPhone(input: string): boolean {
  const digits = input.replace(/[\s()-]/g, "");
  const withPlus = digits.replace(/^\+/, "");
  if (!/^\d{9,15}$/.test(withPlus)) return false;
  return true;
}

export const TELEGRAM_USERNAME = /^@?[a-zA-Z][a-zA-Z0-9_]{4,31}$/;
export const normalizeTelegramUsername = (value: string) => "@" + value.trim().replace(/^@/, "");

export function validateContact(f: ContactForm): ContactErrors {
  const e: ContactErrors = {};
  if (f.name.trim().length < 2 || f.name.trim().length > 150) e.name = "Ismingizni kiriting.";
  const c = f.contact.trim();
  if (c.length > 30 || !isValidPhone(c))
    e.contact = "To‘g‘ri telefon raqamini kiriting. Masalan: +998 90 123 45 67.";
  if (!TELEGRAM_USERNAME.test(f.telegramUsername.trim()))
    e.telegramUsername = "Telegram username’ingizni kiriting. Masalan: @ali_valiyev (5–32 belgi).";
  if (f.email.trim() && (f.email.trim().length > 254 || !EMAIL.test(f.email.trim())))
    e.email = "To‘g‘ri elektron pochta manzilini kiriting yoki maydonni bo‘sh qoldiring.";
  if (!["Savol", "Taklif", "Hamkorlik", "Boshqa"].includes(f.type))
    e.type = "Murojaat turini tanlang.";
  if (f.message.trim().length < 10 || f.message.trim().length > 5000)
    e.message = "Xabar kamida 10 ta belgidan iborat bo‘lsin.";
  if (!f.consent) e.consent = "Davom etish uchun roziligingizni tasdiqlang.";
  return e;
}
