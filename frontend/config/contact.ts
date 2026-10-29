// Public contact details supplied by the school administrator. Env values override defaults.
const phone = process.env["NEXT_PUBLIC_SCHOOL_PHONE"]?.trim() || "+998 99 003 03 66";
const email = process.env["NEXT_PUBLIC_SCHOOL_EMAIL"]?.trim() || "khumoyuntojiqulov@gmail.com";
export const SCHOOL_CONTACTS = [
  { label: "Manzil", value: process.env["NEXT_PUBLIC_SCHOOL_ADDRESS"]?.trim() ?? "", href: "" },
  { label: "Telefon", value: phone, href: `tel:${phone.replace(/[^+\d]/g, "")}` },
  { label: "Elektron pochta", value: email, href: `mailto:${email}` },
].filter((contact) => contact.value);
