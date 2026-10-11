# Bekobod tumani ixtisoslashtirilgan maktabi — rasmiy veb-sayti

Bekobod tuman ixtisoslashtirilgan maktabining rasmiy veb-sayti. Sayt Cloudflare
Workers + D1 bilan ishlaydi: yangiliklar, yutuqlar, o‘qituvchilar, maktab hayoti
va murojaatlar administratorlar tomonidan boshqariladi. Nashr etilmagan
yozuvlar va tasdiqlanmagan faktlar jamoatchilikka ko‘rsatilmaydi.

## Bo‘limlar

- **Bosh sahifa** — maktab tanishtiruvi, so‘nggi yangiliklar, yutuqlar, o‘qituvchilar va maktab hayoti
- **Maktab haqida** — tasdiqlangan ma’lumot qo‘shilgach to‘ldiriladigan bo‘limlar
- **Yangiliklar** — yangiliklar, tadbirlar va e’lonlar ro‘yxati, qidiruv va turkumlar bo‘yicha saralash
- **Yutuqlar** — o‘quvchilar yutuqlari, sertifikatlarni to‘liq ko‘rish, filtrlash
- **O‘qituvchilar** — o‘qituvchilar ro‘yxati va shaxsiy profillar
- **Maktab hayoti** — to‘garaklar, loyihalar va gallereyalar
- **Qabul** — qabul haqida ma’lumot va `ariza.piima.uz` ga yo‘naltirish
- **Aloqa** — murojaat yuborish (CSRF origin tekshiruvi va cheklovlar bilan)
- **Admin** — pasport-bilan kirish, mazmun boshqaruvi va murojaatlar

## Texnologiyalar

- **Frontend:** React 19, TanStack Start (SSR) va Router, Tailwind CSS v4
- **Backend:** Cloudflare Workers (Nitro), Cloudflare D1, Supabase Storage (rasm yuklash)
- **Shablon:** [Lovable](https://lovable.dev)

## Branding va media

Maktab logotipi va hero (bosh sahifa foni) konfiguratsiyasi `src/lib/brand.ts`
faylida. Rasmiy logotip `public/brand/school-logo.svg` manzilida turadi va
header, bosh sahifa hero, footer, admin hamda faviconda ishlatiladi (fayl
yo‘qolsa SVG belgi avtomatik fallback bo‘ladi). Hero fotosurati/videosi hali
tasdiqlanmagan, shuning uchun hero grafik fon bilan ishlaydi. Tafsilot:
[BACKEND.md](BACKEND.md).

## Loyiha bilan ishlash

```sh
npm ci
npm run db:migrate:local
npm run build
npm run worker:local
```

Keyin http://localhost:8787 oching. `GET /api/health`
`{"data":{"status":"ok","database":"ready"}}` qaytarishi kerak.

### Build va test

```sh
npm run check      # typecheck + `npm test` + production build
npm run lint       # eslint (0 xato; format: npm run format)
```

## Loyihada davom ettirish

Bu loyiha [Lovable](https://lovable.dev) bilan bog'langan. Lovable editorida
o'zgartirishlar to'g'ridan-to'g'ri ushbu repozitoriyaga sinxronlanadi.
