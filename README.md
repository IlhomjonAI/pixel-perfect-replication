# Bekobod tuman ixtisoslashtirilgan maktabi — rasmiy veb-sayti

Bekobod tuman ixtisoslashtirilgan maktabining rasmiy veb-sayti. Sayt hozirda namuna ma'lumotlari bilan ishlamoqda — barcha tarkib "Namuna" belgisi bilan ajratilgan va tasdiqlangandan so'ng haqiqiy ma'lumotlar bilan almashtiriladi.

## Joriy imkoniyatlar (demo)

- **Bosh sahifa** — maktab taqdimoti, so'nggi yangiliklar, yutuqlar va o'qituvchilar bo'limlari
- **Maktab haqida** — maktab tarixi, ta'lim yo'nalishlari va rahbariyat uchun joy (to'ldirilmoqda)
- **Yangiliklar** — yangiliklar, tadbirlar va e'lonlar ro'yxati, qidiruv va turkumlar bo'yicha saralash
- **Yutuqlar** — o'quvchilar yutuqlari, sertifikatlarni to'liq ko'rish imkoniyati, filtrlash
- **O'qituvchilar** — o'qituvchilar ro'yxati va shaxsiy profillar
- **Qabul** — qabul haqida ma'lumot, ariza.piima.uz ga yo'naltirish
- **Aloqa** — murojaat forması (yuborish funksiyasi hali ulanmagan)

## Texnologiyalar

- **Frontend:** React 19, TanStack Start (SSR), TanStack Router, Tailwind CSS v4
- **Build output:** Cloudflare Workers (Nitro orqali avtomatik generatsiya qilinadi)
- **Shablon:** [Lovable](https://lovable.dev) da yaratilgan

## Backend holati

D1 migrationlar va ommaviy o‘qish API’lari qo‘shilgan. Frontend hali mock
ma’lumotlardan foydalanadi. Admin kirishi va haqiqiy murojaat yuborish keyingi
bosqichda yaratiladi. Mahalliy baza va API tekshiruvi: [BACKEND.md](BACKEND.md).

## Kelajakdagi reja

- **Backend:** Cloudflare Workers + D1 (ma'lumotlar bazasi)
- **Rasmlar:** Cloudinary orqali boshqariladi
- Hozircha sayt frontend only — ma'lumotlar `src/data/mock/` papkasidagi namuna ma'lumotlardan olinadi

## Loyiha bilan ishlash

```sh
npm install
npm run dev
```

### Build va test

```sh
npm run build       # Production build (Cloudflare Workers output)
npm run typecheck   # TypeScript tekshiruv
npm test            # Vitest testlari
npm run preview     # Build natijasini ko'rish
```

## Loyihada davom ettirish

Bu loyiha [Lovable](https://lovable.dev) bilan bog'langan. Lovable editorida o'zgartirishlar to'g'ridan-to'g'ri ushbu repozitoriyaga sinxronlanadi.
