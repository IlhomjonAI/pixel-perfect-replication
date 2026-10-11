import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Send } from "lucide-react";
import { useState } from "react";
import { AchievementCard, TeacherCard } from "@/components/site/cards";
import { CertificateModal } from "@/components/site/CertificateModal";
import { EmptyState, Eyebrow, PendingBlock, SectionHeading } from "@/components/site/common";
import { Hero } from "@/components/site/Hero";
import { NewsFeed } from "@/components/site/NewsFeed";
import { SchoolLifeCard } from "@/components/site/SchoolLifeCard";
import type { Achievement } from "@/data/types";
import { getAchievementsPage } from "@/lib/achievement-api";
import { getPostsPage } from "@/lib/news-api";
import { getSchoolLifePage } from "@/lib/school-life-api";
import { getTeachersPage } from "@/lib/teacher-api";
import { pageHead, PENDING, SCHOOL_NAME, TELEGRAM_URL } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () =>
    pageHead(
      "Bosh sahifa",
      `${SCHOOL_NAME}ning ta’lim muhiti, maktab hayoti va o‘quvchilar yutuqlari bilan tanishing.`,
    ),
  loader: async () => ({
    posts: await getPostsPage(6),
    achievements: (await getAchievementsPage({ limit: 4 })).items,
    life: await getSchoolLifePage(4),
    teachers: await getTeachersPage(3),
  }),
  component: Home,
});

function Home() {
  const { posts, achievements, life, teachers } = Route.useLoaderData();
  const [cert, setCert] = useState<Achievement | null>(null);
  const heroPost = posts.find((post) => post.coverImage) ?? null;

  return (
    <>
      <Hero
        image={heroPost?.coverImage ?? null}
        sourcePost={heroPost ? { slug: heroPost.slug, title: heroPost.title } : null}
      />

      <section id="yangiliklar" className="home-section scroll-mt-24">
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

      <section className="home-section border-y bg-secondary">
        <div className="container-site grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-xl">
            <Eyebrow>Biz kimmiz</Eyebrow>
            <h2 className="mt-3 text-[clamp(1.75rem,3.4vw,2.75rem)] font-medium leading-[1.1] text-primary">
              {SCHOOL_NAME}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
              Maqsadimiz — har bir o‘quvchining qiziqishini izlanishga, izlanishni esa aniq natijaga
              aylantirish. Maktab hayotimiz haqidagi ma’lumotlar tasdiqlangani sayin to‘ldirib
              boriladi.
            </p>
            <Link
              to="/maktab"
              className="group mt-6 inline-flex min-h-11 items-center gap-2 font-semibold text-primary hover:text-gold-ink"
            >
              Maktab haqida batafsil
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <PendingBlock title="Maktab tarixi" />
            <PendingBlock title="Moddiy baza" />
            <PendingBlock title="Ta’lim profili" />
            <PendingBlock title="Aloqa ma’lumotlari">{PENDING}.</PendingBlock>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="container-site">
          <SectionHeading
            eyebrow="Izlanishdan natijaga"
            title="O‘quvchilarimiz yutuqlari"
            intro="Fan olimpiadalari, xalqaro sertifikatlar va e’lon qilingan natijalar."
            action={{ to: "/yutuqlar", label: "Barcha yutuqlar" }}
          />
          {achievements.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {achievements.map((a) => (
                <AchievementCard key={a.id} a={a} onPreview={setCert} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Har bir yutuq — yangi ilhom"
              description="O‘quvchilarimizning tasdiqlangan natijalari shu yerda e’lon qilinadi."
            />
          )}
        </div>
      </section>

      <section className="home-section border-y bg-secondary">
        <div className="container-site">
          <SectionHeading
            eyebrow="Bilim ortidagi insonlar"
            title="Ustozlarimiz"
            intro="O‘qituvchilarimizning fanlari, tajribasi va kasbiy yutuqlari bilan tanishing."
            action={{ to: "/oqituvchilar", label: "Barcha o‘qituvchilar" }}
          />
          {teachers.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {teachers.map((t) => (
                <TeacherCard key={t.slug} t={t} />
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
              to="/maktab-hayoti"
            >
              Barcha faoliyatlar
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
          </div>
          {life.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {life.map((item) => (
                <SchoolLifeCard key={item.id} item={item} dark />
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-on-navy/15 px-6 py-10 text-on-navy-muted">
              Tadbirlar va faoliyatlar tez orada shu yerda e’lon qilinadi.
            </p>
          )}
        </div>
      </section>

      <section className="container-site py-14 md:py-20">
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
            <Link to="/aloqa" className="btn btn-primary">
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
      </section>

      <CertificateModal item={cert} onClose={() => setCert(null)} />
    </>
  );
}
