"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, GraduationCap, Trophy, Send } from "lucide-react";
import { useState } from "react";
import { AchievementCard, TeacherCard } from "@/components/site/cards";
import { CertificateModal } from "@/components/site/CertificateModal";
import { EmptyState, Eyebrow, SectionHeading } from "@/components/site/common";
import { Hero } from "@/components/site/Hero";
import { NewsFeed } from "@/components/site/NewsFeed";
import { Reveal } from "@/components/site/Reveal";
import { SampleImage } from "@/components/site/SampleImage";
import { Logo } from "@/components/site/Logo";
import { SchoolLifeCard } from "@/components/site/SchoolLifeCard";
import type { Achievement } from "@school/contracts/models";
import { getAchievementsPage } from "@/api/achievement";
import { MEDIA } from "@/config/brand";
import { getPostsPage } from "@/api/news";
import { getSchoolLifePage } from "@/api/school-life";
import { getTeachersPage } from "@/api/teacher";
import { NAV, SCHOOL_NAME, TELEGRAM_URL } from "@/config/site";

export default function Home({ initialData }: { initialData: PageData }) {
  const { posts, achievements, life, teachers } = initialData;
  const [cert, setCert] = useState<Achievement | null>(null);

  return (
    <>
      {/* A. Photographic hero */}
      <Hero />

      <section
        id="imkoniyatlar"
        aria-label="Tezkor havolalar"
        className="border-b bg-white scroll-mt-[var(--site-header-h)]"
      >
        <div className="container-site quick-links">
          {[
            {
              to: "/qabul" as const,
              icon: GraduationCap,
              title: "Kelajagingiz shu yerdan",
              text: "Qabul haqida ma’lumot",
            },
            {
              to: "/yutuqlar" as const,
              icon: Trophy,
              title: "Bizning faxrimiz",
              text: "O‘quvchilarimiz yutuqlari",
            },
            {
              to: "/maktab-hayoti" as const,
              icon: BookOpen,
              title: "Har kun — yangi imkoniyat",
              text: "Maktab hayoti bilan tanishing",
            },
          ].map(({ to, icon: Icon, title, text }) => (
            <Link key={to} href={to} className="quick-link">
              <span className="quick-link-icon">
                <Icon size={22} aria-hidden />
              </span>
              <div>
                <strong>{title}</strong>
                <p>{text}</p>
              </div>
              <ArrowRight size={18} aria-hidden />
            </Link>
          ))}
        </div>
      </section>

      {/* B. Latest real published news */}
      <section
        id="yangiliklar"
        className="home-section scroll-mt-[calc(var(--site-header-h)+1.25rem)]"
      >
        <div className="container-site">
          <SectionHeading
            eyebrow="Maktab kundaligi"
            title="Maktabimizdan yangiliklar"
            intro="Yangi xabarlar, tadbirlar va esda qolarli lahzalar."
            action={{ to: "/yangiliklar", label: "Barcha yangiliklar" }}
          />
          {posts.length ? (
            <NewsFeed posts={posts} />
          ) : (
            <EmptyState
              title="Yangiliklar tez orada"
              description="Maktabimizning yangi xabarlari shu yerda e’lon qilinadi."
            />
          )}
        </div>
      </section>

      {/* C. School introduction: image left / text right */}
      <section className="home-section border-y bg-secondary">
        <div className="container-site grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
          <Reveal from="left" className="lg:col-span-7">
            <SampleImage
              name="library"
              className="aspect-[4/3] rounded-2xl shadow-[var(--shadow-lift)] md:aspect-[3/2]"
            />
          </Reveal>
          <Reveal from="right" className="lg:col-span-5">
            <Logo className="mb-5 h-16 w-16" />
            <Eyebrow>Biz haqimizda</Eyebrow>
            <h2 className="mt-3 text-[clamp(1.9rem,3.6vw,2.9rem)] font-medium leading-[1.08] text-primary">
              {SCHOOL_NAME}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
              Maqsadimiz — har bir o‘quvchining qiziqishini izlanishga, izlanishni esa aniq natijaga
              aylantirish. Aniq va tabiiy fanlar, tillar hamda ijtimoiy fanlar ustozlari o‘quvchilar
              bilan bilim va tajribalarini baham ko‘radi. Kutubxonamiz esa mustaqil mutolaa va
              izlanishga chorlaydi.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {NAV.filter((n) => n.to !== "/").map((n) => (
                <li key={n.to}>
                  <Link href={n.to} className="btn btn-outline min-h-10 px-4 py-2 text-sm">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/maktab"
              className="group mt-6 inline-flex min-h-11 items-center gap-2 font-semibold text-primary hover:text-gold-ink"
            >
              Maktab haqida batafsil
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
            <p className="mt-6 border-t pt-4 text-xs leading-relaxed text-muted-foreground">
              Maktab jamoasi, ustozlarning malaka toifalari va ish staji taqdim etilgan xodimlar
              reyestri asosida yoritilgan.
            </p>
          </Reveal>
        </div>
      </section>

      {/* D. Achievements: heading left / results right */}
      <section className="home-section">
        <div className="container-site grid gap-10 lg:grid-cols-12 lg:gap-14">
          <Reveal
            from="left"
            className="lg:col-span-4 lg:sticky lg:top-[calc(var(--site-header-h)+1.5rem)] lg:self-start"
          >
            <Eyebrow>Izlanishdan natijaga</Eyebrow>
            <h2 className="mt-3 text-[clamp(1.9rem,3.6vw,2.9rem)] font-medium leading-[1.08] text-primary">
              O‘quvchilarimiz yutuqlari
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Fan olimpiadalari, xalqaro sertifikatlar va e’lon qilingan natijalar. Har bir natija
              rasmiy hujjat bilan tasdiqlanadi.
            </p>
            <Link
              href="/yutuqlar"
              className="group mt-6 inline-flex min-h-11 items-center gap-2 font-semibold text-primary hover:text-gold-ink"
            >
              Barcha yutuqlar
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
          </Reveal>
          <div className="lg:col-span-8">
            {achievements.length ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {achievements.map((a, index) => (
                  <Reveal key={a.id} from="right" delay={index * 80}>
                    <AchievementCard a={a} onPreview={setCert} />
                  </Reveal>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Har bir yutuq — yangi ilhom"
                description="O‘quvchilarimizning tasdiqlangan natijalari shu yerda e’lon qilinadi."
              />
            )}
          </div>
        </div>
      </section>

      {/* E. Teachers */}
      <section className="home-section border-y bg-sage/40">
        <div className="container-site">
          <Reveal from="up">
            <SectionHeading
              eyebrow="Bilim ortidagi insonlar"
              title="Ustozlarimiz"
              intro="O‘qituvchilarimizning fanlari, tajribasi va kasbiy yutuqlari bilan tanishing."
              action={{ to: "/oqituvchilar", label: "Barcha o‘qituvchilar" }}
            />
          </Reveal>
          {teachers.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {teachers.map((t, index) => (
                <Reveal key={t.slug} from="up" delay={index * 90}>
                  <TeacherCard t={t} />
                </Reveal>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Ustozlarimiz bilan tanishing"
              description="O‘qituvchilar profillari shu yerda e’lon qilinadi."
              framed={false}
            />
          )}
        </div>
      </section>

      {/* F. School life: editorial photo composition on deep forest */}
      <section className="home-section bg-navy-deep text-on-navy">
        <div className="container-site">
          <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <Eyebrow>Darslardan tashqari</Eyebrow>
              <h2 className="mt-3 text-[clamp(1.75rem,3.4vw,2.75rem)] font-medium leading-[1.1] text-on-navy">
                Maktab hayoti
              </h2>
              <p className="mt-3 text-on-navy-muted">
                To‘garaklar, loyihalar va birga yaratilgan xotiralar.
              </p>
            </div>
            <Link
              className="group inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-gold hover:text-on-navy"
              href="/maktab-hayoti"
            >
              Barcha faoliyatlar
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
          </div>
          {life[0] ? (
            <div className="grid items-start gap-6 lg:grid-cols-12 lg:gap-8">
              <Reveal from="left" className="lg:col-span-7">
                <SchoolLifeCard item={life[0]} dark feature />
              </Reveal>
              {life.length > 1 && (
                <div className="flex flex-col gap-6 lg:col-span-5">
                  {life.slice(1, 3).map((item, index) => (
                    <Reveal key={item.id} from="right" delay={80 + index * 80}>
                      <SchoolLifeCard item={item} dark />
                    </Reveal>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="rounded-xl border border-on-navy/15 px-6 py-10 text-on-navy-muted">
              Tadbirlar va faoliyatlar tez orada shu yerda e’lon qilinadi.
            </p>
          )}
        </div>
      </section>

      {/* G. Contact invitation */}
      <section className="container-site py-14 md:py-20">
        <Reveal from="right">
          <div className="contact-banner flex flex-col items-start justify-between gap-7 rounded-2xl border bg-card p-7 shadow-[var(--shadow-card)] md:flex-row md:items-center md:p-10">
            <div className="max-w-xl">
              <Eyebrow>Doim aloqadamiz</Eyebrow>
              <h2 className="mt-3 text-[clamp(1.6rem,3vw,2.25rem)] font-medium text-primary">
                Savolingiz bormi?
              </h2>
              <p className="mt-3 text-muted-foreground">
                Maktab ma’muriyatiga murojaat yuboring yoki yangiliklarni Telegram kanalimizda
                kuzating.
              </p>
            </div>
            <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto">
              <Link href="/aloqa" className="btn btn-primary">
                Murojaat yuborish <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
              >
                <Send className="h-4 w-4" aria-hidden />
                Telegram kanal
              </a>
            </div>
          </div>
        </Reveal>
      </section>

      <CertificateModal item={cert} onClose={() => setCert(null)} />
    </>
  );
}

type PageData = {
  posts: Awaited<ReturnType<typeof getPostsPage>>;
  achievements: Awaited<ReturnType<typeof getAchievementsPage>>["items"];
  life: Awaited<ReturnType<typeof getSchoolLifePage>>;
  teachers: Awaited<ReturnType<typeof getTeachersPage>>;
};
