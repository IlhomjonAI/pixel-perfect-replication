# Bekobod maktabi — Next.js + Node.js

Mavjud dizayn, ommaviy sahifalar va admin panel Next.js App Router bilan ishlaydi.
Alohida Node.js server API, admin sessiyalari, kontent va murojaatlarni boshqaradi.
Ma’lumotlar Node.js SQLite bazasida, yuklangan rasmlar Supabase Storage’da saqlanadi.
Node.js 24 yoki undan yangi versiya kerak.

## Ishga tushirish

```sh
npm ci
npm run dev
```

Sayt: http://localhost:3000. Admin panel: http://localhost:3000/admin.
API ichki manzili: http://127.0.0.1:4000.
Birinchi ishga tushishda migratsiyalar avtomatik qo‘llanadi.
Mavjud .dev.vars faylidagi admin va Supabase sozlamalari saqlanadi va o‘qiladi.
Yangi o‘rnatishda admin hisobini npm run admin:setup orqali yarating.

## Tuzilish

- frontend/app/ — Next.js sahifalari, serverda dastlabki ma’lumot yuklash va metadata.
- frontend/views/ va frontend/components/ — mavjud dizayn va interaktiv interfeys.
- frontend/api/ — Node.js API uchun HTTP mijoz.
- admin/ — kontent, murojaat va rasm boshqaruvi.
- backend/server.ts — alohida Node.js HTTP server.
- backend/api/ — validatsiya, autentifikatsiya va API handlerlari.
- backend/database/ — parametrli SQL so‘rovlari va SQLite ulanishi.
- backend/migrations/ — ketma-ket, ma’lumotlarni saqlovchi SQL migratsiyalari.
- backend/data/school.sqlite — mahalliy baza, Git’ga kiritilmaydi.

## Eski ma’lumotlarni ko‘chirish

Ushbu kompyuterdagi eski mahalliy D1 bazasi yangi SQLite bazaga ko‘chirildi.
Eski .wrangler/state fayllari o‘zgartirilmagan.
Boshqa o‘rnatishda, yangi bazani ishga tushirishdan oldin:

```sh
npm run db:import:legacy
```

Bir nechta eski baza bo‘lsa, buyruqdan keyin -- va aniq fayl manzilini bering.
Import mavjud maqsad bazaning ustiga yozmaydi. Masofaviy D1 ma’lumotlari
avtomatik olinmaydi; ularni alohida eksport qilish kerak.

## Production

```sh
npm run build
npm start
```

Next.js va API birga ishga tushadi. Production domenini .env dagi PUBLIC_ORIGIN
bilan moslang. .env.example namuna sifatida berilgan. API_INTERNAL_URL serverlar
orasidagi ichki manzil; brauzer API’ga Next.js orqali shu domenning /api manzilidan
murojaat qiladi. Baza uchun doimiy disk va muntazam zaxira nusxasi kerak.
Tashqi domen yoki hostingga deploy ushbu migratsiya tarkibida bajarilmagan.

Alohida jarayonlar: npm run dev:frontend, npm run dev:backend,
npm run start:frontend, npm run start:backend.

## Tekshiruv

```sh
npm run check
```

TypeScript, ESLint, frontend va Node SQLite testlari, Next.js production build.
Testlar vaqtinchalik bazalarda ishlaydi; haqiqiy kontent yoki tashqi xizmatlarga yozmaydi.
