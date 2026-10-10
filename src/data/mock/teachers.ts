import type { SchoolLifeItem, Teacher } from "../types";

const pending = "Ma’lumot tez orada qo‘shiladi";

const make = (n: number, subject: string): Teacher => ({
  slug: `namuna-oqituvchi-${n}`,
  name: `Namuna o‘qituvchi ${n}`,
  photo: null,
  subject,
  qualification: pending,
  education: pending,
  experience: pending,
  biography: "Bu namuna profil. O‘qituvchining tasdiqlangan tarjimai holi keyinroq qo‘shiladi.",
  certificates: [],
  isDemo: true,
});

export const mockTeachers: Teacher[] = [
  make(1, "Matematika"),
  make(2, "Fizika"),
  make(3, "Informatika"),
  make(4, "Kimyo"),
  make(5, "Ingliz tili"),
  make(6, "Ona tili va adabiyot"),
];

export const mockSchoolLife: SchoolLifeItem[] = [
  { id: "stem", title: "STEM", description: "Namuna: tabiiy fanlar va muhandislik loyihalari.", image: null, isDemo: true },
  { id: "robot", title: "Robototexnika", description: "Namuna: robotlar yig‘ish va dasturlash mashg‘ulotlari.", image: null, isDemo: true },
  { id: "eng", title: "Ingliz tili", description: "Namuna: nutq klubi va til ko‘nikmalarini rivojlantirish.", image: null, isDemo: true },
  { id: "proj", title: "Loyihalar", description: "Namuna: o‘quvchilarning tadqiqot va ijodiy loyihalari.", image: null, isDemo: true },
];
