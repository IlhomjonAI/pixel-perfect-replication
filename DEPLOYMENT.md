# Render backend + Vercel frontend

## Qisqa yo‘riqnoma

Frontend **Vercel**da, backend **Render**da ishlaydi. Hostinglarni foydalanuvchi o‘zi yaratadi; bu fayllar deployni avtomatik boshlamaydi.

1. Renderda `render.yaml` orqali xizmat yarating. SQLite uchun **doimiy diskli paid xizmat** kerak; bepul vaqtinchalik diskda kontent yo‘qoladi. `DATABASE_PATH=/var/data/school.sqlite`, `BACKUP_DIR=/var/data/backups` bo‘lsin. `PUBLIC_ORIGIN`ga Vercelning asosiy HTTPS domenini kiriting.
2. Vercelda Root Directory `frontend`, tashqi papkadagi source fayllarni buildga qo‘shish yoqilgan, Node 24.x bo‘lsin. `API_INTERNAL_URL`ga Render HTTPS manzilini, `API_PROXY_SECRET`ga Renderdagi aynan bir xil qiymatni kiriting. URL qiymatlariga `/api`, login/parol yoki boshqa path qo‘shmang.
3. Renderda admin xeshi, Supabase rasm saqlash sozlamalari va Telegram bot sozlamalarini kiriting. Botni hozir ishlatmasangiz `TELEGRAM_ENABLED=false` qiling; aks holda mahalliy bot pollerini to‘xtatib, faqat Renderdagi botni ishlating.
4. Kerakli hosting qiymatlari mavjud muhitda `npm run deploy:check -- frontend` yoki `npm run deploy:check -- backend`ni ishlating. Buyruq tarmoqqa ulanmaydi va maxfiy qiymatlarni chop etmaydi. Bu tekshiruv disk haqiqatan biriktirilganini, ikki hostingdagi secret bir xilligini yoki xizmatlarga ulanishni tasdiqlamaydi.
5. `npm run check`ni bajaring. Deploydan so‘ng quyidagi **Verify after deployment** amallarini ham bajaring.

Kontaktlar hozircha kiritilmaydi; bo‘sh kontakt kartalari ko‘rsatilmaydi. Keyinchalik Vercel Environment Variables’ga `NEXT_PUBLIC_SCHOOL_ADDRESS`, `NEXT_PUBLIC_SCHOOL_PHONE`, `NEXT_PUBLIC_SCHOOL_EMAIL`ni qo‘shib **Redeploy** qiling. Bu uch qiymat ommaviy ma’lumotlar; maxfiy kalitlarni `NEXT_PUBLIC_` bilan boshlamang. Yangiliklar, yutuqlar, ustozlar va maktab hayoti admin paneldan tahrirlanadi, ular uchun frontendni qayta deploy qilish shart emas.

Hozir maktab tarixi, rahbariyat va qabul bo‘yicha tasdiqlangan matnlar kodda turadi. Ularni o‘zgartirish kodni tahrirlash va frontendni qayta deploy qilishni talab qiladi. Haqiqiy maktab suratlari tayyor bo‘lganda `frontend/config/brand.ts`dagi namunaviy rasmlarni almashtiring.

Rasm yuklash muddati: Supabase 30 soniya, proksi 40 soniya, brauzer 45 soniya. Vercel API funksiyasi uchun `maxDuration=60` belgilangan. Sekin yoki uzilgan tarmoqda saqlash natijasini tekshirmasdan takroriy yozuv yaratmang.

## Before publishing

Keep `.dev.vars`, `.env*`, `backend/data` and backups out of Git. Rotate the Telegram token in BotFather; put the replacement only in Render's secret environment settings. Stop the local Telegram poller (`TELEGRAM_ENABLED=false`) before enabling the cloud bot: separate databases cannot coordinate their polling leases.

The current SQLite architecture requires one paid Render service with a persistent disk. Free ephemeral storage would lose writes on replacement/redeploy. `render.yaml` describes the service; it does not provision it until you deploy the Blueprint. Do not scale this SQLite service to multiple instances.

## Vercel

Import the repository, select **Root Directory: frontend**, enable **Include source files outside of the Root Directory in the Build Step**, select Node 24.x. `frontend/vercel.json` installs dependencies from the repository root and builds `frontend/.next`.

