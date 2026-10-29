# Bekobod maktabi — frontend va backend monorepo

Frontend: Next.js App Router, React va TypeScript. Backend: Node.js 24, TypeScript,
`node:http` asosidagi API. Express/NestJS va ORM ishlatilmagan; parametrli SQL
so‘rovlari `pg` drayveri orqali bajariladi. Production bazasi Supabase PostgreSQL,
rasmlar Supabase Storage’da. Mahalliy ishlab chiqishda SQLite ham saqlangan.

## Ishga tushirish

```sh
npm ci
npm run dev
```

Node.js 24+ kerak. Frontend http://localhost:3000, admin /admin,
backend http://127.0.0.1:4000. `DATABASE_URL` yo‘q bo‘lsa, faqat mahalliy rejimda
`backend/data/school.sqlite` ishlaydi. Production SQLite’ga avtomatik qaytmaydi.

Supabase uchun `backend/.env.example`ni `backend/.env`ga nusxalang va haqiqiy
qiymatlarni kiriting. `frontend/.env.example` frontendning alohida namunasidir.
Mavjud ildiz `.env` / `.dev.vars` ham o‘qiladi; hosting environment qiymatlari ustun.
Maxfiy fayllar va bazalar Git’ga qo‘shilmaydi.

## Tuzilish

- `frontend/`: o‘z package.json va tsconfig.json’iga ega Next.js ilova.
- `frontend/admin/`: frontend tarkibidagi admin interfeysi.
- `backend/`: o‘z package.json va tsconfig.json’iga ega mustaqil API jarayoni.
- `backend/api/`: HTTP handlerlar, autentifikatsiya va validatsiya.
- `backend/database/`: PostgreSQL/SQLite adapterlari, so‘rovlar, mapperlar va import.
- `backend/migrations/postgres/`: PostgreSQL uchun alohida migratsiyalar.
- `backend/migrations/*.sql`: avvalgi SQLite migratsiyalari, tarix saqlangan.
- `backend/telegram/`: bot, outbox, eslatmalar va worker lease.
- `packages/contracts/`: ikkala ilova ishlatadigan modellar va Zod validatsiyasi.
- `scripts/`: ikkala jarayonni ishga tushirish va deploy tekshiruvlari.

Npm workspaces: `@school/frontend`, `@school/backend`, `@school/contracts`.
Bir repository va bir root package-lock bor; ilovalar alohida deploy qilinadi.
Backend frontend kodiga bog‘lanmagan. Frontend HTTP API va umumiy contracts’dan foydalanadi.

## Alohida jarayonlar

```sh
npm run dev:frontend
npm run dev:backend
npm run build
npm run build:backend
npm run start:frontend
npm run start:backend
```

Backend build TypeScript’ni tekshiradi; start runtime dependency `tsx` orqali ishlaydi.
Frontend build Next.js production artifact yaratadi.

## PostgreSQL va eski ma’lumotlar

`DATABASE_URL` mavjud bo‘lsa, `pg` connection pool ishlaydi. Backend ishga tushishida
migratsiyalar tranzaksiya bilan bajariladi, so‘ng 25 ustoz bir marta import qilinadi.
Keyingi admin tahrirlari va o‘chirishlari saqlanadi.

Eski SQLite kontentini ko‘chirish uchun yangi PostgreSQL’ga serverni birinchi marta
ishga tushirishdan OLDIN `DATABASE_URL`ni sozlang va ildizdan bajaring:

```sh
npm run db:import:postgres -- "C:/absolute/path/school.sqlite"
```

Manba faqat o‘qiladi. Maqsad bo‘sh bo‘lmasa import bekor qilinadi; barcha yozuvlar
bitta tranzaksiyada ko‘chadi. Tarixiy murojaatlar yangidan Telegramga yuborilmaydi.
Admin sessiyalari va vaqtinchalik limitlar ko‘chirilmaydi. Avval manba zaxirasini oling.
Mavjud rasm URLlari o‘sha Supabase loyiha va bucket saqlansa ishlaydi.

## Rasmlar va matnlar

5 rahbariyat vakili va 25 ustoz portreti `frontend/public/media/staff/`da.
Boshlang‘ich ma’lumot `packages/contracts/staff.ts`da. «Oliy darajadagi ustoz»
taqdimot tavsifi; tasdiqlanmagan diplom, malaka toifasi yoki staj qo‘shilmagan.
Kontaktlar foydalanuvchi iltimosiga ko‘ra hozircha bo‘sh.

## Tekshiruv

```sh
npm run check
```

TypeScript, backend build tekshiruvi, ESLint, API/UI testlari va Next.js production build.
PostgreSQL testlari mahalliy PostgreSQL dvigateli PGlite’da ishlaydi. GitHub CI ayni
testlarni vaqtinchalik PostgreSQL 17 xizmatida `pg` orqali bajaradi.
Testlar Supabase hisobiga yoki haqiqiy SQLite bazasiga yozmaydi.

Deploy: [DEPLOYMENT.md](DEPLOYMENT.md). Backend: [backend/README.md](backend/README.md).
