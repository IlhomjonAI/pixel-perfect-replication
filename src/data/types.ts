export type PostCategory = "Yangilik" | "Tadbir" | "E’lon";

export interface Post {
  slug: string;
  title: string;
  category: PostCategory;
  date: string; // ISO
  excerpt: string;
  body: string[];
  coverImage: string | null; // URL from future Cloudinary storage; null => placeholder
  gallery: (string | null)[];
  isDemo: boolean;
}

export type AchievementType =
  "Fan olimpiadasi" | "STEM" | "Al-Xorazmiy" | "IELTS" | "SAT" | "Milliy sertifikat";

export type CompetitionStage =
  "Maktab" | "Tuman" | "Viloyat" | "Respublika" | "Xalqaro" | "Sertifikat";

export interface Achievement {
  id: string;
  studentName: string;
  classAtAchievement: string;
  type: AchievementType;
  title: string;
  subject: string;
  stage: CompetitionStage;
  result: string;
  achievementDate: string; // ISO
  teacherName?: string;
  certificateImage: string | null;
  isDemo: boolean;
}

export interface Teacher {
  slug: string;
  name: string;
  photo: string | null;
  subject: string;
  qualification: string;
  education: string;
  experience: string;
  biography: string;
  certificates: string[];
  certificateImages?: string[];
  isDemo: boolean;
}

export interface SchoolLifeItem {
  id: string;
  title: string;
  description: string;
  image: string | null;
  isDemo: boolean;
}