Set server-only variables (never prefix with NEXT_PUBLIC):

- `API_INTERNAL_URL`: `https://YOUR-API.onrender.com`
- `API_PROXY_SECRET`: exactly the value generated for the Render service.

Use the stable production domain for admin access. Requests to `/api/*` go through a Next route handler; it preserves cookies/Origin and sends the trusted Vercel visitor IP with a server secret. Arbitrary callers cannot forge the rate-limit address. Preview deployments are intentionally rejected for writes by the production backend Origin check. Deploy a separate backend for preview writes.

## Render

Create a Blueprint from `render.yaml` (paid service/disk). Set:

- `PUBLIC_ORIGIN`: the exact Vercel production origin, e.g. `https://school.vercel.app`, without a path.
- `ADMIN_PASSWORD_HASH`: the existing local hash, or create one with `npm run admin:setup`.
- `TELEGRAM_BOT_TOKEN`: renewed bot token; `TELEGRAM_ADMIN_ID`: your numeric Telegram user ID.
- Supabase URL, secret key and image bucket matching the existing local setup.
- `BACKUP_STORAGE_BUCKET`: a **separate private** Supabase bucket, e.g. `school-backups`. Create it first. Leave this variable unset for disk-only backups; disk-only copies do not protect against losing the entire disk/account.

Build: `npm ci --include=dev && npm run deploy:check -- backend`. Start: `npm run start:backend`. Host `0.0.0.0`; Render's `PORT` is respected. Persistent database `/var/data/school.sqlite`. Health endpoint `/api/health` checks the database. All other backend endpoints require the proxy secret when configured. Enable Render deployment/health notifications in account settings. Both hosting build commands validate their environment configuration before completing a deployment.

## Existing data and recovery

New deployment starts with an empty database. To transfer existing records, run `npm run backup:create` locally, securely upload the completed snapshot folder to the Render persistent disk, then run `npm run backup:restore -- SNAPSHOT_DIR /var/data/imported.sqlite`. This verifies checksums for the DB and all images, checks SQLite integrity, and refuses to overwrite an existing file. Stop the service before changing `DATABASE_PATH` to the restored file; restart afterwards. Old admin sessions are in the backup: rotate the admin password hash to invalidate them if recovering after a compromise.

Images already stored in Supabase keep their URLs. Backups additionally contain each `image_assets` file and a manifest mapping it to the original object ID/URL. The restore command verifies all image copies; it does not overwrite the live storage bucket. To recover lost storage objects, upload those snapshot files under the original `publicId` values in that bucket with the correct content types from the restored `image_assets` table.

Automatic backup runs at startup when due, then checks hourly; minimum interval 24 hours. The SQLite online backup API produces a consistent snapshot even while the site runs. All registered uploaded images are copied and checksummed. Only completed snapshots count as success; the latest 14 completed copies are kept locally. Offsite copies in the private bucket are retained until you remove them according to your retention policy. Monitor disk usage; increase the 1 GB starting disk as photos grow. Static repository media are preserved by repository backups, not database snapshots.

## Bot and monitoring

Authorized private-chat users can change request status with version checks. One digest per Tashkent calendar day is sent between 09:00 and 18:00 if unresolved requests are older than 24 hours. The timer state is stored in SQLite. Temporary delivery failures retry; ambiguous network acknowledgements can occasionally duplicate a message.

Use the supplied `scripts/monitor.mjs` from a machine/service independent of Render. Set `MONITOR_URL` to the Vercel `/api/health` URL and `MONITOR_STATE_PATH` to a persistent file, plus a dedicated monitor bot's token/owner ID via `MONITOR_TELEGRAM_TOKEN` and `MONITOR_TELEGRAM_ID`. Run every five minutes. It alerts on transitions to outage and recovery, not on every poll. A process on Render itself cannot report a total Render outage. Never run multiple pollers using the school bot token.

## Verify after deployment

Open the public site and `/api/health`; log into admin, upload an image, create/delete/restore a disposable record. Submit one clearly labelled test contact and check Telegram delivery, status synchronization and private-only access. Redeploy and confirm records persist. Download a private remote backup and run the recovery command to a new file before relying on disaster recovery.

References: https://render.com/docs/disks · https://render.com/docs/web-services · https://vercel.com/docs/monorepos · https://vercel.com/docs/headers/request-headers
