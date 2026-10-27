import {
  mapAchievementRow,
  mapPostRow,
  mapSchoolLifeRow,
  mapTeacherRow,
  type AchievementRow,
  type PostRow,
  type SchoolLifeRow,
  type TeacherRow,
} from "@backend/database/mappers";

export const MAX_PAGE_SIZE = 50;
export const MAX_OFFSET = 100_000;

export function getDatabase(env: unknown): Database {
  const db = (env as AppBindings | undefined)?.DB;
  if (!db) throw new Error("Database connection is missing.");
  return db;
}

export function boundPagination(limit = 20, offset = 0) {
  return {
    limit: Number.isFinite(limit) ? Math.min(MAX_PAGE_SIZE, Math.max(1, Math.trunc(limit))) : 20,
    offset: Number.isFinite(offset) ? Math.min(MAX_OFFSET, Math.max(0, Math.trunc(offset))) : 0,
  };
}

const POST_FIELDS = "slug, title, category, date, excerpt, body, cover_image, gallery, is_demo";
const TEACHER_FIELDS =
  "slug, name, photo, subject, qualification, education, experience, biography, certificates, certificate_images, is_demo";
const ACHIEVEMENT_FIELDS =
  "id, student_name, class_at_achievement, type, title, subject, stage, result, achievement_date, teacher_name, certificate_image, is_demo";

export async function listPosts(db: Database, limit = 20, offset = 0) {
  const page = boundPagination(limit, offset);
  const { results } = await db
    .prepare(
      `SELECT ${POST_FIELDS} FROM posts WHERE status = 'published' ORDER BY date DESC, slug ASC LIMIT ? OFFSET ?`,
    )
    .bind(page.limit, page.offset)
    .all<PostRow>();
  return results.map(mapPostRow);
}

export async function getPostBySlug(db: Database, slug: string) {
  const row = await db
    .prepare(`SELECT ${POST_FIELDS} FROM posts WHERE status = 'published' AND slug = ?`)
    .bind(slug)
    .first<PostRow>();
  return row ? mapPostRow(row) : null;
}

export async function listAchievements(db: Database, limit = 20, offset = 0) {
  const page = boundPagination(limit, offset);
  const { results } = await db
    .prepare(
      `SELECT ${ACHIEVEMENT_FIELDS} FROM achievements WHERE status = 'published' ORDER BY achievement_date DESC, id ASC LIMIT ? OFFSET ?`,
    )
    .bind(page.limit, page.offset)
    .all<AchievementRow>();
  return results.map(mapAchievementRow);
}

export async function listTeachers(db: Database, limit = 20, offset = 0) {
  const page = boundPagination(limit, offset);
  const { results } = await db
    .prepare(
      `SELECT ${TEACHER_FIELDS} FROM teachers WHERE status = 'published' ORDER BY name ASC, slug ASC LIMIT ? OFFSET ?`,
    )
    .bind(page.limit, page.offset)
    .all<TeacherRow>();
  return results.map(mapTeacherRow);
}

export async function getTeacherBySlug(db: Database, slug: string) {
  const row = await db
    .prepare(`SELECT ${TEACHER_FIELDS} FROM teachers WHERE status = 'published' AND slug = ?`)
    .bind(slug)
    .first<TeacherRow>();
  return row ? mapTeacherRow(row) : null;
}

export async function listSchoolLife(db: Database, limit = 20, offset = 0) {
  const page = boundPagination(limit, offset);
  const { results } = await db
    .prepare(
      "SELECT id, title, description, image, category, event_date, gallery, is_demo FROM school_life WHERE status = 'published' ORDER BY COALESCE(event_date, '0000-01-01') DESC, id ASC LIMIT ? OFFSET ?",
    )
    .bind(page.limit, page.offset)
    .all<SchoolLifeRow>();
  return results.map(mapSchoolLifeRow);
}
