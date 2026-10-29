# Vercel frontend + Render backend + Supabase PostgreSQL

## Arxitektura

Brauzer → Vercel Next.js va /api proksi → Render Node.js API → Supabase PostgreSQL.
Rasmlar Supabase Storage’da; Telegram worker Render jarayonida.

Render’da **Web Service** ishlatiladi, bu boshqariladigan hosting xizmatidir.
Alohida VPS olish shart emas. Backendni Node.js 24 o‘rnatilgan VPS’da ham ishlatish
mumkin. Baza Supabase’da bo‘lgani uchun Render’da doimiy SQLite disk kerak emas.

## 1. Supabase

Connect menyusidan connection string oling. IPv4 tarmoq uchun **Session pooler**
(odatda port 5432), IPv6 mavjud bo‘lsa direct connection mos.
Transaction pooler manzilini session manzili deb almashtirib yozmang.

DATABASE_URL faqat backendda saqlanadi. Paroldagi maxsus belgilarni URL-encode qiling.
Host va username’ni aynan Dashboard’dan oling. TLS tekshiruvi yoqilgan. Kerak bo‘lsa
Supabase CA sertifikatini DATABASE_CA_CERT’ga PEM matni sifatida kiriting
(haqiqiy yangi qator yoki literal `\n` qo‘llanadi).

Migratsiyalar `school_app` schemasini yaratadi. Uni Data API exposed schemas’ga
qo‘shmang. Frontendga DATABASE_URL yoki Supabase secret key bermang.
Rasm yuklash uchun SUPABASE_URL, SUPABASE_SECRET_KEY va public school-images bucket
ham kerak. Baza connection string’i Storage kalitining o‘rnini bosmaydi.

## 2. Eski kontentni ko‘chirish

SQLite’dagi yangiliklar, yutuqlar, murojaatlar va admin tahrirlarini saqlash kerak
bo‘lsa, backendni yangi bazaga birinchi marta ishga tushirishdan OLDIN:

1. Manba SQLite va rasmlarning zaxirasini oling.
2. backend/.env’da DATABASE_URL kiriting; maqsad yangi/bo‘sh school_app bo‘lsin.
3. Ildizdan `npm run db:import:postgres -- "C:/absolute/path/school.sqlite"` bajaring.
4. Jadval bo‘yicha qaytgan sonlarni tekshiring, so‘ng Render serverini ishga tushiring.

Import manbani o‘zgartirmaydi, maqsadni bitta tranzaksiyada to‘ldiradi. U yerda
kontent mavjud bo‘lsa to‘xtaydi. Avtomatik teacher seed oldin ishga tushsa ham
bo‘sh baza talabi buziladi. Import hech narsani o‘chirib tozalab bermaydi.
Sessiyalar va vaqtinchalik limitlar ko‘chmaydi. Tarixiy Telegram xabarlari qayta
yuborilmaydi. Saqlangan rasm URLlari o‘sha Supabase bucket saqlansa ishlaydi.

Eski kontent kerak bo‘lmasa importni o‘tkazing: backend 25 ustozni bir marta yaratadi.
Keyingi admin tahrirlari va o‘chirishlar qayta startup’da saqlanadi.

## 3. Render

GitHub repository’dagi `full-redesign` branchni ulang. `render.yaml` Blueprint yoki
repository root’dan Node Web Service yarating. Build:
`npm ci --include=dev && npm run build:backend && npm run deploy:check -- backend`.
Start: `npm run start:backend`. Node 24.x, API_HOST=0.0.0.0, health /api/health.
Render PORT qiymatini beradi. Root Directory’ni backend qilmang: umumiy
packages/contracts va root package-lock ham build kontekstida bo‘lishi kerak.

Environment:

