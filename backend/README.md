# Node.js backend

Node.js 24 HTTP server backend/server.ts orqali ishga tushadi.
API interfeysi saqlangan: ommaviy kontent, admin sessiyalari, parallel tahrirlashda
versiya nazorati, rasm yuklash va murojaatlar. Cloudflare Worker talab qilinmaydi.

## Ishga tushirish

Loyiha ildizida npm run dev yoki npm run dev:backend.
Migratsiyalar ishga tushishda avtomatik qo‘llanadi; alohida buyruq: npm run db:migrate:local.
Baza: backend/data/school.sqlite. DATABASE_PATH orqali boshqa doimiy diskni tanlash mumkin.
Eski mahalliy baza: npm run db:import:legacy. Import manbani o‘zgartirmaydi va
mavjud maqsad bazaning ustiga yozmaydi.

## Sozlamalar

.env.example dagi parametrlar qo‘llab-quvvatlanadi. Mavjud .dev.vars ham o‘qiladi.
ADMIN_PASSWORD_HASH, SUPABASE_URL, SUPABASE_SECRET_KEY va SUPABASE_STORAGE_BUCKET
faqat backendda ishlatiladi. Maxfiy fayllarni Git’ga qo‘shmang.
Production uchun PUBLIC_ORIGIN saytning aniq https domeni bo‘lishi kerak:
barcha yozish so‘rovlarida Origin tekshiriladi. API odatda 127.0.0.1:4000’da,
Next.js esa /api orqali proksi qiladi.

## API

GET /api/health — baza tayyorligi.
GET /api/posts, /api/teachers, /api/achievements, /api/school-life — nashr qilingan kontent.
GET /api/posts/:slug, /api/teachers/:slug — tafsilotlar.
GET /api/achievement-page — limit, offset, year, subject, type va stage bilan filtrlangan sahifa.
GET /api/achievement-filters — nashr qilingan yillar va fanlar.
POST /api/contact — idempotent murojaat yuborish.
Yangi murojaat uchun telefon va Telegram username majburiy, email ixtiyoriy.
/api/admin/ — login/logout/session, kontent, xabarlar va Supabase rasm yuklash.

Cookie HttpOnly va SameSite=Strict; https domenida Secure ham qo‘yiladi.
Limitlar va sessiyalar bazada saqlanadi. Mavjud SQL migratsiyalarini qayta yozmang.

## Tekshiruv

npm test — API handlerlari haqiqiy Node SQLite’da tekshiriladi, jumladan
admin kirishi, ruxsatlar, versiyalar, murojaat cheklovlari va rasm validatsiyasi.
Supabase tashqi so‘rovlari testlarda almashtirilgan; jonli xizmatga yozilmaydi.

Telegram xabarlari va bot menyusi: [telegram/README.md](telegram/README.md).

## Kontentni o‘chirish

DELETE /api/admin/{posts|teachers|achievements|school-life|messages}/:id?version=N
joriy admin sessiyasi va aynan sayt Origin’i bilan ishlaydi. Versiya mos kelmasa
409, yozuv topilmasa 404 qaytadi. Admin panelida yozuvni tanlang, O‘chirish tugmasini
bosing va dialogda tasdiqlang. O‘chirilgan yozuv Savatga tushadi va tiklanishi mumkin; Supabase’dagi umumiy rasm fayllari
avtomatik o‘chirilmaydi. Testlar faqat vaqtinchalik bazadagi yozuvlarni o‘chiradi.

Hosting, backup va monitoring: [DEPLOYMENT.md](../DEPLOYMENT.md).
