export interface ContactForm {
  name: string;
  contact: string;
  type: string;
  message: string;
  consent: boolean;
}
export type ContactErrors = Partial<Record<keyof ContactForm, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+?[\d\s()-]{9,}$/;

export function validateContact(f: ContactForm): ContactErrors {
  const e: ContactErrors = {};
  if (f.name.trim().length < 2) e.name = "Ismingizni kiriting.";
  const c = f.contact.trim();
  if (!EMAIL.test(c) && !PHONE.test(c)) e.contact = "To‘g‘ri elektron pochta yoki telefon raqamini kiriting.";
  if (!["Savol", "Taklif", "Hamkorlik", "Boshqa"].includes(f.type)) e.type = "Murojaat turini tanlang.";
  if (f.message.trim().length < 10) e.message = "Xabar kamida 10 ta belgidan iborat bo‘lsin.";
  if (!f.consent) e.consent = "Davom etish uchun roziligingizni tasdiqlang.";
  return e;
}
