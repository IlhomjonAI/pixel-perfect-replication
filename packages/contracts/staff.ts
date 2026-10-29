import { STAFF_REGISTRY } from "./staff-registry";
import type { Teacher } from "./models";

// Professional data follows the supplied employee registry; portrait paths retain archive names.
const portraits = "/media/staff/";
const subjectCopy: Record<string, string> = {
  Matematika:
    "Mantiqiy fikrlash, masalalarga ijodiy yondashish va bilimni amaliyotda qo‘llash ko‘nikmalarini rivojlantirishga yo‘naltirilgan ta’limga e’tibor qaratadi.",
  "Ingliz tili":
    "Til o‘rganishni erkin muloqot, matnni anglash va o‘z fikrini ravon ifodalash bilan uyg‘unlashtiradigan ta’limga e’tibor qaratadi.",
  "Ona tili":
    "Ona tiliga mehr, savodxonlik, nutq madaniyati va mustaqil fikrni aniq ifodalash ko‘nikmalarini rivojlantirishga e’tibor qaratadi.",
  "Jismoniy tarbiya":
    "Sog‘lom turmush tarzi, jismoniy faollik, intizom va jamoada hamjihat bo‘lishga asoslangan tarbiyaga e’tibor qaratadi.",
  Informatika:
    "Raqamli savodxonlik, algoritmik tafakkur va texnologiyadan maqsadli foydalanish ko‘nikmalarini rivojlantirishga e’tibor qaratadi.",
  Kimyo:
    "Moddalarning xossalarini anglash, ilmiy savollar berish va nazariy bilimni kundalik hayot bilan bog‘lashga e’tibor qaratadi.",
  Tarix:
    "Tarixiy voqealarni tahlil qilish, manbalar bilan ishlash va o‘tmishdan mazmunli xulosa chiqarishga yo‘naltirilgan ta’limga e’tibor qaratadi.",
  Fizika:
    "Tabiat qonunlarini tushunish, kuzatish, izlanish va hodisalarni ilmiy asosda izohlash ko‘nikmalariga e’tibor qaratadi.",
  Biologiya:
    "Tirik tabiatga qiziqish, kuzatuvchanlik va atrof-muhitga mas’uliyatli munosabatni rivojlantirishga e’tibor qaratadi.",
  Geografiya:
    "Dunyo haqidagi tasavvurni kengaytirish, xaritalar bilan ishlash va tabiat hamda jamiyat o‘rtasidagi bog‘liqlikni anglashga e’tibor qaratadi.",
  "Rus tili":
    "Til madaniyati, matn bilan ishlash va o‘z fikrini ravon yetkazishga asoslangan o‘qitishga e’tibor qaratadi.",
};

export const SCHOOL_TEACHERS: Teacher[] = STAFF_REGISTRY.map(({ sourceRow: _sourceRow, ...t }) => ({
  ...t,
  education: "Ma’lumot tez orada qo‘shiladi",
  isDemo: false,
  biography: `${t.name} — ${t.subject.toLowerCase()} yo‘nalishida ta’lim beradigan ${t.qualification.toLowerCase()}. ${subjectCopy[t.subject] ?? "O‘quvchilarning savodxonligi va mustaqil fikrlashini rivojlantirishga e’tibor qaratadi."}`,
  certificateImages: [],
}));

export const SCHOOL_LEADERSHIP = [
  {
    slug: "raximov-javohir",
    name: "Raximov Javohir Ilhomovich",
    role: "Ma’naviy-ma’rifiy ishlar bo‘yicha direktor o‘rinbosari",
    description:
      "Maktabdagi ma’naviy-ma’rifiy ishlar va tarbiyaviy faoliyatni muvofiqlashtiradi. O‘quvchilarning tashabbuslari, mas’uliyati va jamoaviy hamkorligini qo‘llab-quvvatlashga e’tibor qaratadi.",
  },

  {
    slug: "dusmatova-nodira",
    name: "Dusmatova Nadira Zoirkulovna",
    role: "Direktor",
    description:
      "Maktab faoliyatining bosh boshqaruvchisi. Ta’lim-tarbiya jarayonini muvofiqlashtirish, jamoani umumiy maqsad sari birlashtirish va o‘quvchilar uchun sifatli ta’lim muhitini yaratishga rahbarlik qiladi.",
  },
  {
    slug: "maxsudova-maloxat",
    name: "Maxsudova Maloxat Abdulhakimovna",
    role: "O‘quv ishlari bo‘yicha direktor o‘rinbosari",
    description:
      "O‘quv jarayonining izchil va samarali tashkil etilishini muvofiqlashtiradi. Darslar sifati, o‘quv rejalari va ustozlar o‘rtasidagi uslubiy hamkorlikka e’tibor qaratadi.",
  },
  {
    slug: "risbayev-odiljon",
    name: "Risbayev Odiljon Abdumanopovich",
    role: "CHQBT yo‘nalishi",
    description:
      "Chaqiruvga qadar boshlang‘ich tayyorgarlik yo‘nalishida o‘quvchilarning intizomi, mas’uliyati va jamoaviy hamkorligini rivojlantirishga yo‘naltirilgan ta’lim-tarbiya ishlarini olib boradi.",
  },
  {
    slug: "sultonqulova-shahlo",
    name: "Sultonkulova Shahlo Furqatjon qizi",
    role: "Maktab psixologi",
    description:
      "O‘quvchilarning hissiy farovonligi va maktab muhitiga moslashuvini qo‘llab-quvvatlaydi. O‘quvchi, ota-ona va ustozlar o‘rtasida sog‘lom muloqot hamda o‘zaro ishonchni mustahkamlashga ko‘maklashadi.",
  },
  {
    slug: "tojiqulov-xumoyun",
    name: "Tojiqulov Humoyun Yusufjon o‘g‘li",
    role: "Maslahatchi",
    description:
      "Maktab jamoasi va o‘quvchilarga maslahat hamda tashkiliy ko‘mak beradi. Tashabbuslarni qo‘llab-quvvatlash, hamkorlikni rivojlantirish va maktab hayotidagi faol ishtirokni rag‘batlantirishga e’tibor qaratadi.",
  },
].map((person) => ({
  ...person,
  photo: person.slug === "raximov-javohir" ? null : `${portraits}${person.slug}.webp`,
}));
