/** Published school content uses Cloudflare D1. */
import { getAchievementsPage } from "@/lib/achievement-api";
import { getPostsPage, getDatabasePost } from "@/lib/news-api";
import { getTeachersPage, getDatabaseTeacher } from "@/lib/teacher-api";
import { getSchoolLifePage } from "@/lib/school-life-api";
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
export async function getTeachers(limit = 50): Promise<Teacher[]> {
  return getTeachersPage(limit);
}
export async function getTeacher(slug: string): Promise<Teacher | null> {
  return getDatabaseTeacher(slug);
}
export async function getSchoolLife(limit = 20): Promise<SchoolLifeItem[]> {
  return getSchoolLifePage(limit);
}
