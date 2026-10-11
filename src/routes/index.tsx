import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, GraduationCap, Send, Trophy } from "lucide-react";
import { useState } from "react";
import { AchievementCard, PostCard, TeacherCard } from "@/components/site/cards";
import { CertificateModal } from "@/components/site/CertificateModal";
import { EmptyState, SectionHeading } from "@/components/site/common";
import { PhotoPlaceholder } from "@/components/site/PhotoPlaceholder";
import { SchoolLifeCard } from "@/components/site/SchoolLifeCard";
import type { Achievement } from "@/data/types";
import { getAchievements, getPosts, getSchoolLife, getTeachers } from "@/lib/api";
import { pageHead, TELEGRAM_URL } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () =>
    pageHead(
      "Bosh sahifa",
      "Bekobod tuman ixtisoslashtirilgan maktabining ta’lim muhiti, maktab hayoti va o‘quvchilar yutuqlari bilan tanishing.",
    ),
  loader: async () => ({
    posts: await getPosts(6),
    achievements: await getAchievements(4),
    life: await getSchoolLife(4),
    teachers: await getTeachers(3),
  }),
  component: Home,
});

function Home() {
  const { posts, achievements, life, teachers } = Route.useLoaderData();
  const [cert, setCert] = useState<Achievement | null>(null);
  const featured = posts.find((post) => post.coverImage);

  return (
    <>
      <section className="home-hero bg-primary text-on-navy">
        <div className="container-site relative grid items-center gap-10 py-12 md:py-16 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
          <div className="min-w-0">
            <p className="eyebrow flex items-center gap-3">
              <span className="h-px w-8 bg-gold" aria-hidden />
              Bekobod tumani · Ixtisoslashtirilgan maktab
            </p>
            <h1 className="mt-6 max-w-2xl text-[clamp(2.5rem,5.2vw,4.6rem)] font-medium leading-[1.06] tracking-tight">
              Bilim, izlanish va <span className="italic text-gold">yutuqlar sari.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-on-navy-muted md:text-lg">
              Maktabimiz bilan tanishing. O‘quvchilarimizning natijalari, ustozlarimiz va kundalik
              hayotimiz — bir joyda.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/maktab" className="btn btn-gold">
                Maktab bilan tanishish <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link to="/yutuqlar" className="btn btn-ghost-navy">
                Yutuqlarimiz
              </Link>
            </div>
            <a
              href="#yangiliklar"
              className="mt-9 inline-flex min-h-11 items-center gap-3 text-sm text-on-navy-muted hover:text-on-navy"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden /> Maktabimizda nima
              yangilik?
              <ArrowRight className="h-4 w-4 rotate-90" aria-hidden />
            </a>
          </div>
          <div className="relative min-w-0">
            {featured ? (
              <Link
                to="/yangiliklar/$slug"
                params={{ slug: featured.slug }}
                className="hero-story group block overflow-hidden rounded-2xl border border-on-navy/20 bg-navy-deep"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <PhotoPlaceholder src={featured.coverImage} alt={featured.title} lazy={false} />
                </div>
                <div className="flex items-center justify-between gap-4 p-5 md:p-6">
                  <div>
                    <p className="eyebrow">Maktab kundaligi</p>
                    <h2 className="mt-2 line-clamp-2 text-xl font-medium leading-snug group-hover:text-gold">
                      {featured.title}
                    </h2>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-gold" aria-hidden />
                </div>
              </Link>
            ) : (
              <div className="academic-art relative flex min-h-64 flex-col justify-between overflow-hidden rounded-2xl border border-on-navy/15 bg-navy-deep p-7 sm:min-h-80 sm:p-9">
                <svg
                  viewBox="0 0 440 300"
                  className="absolute inset-0 h-full w-full text-gold/20"
                  aria-hidden="true"
                >
                  <circle cx="300" cy="130" r="105" fill="none" stroke="currentColor" />
                  <circle cx="300" cy="130" r="72" fill="none" stroke="currentColor" />
                  <path
                    d="M0 260H440M0 220H440M220 0V300M260 0V300M300 0V300M340 0V300M380 0V300"
                    stroke="currentColor"
                    strokeWidth="0.5"
                  />
                  <path d="M150 180L245 125L340 180L245 235Z" fill="currentColor" />
                  <path
                    d="M185 200V225Q245 270 305 225V200M340 180V245"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                </svg>
                <p className="relative eyebrow">Kelajakka bir qadam</p>
                <div className="relative max-w-xs">
                  <BookOpen className="mb-5 h-9 w-9 text-gold" strokeWidth={1.3} aria-hidden />
                  <p className="font-display text-3xl leading-tight sm:text-4xl">
                    Katta maqsadlar.
                    <br />
                    Har kungi izlanish.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="yangiliklar" className="home-section scroll-mt-28">
        <div className="container-site">
          <SectionHeading
            eyebrow="Maktab kundaligi"
            title="Maktabimizdan yangiliklar"
            intro="Yangi xabarlar, tadbirlar va esda qolarli lahzalar."
            action={{ to: "/yangiliklar", label: "Barcha yangiliklar" }}
          />
          {posts.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => (
                <PostCard key={p.slug} post={p} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Yangiliklar tez orada"
              description="Maktabimizning yangi xabarlari shu yerda e’lon qilinadi."
            />
          )}
        </div>
      </section>

      <section className="border-y bg-secondary">
        <div className="container-site grid gap-0 md:grid-cols-3">
          {[
            {
              to: "/maktab" as const,
              icon: BookOpen,
              title: "Maktab bilan tanishing",
              description: "Ta’lim muhiti va maktab haqida.",
            },
            {
              to: "/yutuqlar" as const,
              icon: Trophy,
              title: "Natijalarimizni ko‘ring",
              description: "Olimpiadalar va sertifikatlar.",
            },
            {
              to: "/qabul" as const,
              icon: GraduationCap,
              title: "Qabul haqida bilib oling",
              description: "O‘qishga kirish bo‘yicha ma’lumot.",
            },
          ].map(({ to, icon: Icon, title, description }) => (
            <Link
              key={to}
              to={to}
              className="group flex items-center gap-4 border-b py-7 last:border-0 md:border-b-0 md:pr-6"
            >
              <Icon className="h-7 w-7 shrink-0 text-primary" strokeWidth={1.4} aria-hidden />
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-primary group-hover:underline">
                  {title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            </Link>
          ))}
        </div>
      </section>

      <section className="home-section container-site">
        <SectionHeading
          eyebrow="Izlanishdan natijaga"
          title="O‘quvchilarimiz yutuqlari"
          intro="Fan olimpiadalari, xalqaro sertifikatlar va e’lon qilingan natijalar."
          action={{ to: "/yutuqlar", label: "Barcha yutuqlar" }}
        />
        {achievements.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
      </section>

      <section className="home-section bg-navy-deep text-on-navy">
        <div className="container-site">
          <div className="mb-9 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="eyebrow">Darslardan tashqari</p>
              <h2 className="mt-3 text-3xl font-medium md:text-4xl">Maktab hayoti</h2>
              <p className="mt-3 text-on-navy-muted">
                To‘garaklar, loyihalar va birga yaratilgan xotiralar.
              </p>
            </div>
            <Link
              className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-gold"
              to="/maktab-hayoti"
            >
              Barcha faoliyatlar <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          {life.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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

      <section className="home-section container-site">
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
          />
        )}
      </section>

      <section className="container-site pb-16 md:pb-20">
        <div className="contact-banner flex flex-col items-start justify-between gap-7 rounded-2xl border bg-secondary p-7 md:flex-row md:items-center md:p-10">
          <div className="max-w-xl">
            <p className="eyebrow">Doim aloqadamiz</p>
            <h2 className="mt-3 text-3xl font-medium text-primary">Savolingiz bormi?</h2>
            <p className="mt-3 text-muted-foreground">
              Maktab ma’muriyatiga murojaat yuboring yoki yangiliklarni Telegram kanalimizda
              kuzating.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3">
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
