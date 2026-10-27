"use client";

import { ExternalLink, Info } from "lucide-react";
import { Eyebrow } from "@/components/site/common";
import { PageHero } from "@/components/site/PageHero";
import { MEDIA } from "@/config/brand";
import { ARIZA_URL } from "@/config/site";

const FAQ = [
  {
    q: "Ariza qayerda topshiriladi?",
    a: "Arizalar faqat rasmiy ariza.piima.uz platformasi orqali qabul qilinadi. Ushbu sayt orqali ariza topshirilmaydi.",
  },
  {
    q: "Qabul muddatlari qachon?",
    a: "Tasdiqlangan muddatlar e’lon qilingandan so‘ng shu sahifaga qo‘shiladi.",
  },
  {
    q: "Qaysi hujjatlar kerak?",
    a: "Hujjatlar ro‘yxati rasmiy tasdiqlangandan so‘ng qo‘shiladi.",
  },
  {
    q: "Imtihonlar qanday o‘tkaziladi?",
    a: "Ma’lumot tez orada qo‘shiladi. Rasmiy yangiliklarni Telegram kanalimizda kuzatib boring.",
  },
];

export default function Admissions() {
  return (
    <>
      <PageHero
        eyebrow="Qabul"
        title="Maktabga qabul"
        intro="Tasdiqlangan qabul ma’lumotlari tez orada qo‘shiladi."
        image={MEDIA.notebook}
      />
      <div className="container-site grid gap-10 py-12 lg:grid-cols-[1fr_380px] lg:gap-14">
        <div>
          <div className="flex gap-3 rounded-xl border border-gold bg-gold-soft p-5 text-navy-deep">
            <Info className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            <p>
              Qabul qoidalari va muddatlari rasmiy tasdiqlangach e’lon qilinadi. Bu sahifadagi
              ma’lumotlar to‘ldirilmoqda.
            </p>
          </div>

          <h2 className="mt-12 font-display text-2xl text-primary md:text-3xl">
            Ko‘p beriladigan savollar
          </h2>
          <div className="mt-6 space-y-3">
            {FAQ.map((f) => (
              <details key={f.q} className="card-surface group p-5">
                <summary className="cursor-pointer list-none font-semibold text-primary marker:hidden">
                  <span className="flex items-center justify-between gap-4">
                    {f.q}
                    <span
                      className="text-gold transition-transform group-open:rotate-45"
                      aria-hidden
                    >
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-3 text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>

        <aside className="text-on-navy h-fit overflow-hidden rounded-2xl bg-forest-deep p-7 shadow-[var(--shadow-card)] lg:sticky lg:top-28">
          <Eyebrow>Rasmiy platforma</Eyebrow>
          <h2 className="mt-3 font-display text-2xl text-on-navy">Ariza topshirish</h2>
          <p className="mt-3 text-sm leading-relaxed text-on-navy-muted">
            Arizalar ushbu maktab sayti orqali emas, rasmiy platforma orqali topshiriladi.
          </p>
          <a
            href={ARIZA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-gold mt-6 w-full"
          >
            ariza.piima.uz <ExternalLink className="h-4 w-4" aria-hidden />
          </a>
        </aside>
      </div>
    </>
  );
}
