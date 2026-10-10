export const SCHOOL_NAME = "Bekobod tuman ixtisoslashtirilgan maktabi";
export const TELEGRAM_URL = "https://t.me/piima_bekobodtumani";
export const ARIZA_URL = "https://ariza.piima.uz";
export const PENDING = "Ma’lumot tez orada qo‘shiladi";

export const NAV = [
  { to: "/", label: "Bosh sahifa" },
  { to: "/maktab", label: "Maktab haqida" },
  { to: "/yangiliklar", label: "Yangiliklar" },
  { to: "/yutuqlar", label: "Yutuqlar" },
  { to: "/oqituvchilar", label: "O‘qituvchilar" },
  { to: "/qabul", label: "Qabul" },
] as const;

const MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];

export function formatDate(iso: string): string {
  const parts = iso.split("-").map(Number);
  const y = parts[0];
  const m = parts[1];
  const d = parts[2];
  if (y === undefined || m === undefined || d === undefined) {
    return iso;
  }
  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) {
    return iso;
  }
  if (m < 1 || m > 12 || d < 1 || d > 31) {
    return iso;
  }
  const month = MONTHS[m - 1];
  return `${d}-${month ?? iso}, ${y}`;
}

export function pageHead(title: string, description: string) {
  const t = `${title} — ${SCHOOL_NAME}`;
  return {
    meta: [
      { title: t },
      { name: "description", content: description },
      { property: "og:title", content: t },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  };
}
