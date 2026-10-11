import { z } from "zod";
import { imageUrl, postInput, postStatuses } from "@/lib/post-editor";
import type { SchoolLifeItem } from "@/data/types";
export const lifeCategories = ["Tadbir", "To‘garak", "Loyiha", "Faoliyat"] as const;
export const schoolLifeInput = z
  .object({
    title: z.string().trim().min(3).max(200),
    description: z.string().trim().min(10).max(5000),
    category: z.enum(lifeCategories),
    eventDate: postInput.shape.date.nullable(),
    image: imageUrl.nullable(),
    gallery: z.array(imageUrl).max(20),
    status: z.enum(postStatuses),
    version: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
  })
  .strict();
export type SchoolLifeInput = z.infer<typeof schoolLifeInput>;
export type AdminSchoolLife = SchoolLifeItem & {
  status: SchoolLifeInput["status"];
  version: number;
};
