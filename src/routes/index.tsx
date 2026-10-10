import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Cpu, FlaskConical, Languages, Lightbulb } from "lucide-react";
import { useState } from "react";
import { AchievementCard, PostCard, TeacherCard } from "@/components/site/cards";
import { CertificateModal } from "@/components/site/CertificateModal";
import { DemoBadge, SectionHeading } from "@/components/site/common";
import { PhotoPlaceholder } from "@/components/site/PhotoPlaceholder";
import type { Achievement } from "@/data/types";
import { getAchievements, getPosts, getSchoolLife, getTeachers } from "@/lib/api";
import { pageHead, SCHOOL_NAME } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () =>
    pageHead(
      "Bosh sahifa",
      "Bekobod tuman ixtisoslashtirilgan maktabining ta’lim muhiti, maktab hayoti va o‘quvchilar yutuqlari bilan tanishing.",
    ),
  loader: async () => ({
    posts: await getPosts(6),
    achievements: await getAchievements(4),
    life: await getSchoolLife(),
    teachers: await getTeachers(3),
  }),
  component: Home,
});

const lifeIcons = { stem: FlaskConical, robot: Cpu, eng: Languages, proj: Lightbulb } as const;

function Home() {
  const { posts, achievements, life, teachers } = Route.useLoaderData();
  const [cert, setCert] = useState<Achievement | null>(null);

  return (
    <>
      {/* Hero */}
      <section className="bg-primary text-on-navy">
        <div className="container-site grid items-center gap-10 py-14 md:py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <div>
            <p className="eyebrow">{SCHOOL_NAME}</p>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-6xl">
              Bilim, izlanish va <span className="italic text-gold">yutuqlar</span> maskani
            </h1>
            <p className="mt-6 max-w-xl text-lg text-on-navy-muted">
              Bekobod tuman ixtisoslashtirilgan maktabining ta’lim muhiti, maktab hayoti va
              o‘quvchilar yutuqlari bilan tanishing.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/maktab" className="btn btn-gold">
                Maktab haqida <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link to="/yutuqlar" className="btn btn-ghost-navy">
                Yutuqlarimiz
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] overflow-hidden rounded-2xl border-4 border-on-navy/10">
              <PhotoPlaceholder lazy={false} />
            </div>
            <div className="absolute -bottom-5 left-5 hidden aspect-square w-32 overflow-hidden rounded-xl border-4 border-primary sm:block">
              <PhotoPlaceholder compact lazy={false} />
            </div>
            <div
              className="absolute -right-2 -top-2 hidden h-20 w-20 rounded-full border border-gold md:block"
              aria-hidden
            />
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="container-site grid items-center gap-10 py-20 md:grid-cols-2 md:py-24">
        <div className="order-2 aspect-[5/4] overflow-hidden rounded-2xl md:order-1">
          <PhotoPlaceholder />
        </div>
        <div className="order-1 md:order-2">
          <p className="eyebrow">Maktab haqida</p>
          <h2 className="mt-2 text-3xl font-semibold text-primary md:text-4xl">
            Har bir o‘quvchining salohiyatini ochish uchun
          </h2>
          <p className="mt-5 text-muted-foreground">
            Bu sahifada maktabimizning ta’lim yo‘nalishlari, kundalik hayoti va o‘quvchilarimizning
            muvaffaqiyatlari haqida ma’lumot beriladi. Maktabning batafsil tarixi, imkoniyatlari va
            dasturlari tasdiqlangandan so‘ng qo‘shiladi.
          </p>
          <Link
            to="/maktab"
            className="group mt-7 inline-flex items-center gap-2 font-semibold text-primary hover:text-gold"
          >
            Batafsil o‘qish{" "}
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              aria-hidden
            />
          </Link>
        </div>
      </section>

      {/* Posts */}
      <section className="border-y bg-secondary py-20 md:py-24">
        <div className="container-site">
          <SectionHeading
            eyebrow="So‘nggi xabarlar"
            title="Maktab hayotidan lavhalar"
            intro="Maktabimizning so‘nggi yangiliklari, tadbirlari va e’lonlari."
            action={{ to: "/yangiliklar", label: "Barcha yangiliklar" }}
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
            {!posts.length && (
              <p className="text-muted-foreground">Yangiliklar tez orada e’lon qilinadi.</p>
            )}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="container-site py-20 md:py-24">
        <SectionHeading
          eyebrow="Yutuqlar"
          title="O‘quvchilarimiz muvaffaqiyatlari"
          intro="Fan olimpiadalari va sertifikatlar bo‘yicha e’lon qilingan natijalar."
          action={{ to: "/yutuqlar", label: "Barcha yutuqlar" }}
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {achievements.map((a) => (
            <AchievementCard key={a.id} a={a} onPreview={setCert} />
          ))}
        </div>
      </section>

      {/* School life */}
      <section className="bg-navy-deep py-20 text-on-navy md:py-24">
        <div className="container-site">
          <div className="mb-10 max-w-2xl">
            <p className="eyebrow">Maktab hayoti</p>
            <h2 className="mt-2 text-3xl font-semibold md:text-4xl">
              To‘garaklar, loyihalar va faoliyatlar
            </h2>
            <p className="mt-3 text-on-navy-muted">
              Namuna yo‘nalishlar. Haqiqiy to‘garaklar ro‘yxati keyinroq qo‘shiladi.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {life.map((l) => {
              const Icon = lifeIcons[l.id as keyof typeof lifeIcons] ?? Lightbulb;
              return (
                <article key={l.id} className="overflow-hidden rounded-xl border border-on-navy/15">
                  <div className="aspect-[4/3]">
                    <PhotoPlaceholder src={l.image} compact />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <Icon className="h-6 w-6 text-gold" strokeWidth={1.5} aria-hidden />
                      {l.isDemo && <DemoBadge />}
                    </div>
                    <h3 className="mt-3 text-xl font-semibold">{l.title}</h3>
                    <p className="mt-1 text-sm text-on-navy-muted">{l.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Teachers */}
      <section className="container-site py-20 md:py-24">
        <SectionHeading
          eyebrow="Jamoa"
          title="O‘qituvchilarimiz"
          intro="Namuna profillar. O‘qituvchilar ma’lumotlari tez orada qo‘shiladi."
          action={{ to: "/oqituvchilar", label: "Barcha o‘qituvchilar" }}
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {teachers.map((t) => (
            <TeacherCard key={t.slug} t={t} />
          ))}
        </div>
      </section>

      <CertificateModal item={cert} onClose={() => setCert(null)} />
    </>
  );
}
