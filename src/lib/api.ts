/**
 * Published news and achievements use D1. Teachers and school-life retain
 * demo data until their management screens are implemented.
 */
import { getAchievementsPage } from "@/lib/achievement-api";
import { getPostsPage, getDatabasePost } from "@/lib/news-api";
import { mockSchoolLife, mockTeachers } from "@/data/mock/teachers";
import type { Achievement, Post, SchoolLifeItem, Teacher } from "@/data/types";

export async function getPosts(limit = 50): Promise<Post[]> {
  return getPostsPage(limit);
}
export async function getPost(slug: string): Promise<Post | null> {
  return getDatabasePost(slug);
}
export async function getAchievements(limit = 12): Promise<Achievement[]> {
  return (await getAchievementsPage({ limit })).items;
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
