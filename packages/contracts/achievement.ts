import { z } from "zod";
import { imageUrl, postInput, postStatuses } from "@school/contracts/post";
import type { Achievement } from "@school/contracts/models";
export const achievementTypes = [
  "Fan olimpiadasi",
  "STEM",
  "Al-Xorazmiy",
  "IELTS",
  "SAT",
  "Milliy sertifikat",
] as const;
export const achievementStages = [
  "Maktab",
  "Tuman",
  "Viloyat",
  "Respublika",
  "Xalqaro",
  "Sertifikat",
] as const;
export const isCertificate = (type: string) => ["IELTS", "SAT", "Milliy sertifikat"].includes(type);
export const achievementInput = z
  .object({
    studentName: z.string().trim().min(2).max(150),
    classAtAchievement: z.string().trim().min(1).max(30),
    type: z.enum(achievementTypes),
    title: z.string().trim().min(3).max(200),
    subject: z.string().trim().min(2).max(100),
    stage: z.enum(achievementStages),
    result: z.string().trim().min(1).max(200),
    achievementDate: postInput.shape.date,
    teacherName: z.string().trim().min(2).max(150).nullable(),
    certificateImage: imageUrl.nullable(),
    status: z.enum(postStatuses),
    version: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
  })
  .strict()
  .refine((v) => (isCertificate(v.type) ? v.stage === "Sertifikat" : v.stage !== "Sertifikat"), {
    message: "Sertifikat va olimpiada bosqichlarini mos tanlang.",
    path: ["stage"],
  });
export type AchievementInput = z.infer<typeof achievementInput>;
export type AdminAchievement = Achievement & {
  status: AchievementInput["status"];
  version: number;
};
export const achievementQuery = z.object({
  limit: z.number().int().min(1).max(50).default(12),
  offset: z.number().int().min(0).max(100000).default(0),
  year: z
    .string()
    .regex(/^\d{4}$/)
    .optional(),
  subject: z.string().min(1).max(100).optional(),
  type: z.enum(achievementTypes).optional(),
  stage: z.enum(achievementStages).optional(),
});
export type AchievementQuery = z.infer<typeof achievementQuery>;
