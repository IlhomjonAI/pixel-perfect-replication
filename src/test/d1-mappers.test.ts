import { describe, expect, it } from "vitest";
import {
  mapAchievementRow,
  mapPostRow,
  mapSchoolLifeRow,
  mapTeacherRow,
} from "@/server/d1-mappers";

describe("D1 row mappers", () => {
  it("maps a post row including JSON body and gallery", () => {
    const post = mapPostRow({
      slug: "namuna",
      title: "Namuna",
      category: "Yangilik",
      date: "2026-09-02",
      excerpt: "Qisqa matn",
      body: '["Birinchi","Ikkinchi"]',
      cover_image: null,
      gallery: '["https://img.test/a.jpg",null]',
      is_demo: 1,
    });
    expect(post.body).toEqual(["Birinchi", "Ikkinchi"]);
    expect(post.gallery).toEqual(["https://img.test/a.jpg", null]);
    expect(post.coverImage).toBeNull();
    expect(post.isDemo).toBe(true);
  });

  it("omits teacherName when the achievement row has none", () => {
    const achievement = mapAchievementRow({
      id: "a1",
      student_name: "Ali",
      class_at_achievement: "10-sinf",
      type: "IELTS",
      title: "IELTS",
      subject: "Ingliz tili",
      stage: "Sertifikat",
      result: "7.0",
      achievement_date: "2026-02-20",
      teacher_name: null,
      certificate_image: null,
      is_demo: 0,
    });
    expect(achievement.teacherName).toBeUndefined();
    expect(achievement.isDemo).toBe(false);
  });

  it("maps teacher certificates JSON", () => {
    const teacher = mapTeacherRow({
      slug: "ali",
      name: "Ali",
      photo: null,
      subject: "Matematika",
      qualification: "Magistr",
      education: "NUU",
      experience: "10 yil",
      biography: "Tarjimai hol",
      certificates: '["C1","C2"]',
      is_demo: 0,
    });
    expect(teacher.certificates).toEqual(["C1", "C2"]);
  });

  it("maps school life rows", () => {
    const item = mapSchoolLifeRow({
      id: "stem",
      title: "STEM",
      description: "Loyihalar",
      image: null,
      is_demo: 1,
    });
    expect(item.id).toBe("stem");
    expect(item.isDemo).toBe(true);
  });
});
