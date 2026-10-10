import type { ContactForm } from "@/lib/contact";
import {
  mapAchievementRow,
  mapPostRow,
  mapSchoolLifeRow,
  mapTeacherRow,
  type AchievementRow,
  type PostRow,
  type SchoolLifeRow,
  type TeacherRow,
} from "@/server/d1-mappers";
import type { Achievement, Post, SchoolLifeItem, Teacher } from "@/data/types";

export function getD1(env: unknown): D1Database {
  const db = (env as CloudflareBindings | undefined)?.DB;
  if (!db) {
    throw new Error("Cloudflare D1 binding `DB` is missing. Check wrangler.toml.");
  }
  return db;
}

export async function listPosts(db: D1Database, limit?: number): Promise<Post[]> {
  const sql =
    limit == null
      ? "SELECT * FROM posts ORDER BY date DESC"
      : "SELECT * FROM posts ORDER BY date DESC LIMIT ?";
  const stmt = limit == null ? db.prepare(sql) : db.prepare(sql).bind(limit);
  const { results } = await stmt.all<PostRow>();
  return results.map(mapPostRow);
}

export async function getPostBySlug(db: D1Database, slug: string): Promise<Post | null> {
  const row = await db.prepare("SELECT * FROM posts WHERE slug = ?").bind(slug).first<PostRow>();
  return row ? mapPostRow(row) : null;
}

export async function listAchievements(db: D1Database, limit?: number): Promise<Achievement[]> {
  const sql =
    limit == null
      ? "SELECT * FROM achievements ORDER BY achievement_date DESC"
      : "SELECT * FROM achievements ORDER BY achievement_date DESC LIMIT ?";
  const stmt = limit == null ? db.prepare(sql) : db.prepare(sql).bind(limit);
  const { results } = await stmt.all<AchievementRow>();
  return results.map(mapAchievementRow);
}

export async function listTeachers(db: D1Database, limit?: number): Promise<Teacher[]> {
  const sql = limit == null ? "SELECT * FROM teachers" : "SELECT * FROM teachers LIMIT ?";
  const stmt = limit == null ? db.prepare(sql) : db.prepare(sql).bind(limit);
  const { results } = await stmt.all<TeacherRow>();
  return results.map(mapTeacherRow);
}

export async function getTeacherBySlug(db: D1Database, slug: string): Promise<Teacher | null> {
  const row = await db
    .prepare("SELECT * FROM teachers WHERE slug = ?")
    .bind(slug)
    .first<TeacherRow>();
  return row ? mapTeacherRow(row) : null;
}

export async function listSchoolLife(db: D1Database): Promise<SchoolLifeItem[]> {
  const { results } = await db.prepare("SELECT * FROM school_life").all<SchoolLifeRow>();
  return results.map(mapSchoolLifeRow);
}

export async function insertContactMessage(db: D1Database, form: ContactForm): Promise<void> {
  await db
    .prepare("INSERT INTO contact_messages (name, contact, type, message) VALUES (?, ?, ?, ?)")
    .bind(form.name.trim(), form.contact.trim(), form.type, form.message.trim())
    .run();
}
