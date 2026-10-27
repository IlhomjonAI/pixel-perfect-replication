import { z } from "zod";
import { imageUrl, postStatuses } from "@backend/contracts/post";
import type { Teacher } from "@backend/contracts/models";
export const teacherInput = z
  .object({
    name: z.string().trim().min(2).max(150),
    photo: imageUrl.nullable(),
    subject: z.string().trim().min(2).max(100),
    qualification: z.string().trim().min(2).max(200),
    education: z.string().trim().min(2).max(500),
    experience: z.string().trim().min(1).max(200),
    biography: z.string().trim().min(10).max(5000),
    certificates: z.array(z.string().trim().min(1).max(200)).max(20),
    certificateImages: z.array(imageUrl).max(20),
    status: z.enum(postStatuses),
    version: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
  })
  .strict();
export type TeacherInput = z.infer<typeof teacherInput>;
export type AdminTeacher = Teacher & { status: TeacherInput["status"]; version: number };
