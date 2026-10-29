import type { Achievement, Post, SchoolLifeItem, Teacher } from "@school/contracts/models";

export type PostRow = {
  slug: string;
  title: string;
  category: string;
  date: string;
  excerpt: string;
  body: string;
  cover_image: string | null;
  gallery: string;
  is_demo: number;
};

export type AchievementRow = {
  id: string;
  student_name: string;
  class_at_achievement: string;
  type: string;
  title: string;
  subject: string;
  stage: string;
  result: string;
  achievement_date: string;
  teacher_name: string | null;
  certificate_image: string | null;
  is_demo: number;
};

export type TeacherRow = {
  slug: string;
  name: string;
  photo: string | null;
  subject: string;
  qualification: string;
  education: string;
  experience: string;
  biography: string;
  certificates: string;
  certificate_images?: string;
  is_demo: number;
};

export type SchoolLifeRow = {
  id: string;
  title: string;
  description: string;
  image: string | null;
  category?: string;
  event_date?: string | null;
  gallery?: string;
  is_demo: number;
};

function parseStringArray(raw: string): string[] {
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

function parseNullableStringArray(raw: string): (string | null)[] {
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value.map((item) => (typeof item === "string" ? item : null));
  } catch {
    return [];
  }
}

export function mapPostRow(row: PostRow): Post {
  return {
    slug: row.slug,
    title: row.title,
    category: row.category as Post["category"],
    date: row.date,
    excerpt: row.excerpt,
    body: parseStringArray(row.body),
    coverImage: row.cover_image,
    gallery: parseNullableStringArray(row.gallery),
    isDemo: row.is_demo === 1,
  };
}

export function mapAchievementRow(row: AchievementRow): Achievement {
  const achievement: Achievement = {
    id: row.id,
    studentName: row.student_name,
    classAtAchievement: row.class_at_achievement,
    type: row.type as Achievement["type"],
    title: row.title,
    subject: row.subject,
    stage: row.stage as Achievement["stage"],
    result: row.result,
    achievementDate: row.achievement_date,
    certificateImage: row.certificate_image,
    isDemo: row.is_demo === 1,
  };
  if (row.teacher_name) achievement.teacherName = row.teacher_name;
  return achievement;
}

export function mapTeacherRow(row: TeacherRow): Teacher {
  return {
    slug: row.slug,
    name: row.name,
    photo: row.photo,
    subject: row.subject,
    qualification: row.qualification,
    education: row.education,
    experience: row.experience,
    biography: row.biography,
    certificates: parseStringArray(row.certificates),
    certificateImages: parseStringArray(row.certificate_images ?? "[]"),
    isDemo: row.is_demo === 1,
  };
}

export function mapSchoolLifeRow(row: SchoolLifeRow): SchoolLifeItem {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    image: row.image,
    category: row.category ?? "Faoliyat",
    eventDate: row.event_date ?? null,
    gallery: parseStringArray(row.gallery ?? "[]"),
    isDemo: row.is_demo === 1,
  };
}
