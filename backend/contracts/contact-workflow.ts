import { z } from "zod";
import { validateContact, normalizeTelegramUsername } from "@backend/contracts/contact";
export const messageStatuses = ["new", "in_progress", "resolved"] as const;
export const messageStatusLabels = {
  new: "Yangi",
  in_progress: "Ko‘rib chiqilmoqda",
  resolved: "Javob berildi",
};
export const contactInput = z
  .object({
    name: z.string().trim().min(2).max(150),
    contact: z.string().trim().min(1).max(254),
    telegramUsername: z.string().trim().max(33),
    email: z.string().trim().max(254).default(""),
    type: z.enum(["Savol", "Taklif", "Hamkorlik", "Boshqa"]),
    message: z.string().trim().min(10).max(5000),
    consent: z.literal(true),
    requestId: z.string().uuid(),
  })
  .strict()
  .refine((v) => Object.keys(validateContact(v)).length === 0, "Murojaat maydonlari noto‘g‘ri.")
  .transform((v) => ({ ...v, telegramUsername: normalizeTelegramUsername(v.telegramUsername) }));
export const messageUpdate = z
  .object({
    status: z.enum(messageStatuses),
    version: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
  })
  .strict();
export interface AdminMessage {
  id: number;
  name: string;
  contact: string;
  telegram_username?: string | null;
  email?: string | null;
  type: string;
  message: string;
  created_at: string;
  consent_at: string | null;
  status: (typeof messageStatuses)[number];
  version: number;
}
