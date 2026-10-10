/**
 * Data-access layer. Today it reads typed mock data; later each function can
 * call the Cloudflare Workers API (backed by D1 / Cloudinary) without any
 * change to pages or components.
 */
import { mockAchievements } from "@/data/mock/achievements";
import { mockPosts } from "@/data/mock/posts";
import { mockSchoolLife, mockTeachers } from "@/data/mock/teachers";
import type { Achievement, Post, SchoolLifeItem, Teacher } from "@/data/types";

const byDateDesc = <T extends { date?: string; achievementDate?: string }>(a: T, b: T) =>
  (b.date ?? b.achievementDate ?? "").localeCompare(a.date ?? a.achievementDate ?? "");

export async function getPosts(limit?: number): Promise<Post[]> {
  const list = [...mockPosts].sort(byDateDesc);
  return limit ? list.slice(0, limit) : list;
}
export async function getPost(slug: string): Promise<Post | null> {
  return mockPosts.find((p) => p.slug === slug) ?? null;
}
export async function getAchievements(limit?: number): Promise<Achievement[]> {
  const list = [...mockAchievements].sort(byDateDesc);
  return limit ? list.slice(0, limit) : list;
}
export async function getTeachers(limit?: number): Promise<Teacher[]> {
  return limit ? mockTeachers.slice(0, limit) : mockTeachers;
}
export async function getTeacher(slug: string): Promise<Teacher | null> {
  return mockTeachers.find((t) => t.slug === slug) ?? null;
}
export async function getSchoolLife(): Promise<SchoolLifeItem[]> {
  return mockSchoolLife;
}