- DATABASE_URL: Supabase session pooler yoki direct PostgreSQL manzili.
- DATABASE_POOL_MAX=5.
- PUBLIC_ORIGIN: Vercelning aniq production HTTPS origini, pathsiz.
- API_PROXY_SECRET: kamida 32 belgili tasodifiy kalit, Vercel bilan bir xil.
- ADMIN_PASSWORD_HASH: `npm run admin:setup` orqali olingan PBKDF2 xeshi.
- SUPABASE_URL, SUPABASE_SECRET_KEY, SUPABASE_STORAGE_BUCKET=school-images.
- BACKUP_ENABLED=false: SQLite backup worker’i PostgreSQL’da ishlatilmaydi.
- TELEGRAM_BOT_TOKEN va TELEGRAM_ADMIN_ID; bot kerak bo‘lmasa TELEGRAM_ENABLED=false.
- DATABASE_CA_CERT: kerak bo‘lsa Supabase CA sertifikati.

Mahalliy Telegram pollerini o‘chiring; bir tokenni alohida bazali ikki joyda polling
qilmang. Maxfiy qiymatlarni faqat hosting environment sozlamalariga kiriting.

## 4. Vercel

Shu repository va full-redesign branch. Root Directory frontend; tashqi papkadagi
source fayllarni buildga qo‘shish yoqilgan bo‘lsin. Node 24.x.
frontend/vercel.json root’da npm ci va frontend workspace buildini bajaradi.

Server-only environment:

- API_INTERNAL_URL: Render HTTPS origini, /api qo‘shimchasiz.
- API_PROXY_SECRET: Renderdagi aynan bir xil kalit.

Proksi cookie va originni saqlaydi. Production backend faqat PUBLIC_ORIGIN bilan
yozishga ruxsat beradi; preview’da tahrir uchun alohida backend kerak.
Maxfiy kalitlarni NEXT_PUBLIC_ prefiksi bilan yozmang.

Kontaktlar hozircha bo‘sh. Keyin NEXT_PUBLIC_SCHOOL_ADDRESS, NEXT_PUBLIC_SCHOOL_PHONE,
NEXT_PUBLIC_SCHOOL_EMAIL ni kiritib Redeploy qiling. Admin paneldagi kontent tahriri
frontend redeploy’ini talab qilmaydi. Rahbariyat matnlari packages/contracts/staff.ts’da,
ularni o‘zgartirish frontend redeploy’ini talab qiladi.

## Backup va monitoring

Supabase rejangizdagi backup/retention holatini Dashboard’dan tekshiring yoki tashqi
xizmatda scheduled pg_dump sozlang. Eksportni boshqa joyda saqlang, tiklashni alohida
bazada sinang. Repository Supabase backup jadvalini yaratmaydi. DB dump Storage
fayllarini o‘z ichiga olmaydi; rasm obyektlarini ham zaxiralang.

Mustaqil monitoring: scripts/monitor.mjs. MONITOR_URL=Vercel /api/health,
MONITOR_STATE_PATH doimiy fayl, MONITOR_TELEGRAM_TOKEN va MONITOR_TELEGRAM_ID alohida
monitor boti uchun. Tashqi scheduler’da har 5 daqiqada bajaring; holat o‘zgarsa
xabar yuboradi. Render ichidagi monitor butun Render uzilishini mustaqil aniqlay olmaydi.

## Yakuniy tekshiruv

`npm run check`; hosting qiymatlari kiritilgan muhitda `npm run deploy:check -- frontend`
va `npm run deploy:check -- backend`. Ular formatni tekshiradi, jonli ulanishni emas.

Deploydan keyin /api/health, public sahifalar, admin login, rasm yuklash, vaqtinchalik
kontent yaratish/tahrirlash/o‘chirish/tiklash, test murojaat va Telegramni sinang.
Render’ni qayta deploy qilib ma’lumotlar saqlanishini tekshiring.
Jonli Supabase/Render ulanishi hisob va DATABASE_URL kiritilgandan keyin tasdiqlanadi.

Rasmiy manbalar:

- https://supabase.com/docs/guides/database/connecting-to-postgres
- https://node-postgres.com/features/ssl
- https://render.com/docs/web-services
