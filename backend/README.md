# Backend: Node.js + TypeScript + PostgreSQL

## Texnologiyalar

Node.js 24 standart `node:http` serveri ishlatiladi. Express yoki NestJS yo‘q.
Transport Request/Response obyektlariga o‘girilib, `api/handler.ts` yo‘llarni tegishli
handlerga yuboradi. SQL parametrli, ORM yo‘q; PostgreSQL drayveri `pg`, validatsiya Zod.
Frontend — alohida Next.js ilova; admin frontend ichida. Umumiy modellar va
validatsiya `packages/contracts/`da. Backend frontendni import qilmaydi.

## Bazalar va ulanish

Production: Supabase PostgreSQL. `DATABASE_URL` bo‘lsa `database/postgres.ts`
connection pool ishlaydi. `DATABASE_POOL_MAX` sukut bo‘yicha 5, chegarasi 1–20.
TLS sertifikat tekshiruvi yoqilgan; zarur bo‘lsa Supabase CA sertifikatini
`DATABASE_CA_CERT` orqali bering. TLS tekshiruvini o‘chirmang.

Faqat mahalliy rejimda DATABASE_URL bo‘lmasa `node:sqlite` ishlaydi.
Eski `backend/data/school.sqlite` saqlanadi. Production yoki Render’da
DATABASE_URL bo‘lmasa server aniq xato bilan to‘xtaydi.

Supabase PostgreSQL va Supabase Storage boshqa xizmatlar: DATABASE_URL baza uchun,
SUPABASE_URL/SECRET_KEY esa rasm yuklash uchun. Supabase Auth ishlatilmaydi;
admin autentifikatsiyasi backendning o‘zida.

## Qatlamlar

1. `server.ts`: HTTP transporti, ishonchli proksi, startup va graceful shutdown.
2. `api/`: yo‘llar, origin, sessiya, body hajmi, Zod va versiya tekshiruvi.
3. `database/queries.ts`, `achievement-page.ts`: kontent, filtr va pagination.
4. `database/mappers.ts`: DB qatorlarini API modellariga o‘girish.
5. `database/postgres.ts`: pool, parametrlar, tranzaksiyalar va migratsiyalar.
6. `telegram/`: xabar navbati, polling, worker lease va kundalik eslatma.
7. `lib/`: proksi, deploy tekshiruvi va mahalliy SQLite backup/restore.

## Saqlanadigan ma’lumotlar

- `posts`: yangiliklar, matnlar, muqova va galereya.
- `teachers`: ustozlar, fanlar, tavsiflar va sertifikat havolalari.
- `achievements`: o‘quvchilar yutuqlari.
- `school_life`: maktab hayoti va tadbirlar.
- `contact_messages`: murojaat, aloqa, rozilik, holat, request_id va versiya.
- `admin_sessions`: token xeshlari va sessiya muddati.
- `*_limits`: login, murojaat va rasm yuklash limitlari.
- `image_assets`: Supabase Storage rasmlari metama’lumoti.
- `telegram_outbox`, `telegram_state`, `telegram_worker_lock`: yetkazish va bot holati.
- `recycle_bin`, `restore_bin`: o‘chirilgan yozuvlar va atomar tiklash.
- `schema_migrations`, `content_imports`: migratsiya va boshlang‘ich importlar.

Jadvallar alohida `school_app` schemasida. PUBLIC rolining schema huquqlari
bekor qilingan. Uni Supabase Data API exposed schemas ro‘yxatiga qo‘shmang.
Brauzer backend orqali ishlaydi; bazaning maxfiy kalitini olmaydi.

## Xatti-harakatlar

HttpOnly/SameSite=Strict cookie; HTTPS’da Secure. Parol PBKDF2 xeshi bilan
tekshiriladi, session tokenlari bazada xeshlangan. Yozish so‘rovlari Origin’ni
tekshiradi. Vercel–Render proksisi umumiy maxfiy kalit va ishonchli IP ishlatadi.
Parallel tahrirlash `version` orqali 409 qaytaradi. Request ID takroriy murojaatni
oldini oladi. Contact insert va Telegram navbati DB triggeri orqali atomar.
O‘chirish savatga nusxa oladi; tiklash ham tranzaksion.

## API

- GET `/api/health`: baza tayyorligi.
- GET `/api/posts`, `/api/posts/:slug`: nashr qilingan yangiliklar.
- GET `/api/teachers`, `/api/teachers/:slug`: ustozlar.
- GET `/api/achievements`, `/api/achievement-page`, `/api/achievement-filters`: yutuqlar.
- GET `/api/school-life`: tadbirlar.
- POST `/api/contact`: idempotent murojaat.
- `/api/admin/login`, `/api/admin/logout`, `/api/admin/session`: autentifikatsiya.
- `/api/admin/posts`, `/api/admin/teachers`, `/api/admin/achievements`,
  `/api/admin/school-life`, `/api/admin/messages`: boshqaruv.
- POST `/api/admin/uploads`: Supabase Storage’ga rasm yuklash.
- GET `/api/admin/trash`, POST `/api/admin/trash/:id/restore`: savat va tiklash.

## Buyruqlar va import

Ildizdan `npm run dev:backend`, `npm run start:backend`, `npm run build:backend`,
`npm run db:migrate`. Backend papkasida `npm run dev`, `npm start`, `npm run db:migrate`.
Bir repository package-lock va umumiy contracts workspace’dan foydalaniladi.

SQLite’dan import: `npm run db:import:postgres -- ABSOLUTE_SQLITE_PATH`, yangi bo‘sh
PostgreSQL’da, serverning birinchi startup’idan oldin. Import sessiyalar, cheklovlar
va bot worker holatini ko‘chirmaydi; tarixiy murojaatlar qayta yuborilmaydi.

PostgreSQL backup: Supabase backup rejasi yoki tashqi scheduled `pg_dump`.
SQLite’ning `backup:create` buyrug‘i PostgreSQL uchun ishlamaydi, aniq xato qaytaradi.
Bu o‘zgarish Supabase’da backup jadvalini avtomatik yaratmaydi. Storage obyektlari
uchun ham alohida nusxa kerak.

Hosting: [DEPLOYMENT.md](../DEPLOYMENT.md). Bot: [telegram/README.md](telegram/README.md).
