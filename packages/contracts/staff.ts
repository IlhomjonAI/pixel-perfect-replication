import type { Teacher } from "./models";

// Names, subjects and roles follow the filenames in the user-supplied school archive.
// Descriptions are editable presentation copy, not claims about degrees or service years.
const portraits = "/media/staff/";
const teacherRows = [
  ["akbaraliyev-jahongir", "Akbaraliyev Jahongir Kamolidinovich", "Matematika"],
  ["akobirxonov-mamatxoja", "Akobirxonov Mamatxo‘ja Anvar o‘g‘li", "Ingliz tili"],
  ["allamuratova-nafosat", "Allamuratova Nafosat Amonovna", "Ingliz tili"],
  ["axmedov-saidjon", "Axmedov Saidjon Xusanovich", "Matematika"],
  ["boltaboyeva-zulfiya", "Boltaboyeva Zulfiya Abdukadirovna", "Ona tili"],
  ["dadajonov-salohiddin", "Dadajonov Salohiddin Abduraufovich", "Jismoniy tarbiya"],
  ["dexqonov-azizbek", "Dexqonov Azizbek Abdulxakimovich", "Informatika"],
  ["dexqonova-nasiba", "Dexqonova Nasiba Achilbayevna", "Kimyo"],
  ["djurayev-elyor", "Djurayev Elyor Valijonovich", "Tarix"],
  ["elmuratov-vohid", "Elmuratov Vohid Ro‘ziboyevich", "Kimyo"],
  ["qirgizboyeva-marxabo", "Qirg‘izboyeva Marxabo Ibragimovna", "Fizika"],
  ["husanboyeva-dilfuza", "Husanboyeva Dilfuza Abdumalikovna", "Ona tili"],
  ["kamolov-rufat", "Kamolov Rufat Subhonqul o‘g‘li", "Biologiya"],
  ["abduxoliqov-behzod", "Abduxoliqov Behzod G‘ayratovich", "Matematika"],
  ["urozaliyev-farxod", "Urozaliyev Farxod Muxammatkarimovich", "Matematika"],
  ["maxmutaliyev-abrorjon", "Maxmutaliyev Abrorjon Saxobiddin o‘g‘li", "Matematika"],
  ["nazarova-etibor", "Nazarova E’tibor Shokirovna", "Rus tili"],
  ["rasuljonov-murodali", "Rasuljonov Murodali Dilshodjonovich", "Biologiya"],
  ["raxmonqulov-rustam", "Raxmonqulov Rustam Solijon o‘g‘li", "Geografiya"],
  ["safarov-sohibjon", "Safarov Sohibjon G‘ulomjonovich", "Fizika"],
  ["sattorov-ziyoviddin", "Sattorov Ziyoviddin Sotiboldiyevich", "Matematika"],
  ["sultonov-eldor", "Sultonov Eldor Parxatbekovich", "Informatika"],
  ["usmonova-gulmira", "Usmonova Gulmira Hakimovna", "Tarix"],
  ["vasidov-jamshid", "Vasidov Jamshid Axmadaliyevich", "Ingliz tili"],
  ["xalvachi-yuliya", "Xalvachi Yuliya Shukriyevna", "Rus tili"],
] as const;

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

export const SCHOOL_TEACHERS: Teacher[] = teacherRows.map(([slug, name, subject]) => ({
  slug,
  name,
  subject,
  photo: `${portraits}${slug}.webp`,
  qualification: "Oliy darajadagi ustoz",
  education: "Ma’lumot tez orada qo‘shiladi",
  experience: "Kasbiy faoliyat tafsilotlari keyinroq to‘ldiriladi",
  biography: `${name} — ${subject.toLocaleLowerCase("uz")} fani bo‘yicha maktabimizning oliy darajadagi ustozlaridan biri. ${subjectCopy[subject]} Har bir o‘quvchining imkoniyatini ochish, izlanishga undash va bilimga bo‘lgan ishonchini mustahkamlash — ustoz faoliyatining bosh yo‘nalishi.`,
  certificates: [],
  certificateImages: [],
  isDemo: false,
}));

export const SCHOOL_LEADERSHIP = [
  {
    slug: "dusmatova-nodira",
    name: "Dusmatova Nodira Zairkulovna",
    role: "Direktor",
    description:
      "Maktab faoliyatining bosh boshqaruvchisi. Ta’lim-tarbiya jarayonini muvofiqlashtirish, jamoani umumiy maqsad sari birlashtirish va o‘quvchilar uchun sifatli ta’lim muhitini yaratishga rahbarlik qiladi.",
  },
  {
    slug: "maxsudova-maloxat",
    name: "Maxsudova Maloxat Abdulakimovna",
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
    name: "Sultonqulova Shahlo Furqat qizi",
    role: "Maktab psixologi",
    description:
      "O‘quvchilarning hissiy farovonligi va maktab muhitiga moslashuvini qo‘llab-quvvatlaydi. O‘quvchi, ota-ona va ustozlar o‘rtasida sog‘lom muloqot hamda o‘zaro ishonchni mustahkamlashga ko‘maklashadi.",
  },
  {
    slug: "tojiqulov-xumoyun",
    name: "Tojiqulov Xumoyun Yusufjon o‘g‘li",
    role: "Maslahatchi",
    description:
      "Maktab jamoasi va o‘quvchilarga maslahat hamda tashkiliy ko‘mak beradi. Tashabbuslarni qo‘llab-quvvatlash, hamkorlikni rivojlantirish va maktab hayotidagi faol ishtirokni rag‘batlantirishga e’tibor qaratadi.",
  },
].map((person) => ({ ...person, photo: `${portraits}${person.slug}.webp` }));
