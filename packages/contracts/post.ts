import { z } from "zod";
import type { Post } from "@school/contracts/models";
export const postStatuses = ["draft", "published", "archived"] as const;
export const imageUrl = z
  .string()
  .max(2000)
  .refine((v) => {
    if (/^\/media\/staff\/[a-z0-9-]+\.webp$/.test(v)) return true;
    try {
      const u = new URL(v);
      return u.protocol === "https:" && !u.username && !u.password;
    } catch {
      return false;
    }
  }, "Rasm uchun HTTPS havola yoki saytning xodimlar rasmi manzilini kiriting.");
export const postInput = z
  .object({
    title: z.string().trim().min(3).max(200),
    category: z.enum(["Yangilik", "Tadbir", "E’lon"]),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .refine((v) => {
        const d = new Date(v);
        return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
      }, "Sana noto‘g‘ri."),
    excerpt: z.string().trim().min(3).max(600),
    body: z.array(z.string().trim().min(1).max(3000)).min(1).max(50),
    coverImage: imageUrl.nullable(),
    gallery: z.array(imageUrl).max(10),
    status: z.enum(postStatuses),
    version: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
  })
  .strict();
export type PostInput = z.infer<typeof postInput>;
export type AdminPost = Post & { status: PostInput["status"]; version: number };
