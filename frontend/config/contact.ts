// Public contact values are compiled at build time. Redeploy after changing them.
export const SCHOOL_CONTACTS = [
  { label: "Manzil", value: process.env["NEXT_PUBLIC_SCHOOL_ADDRESS"]?.trim() ?? "", href: "" },
  {
    label: "Telefon",
    value: process.env["NEXT_PUBLIC_SCHOOL_PHONE"]?.trim() ?? "",
    href: process.env["NEXT_PUBLIC_SCHOOL_PHONE"]
      ? `tel:${process.env["NEXT_PUBLIC_SCHOOL_PHONE"].replace(/[^+\d]/g, "")}`
      : "",
  },
  {
    label: "Elektron pochta",
    value: process.env["NEXT_PUBLIC_SCHOOL_EMAIL"]?.trim() ?? "",
    href: process.env["NEXT_PUBLIC_SCHOOL_EMAIL"]
      ? `mailto:${process.env["NEXT_PUBLIC_SCHOOL_EMAIL"].trim()}`
      : "",
  },
].filter((contact) => contact.value);
