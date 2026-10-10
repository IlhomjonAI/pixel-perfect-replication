/**
 * Published news comes from D1 through server functions. Other resources
 * retain demo data until their management screens are implemented.
 */
import { mockAchievements } from "@/data/mock/achievements";
import { getPostsPage, getDatabasePost } from "@/lib/news-api";
import { mockSchoolLife, mockTeachers } from "@/data/mock/teachers";
import type { Achievement, Post, SchoolLifeItem, Teacher } from "@/data/types";

const byDateDesc = <T extends { date?: string; achievementDate?: string }>(a: T, b: T) =>
  (b.date ?? b.achievementDate ?? "").localeCompare(a.date ?? a.achievementDate ?? "");

export async function getPosts(limit = 50): Promise<Post[]> {
  return getPostsPage(limit);
}
export async function getPost(slug: string): Promise<Post | null> {
  return getDatabasePost(slug);
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
