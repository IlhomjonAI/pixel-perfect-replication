export interface ContactForm {
  name: string;
  contact: string;
  type: string;
  message: string;
  consent: boolean;
}
export type ContactErrors = Partial<Record<keyof ContactForm, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidPhone(input: string): boolean {
  const digits = input.replace(/[\s()-]/g, "");
  const withPlus = digits.replace(/^\+/, "");
  if (!/^\d{9,15}$/.test(withPlus)) return false;
  return true;
}

export function validateContact(f: ContactForm): ContactErrors {
  const e: ContactErrors = {};
  if (f.name.trim().length < 2 || f.name.trim().length > 150) e.name = "Ismingizni kiriting.";
  const c = f.contact.trim();
  if (c.length > 254 || (!EMAIL.test(c) && !isValidPhone(c)))
    e.contact = "To‘g‘ri elektron pochta yoki telefon raqamini kiriting.";
  if (!["Savol", "Taklif", "Hamkorlik", "Boshqa"].includes(f.type))
    e.type = "Murojaat turini tanlang.";
  if (f.message.trim().length < 10 || f.message.trim().length > 5000)
    e.message = "Xabar kamida 10 ta belgidan iborat bo‘lsin.";
  if (!f.consent) e.consent = "Davom etish uchun roziligingizni tasdiqlang.";
  return e;
}
