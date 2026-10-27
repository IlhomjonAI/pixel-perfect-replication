# Telegram murojaat boti

Node.js API ishga tushganda bot ham long polling orqali ishlaydi. Lokal foydalanishda
alohida domen yoki webhook kerak emas. Server to‘xtasa bot ham to‘xtaydi;
doimiy ishlash uchun Node.js jarayonini hostingda uzluksiz ishlating.

## Maxfiy sozlamalar

`.dev.vars` yoki `.env`: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ADMIN_ID`.
`TELEGRAM_ENABLED=false` botni o‘chiradi. Sozlamani o‘zgartirgach serverni qayta
ishga tushiring. Token faqat serverda ishlaydi va Git’ga kiritilmaydi.
Test jarayonlarida bot o‘chirilgan; testlar haqiqiy Telegram’ga so‘rov yubormaydi.

## Foydalanish

Ruxsat berilgan akkaunt botga `/start` yuboradi. Menyuda faqat `/murojaatlar`
va “Kelgan murojaatlar” tugmasi bor. Har sahifada beshta murojaat ko‘rsatiladi.
Murojaatni tanlaganda ism, telefon, Telegram username, ixtiyoriy email, sana,
holat va to‘liq xabar ochiladi. Javob berish Telegram profil havolasi yoki
telefon orqali qo‘lda bajariladi; bot avtomatik SMS yubormaydi.

Faqat sozlangan admin ID va aynan uning shaxsiy chati qabul qilinadi.
Guruhlar, boshqa foydalanuvchilar va begona callback so‘rovlari ma’lumot ololmaydi.
Botdan kontentni o‘zgartirish yoki o‘chirish imkoni berilmagan.

## Ishonchli yuborish

0010 migratsiyasi telefon saqlanadigan mavjud `contact` ustunini saqlaydi va
Telegram username hamda email ustunlarini qo‘shadi. Eski murojaatlar yo‘qolmaydi;
ular bot menyusida ko‘rinadi, lekin tarixiy yozuvlar ommaviy qayta yuborilmaydi.

SQL trigger yangi murojaat saqlanishi bilan bir operatsiyada yuborish navbatini
yaratadi. Takrorlangan requestId ikkinchi xabar yaratmaydi. Telegram ishlamasa
yuborish vaqti bazaga saqlanadi va bosqichma-bosqich qayta uriniladi. Uzun matn
3500 belgilik qismlarga bo‘linadi; yuborilgan qismlar qayta ishga tushganda
o‘tkazib yuboriladi. Tarmoq Telegram xabarni qabul qilganidan keyin uzilsa,
tasdiq yetib kelmagani uchun kamdan-kam takroriy xabar bo‘lishi mumkin.

0011 migratsiyasidagi lease bir bazaga ulangan ikki jarayonning bir paytda
polling va yuborishiga yo‘l qo‘ymaydi. Telegram update offset’i ham bazada
saqlanadi. Murojaat o‘chirilsa yuborilmagan navbat yozuvi ham o‘chiriladi.

Telegram’da oldindan webhook sozlangan bo‘lsa, bot uni o‘zi o‘chirmaydi;
polling to‘xtatiladi va serverda tushunarli xabar chiqariladi.

Rasmiy ma’lumotnoma: https://core.telegram.org/bots/api
