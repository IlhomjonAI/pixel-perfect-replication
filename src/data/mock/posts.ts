import type { Post } from "../types";

const body = [
  "Bu namuna matn. Haqiqiy yangilik matni maktab ma’muriyati tomonidan tez orada qo‘shiladi.",
  "Ushbu bo‘lim yangilikning to‘liq tavsifi, tadbir ishtirokchilari va natijalari haqidagi ma’lumotlar uchun mo‘ljallangan.",
  "Fotosuratlar va qo‘shimcha materiallar tasdiqlangandan so‘ng joylashtiriladi.",
];

export const mockPosts: Post[] = [
  { slug: "namuna-yangi-oquv-yili", title: "Namuna: Yangi o‘quv yili boshlandi", category: "Yangilik", date: "2026-09-02", excerpt: "Yangi o‘quv yilining boshlanishi haqidagi namuna yangilik matni.", body, coverImage: null, gallery: [null, null, null], isDemo: true },
  { slug: "namuna-fan-haftaligi", title: "Namuna: Fan haftaligi tadbiri", category: "Tadbir", date: "2026-09-18", excerpt: "Maktabda o‘tkaziladigan fan haftaligi haqida namuna tavsif.", body, coverImage: null, gallery: [null, null, null], isDemo: true },
  { slug: "namuna-ota-onalar-yigilishi", title: "Namuna: Ota-onalar yig‘ilishi haqida e’lon", category: "E’lon", date: "2026-09-25", excerpt: "Ota-onalar yig‘ilishi bo‘yicha namuna e’lon matni.", body, coverImage: null, gallery: [null, null], isDemo: true },
  { slug: "namuna-robototexnika-togaragi", title: "Namuna: Robototexnika to‘garagi mashg‘uloti", category: "Tadbir", date: "2026-10-01", excerpt: "To‘garak mashg‘ulotlari haqida namuna yangilik.", body, coverImage: null, gallery: [null, null, null], isDemo: true },
  { slug: "namuna-kutubxona-kuni", title: "Namuna: Kitobxonlik kuni", category: "Yangilik", date: "2026-10-05", excerpt: "Kitobxonlik tadbiri haqidagi namuna yangilik matni.", body, coverImage: null, gallery: [null, null], isDemo: true },
  { slug: "namuna-dars-jadvali-elon", title: "Namuna: Dars jadvali o‘zgarishi", category: "E’lon", date: "2026-10-08", excerpt: "Dars jadvalidagi o‘zgarishlar haqida namuna e’lon.", body, coverImage: null, gallery: [null], isDemo: true },
];
