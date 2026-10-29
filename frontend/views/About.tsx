"use client";

import { Eyebrow, PendingBlock } from "@/components/site/common";
import { PageHero } from "@/components/site/PageHero";
import { PhotoPlaceholder } from "@/components/site/PhotoPlaceholder";
import { Reveal } from "@/components/site/Reveal";
import { MEDIA } from "@/config/brand";
import { SCHOOL_NAME } from "@/config/site";
import { SCHOOL_LEADERSHIP } from "@school/contracts/staff";
import { SCHOOL_TEACHERS } from "@school/contracts/staff";
import { PhotoGallery } from "@/components/site/PhotoGallery";
import { Portrait } from "@/components/site/Portrait";

export default function About() {
  return (
    <>
      <PageHero
        eyebrow="Maktab haqida"
        title={SCHOOL_NAME}
        intro="Bilimga intilish, tajribali ustozlar va mutolaa muhiti — maktabimiz bilan yaqindan tanishing."
        image={MEDIA.campus}
      />

      <div className="container-site section-lg space-y-16 md:space-y-24">
        <section className="grid items-center gap-10 md:grid-cols-2 lg:gap-16">
          <Reveal from="left">
            <Eyebrow>Kirish</Eyebrow>
            <h2 className="mt-3 text-[clamp(1.75rem,3.2vw,2.5rem)] font-medium leading-tight text-primary">
              Maktabimiz bilan tanishing
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground md:text-lg">
              Bekobod tumani ixtisoslashtirilgan maktabida aniq va tabiiy fanlar, tillar hamda
              ijtimoiy fanlar bo‘yicha ustozlar faoliyat yuritadi. Kutubxona, yashil hovli va maktab
              jamoasi haqidagi ma’lumotlar bilan ushbu sahifada tanishishingiz mumkin.
            </p>
          </Reveal>
          <Reveal
            from="right"
            className="aspect-[4/3] overflow-hidden rounded-2xl border bg-secondary shadow-[var(--shadow-card)]"
          >
            <PhotoPlaceholder src={MEDIA.hero.src} alt={MEDIA.hero.alt} />
          </Reveal>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <PendingBlock title="Ustozlar jamoasi">
            Xodimlar reyestrida {SCHOOL_TEACHERS.length} nafar fan o‘qituvchisi qayd etilgan.
            Ularning malaka toifasi, ish staji va sertifikatlari bilan ustozlar sahifasida
            tanishing.
          </PendingBlock>
          <PendingBlock title="Fanlar va yo‘nalishlar">
            Matematika, informatika, fizika, kimyo, biologiya, geografiya, tarix, ona tili va
            adabiyoti, o‘zbek tili, ingliz tili, rus tili hamda jismoniy tarbiya.
          </PendingBlock>
        </section>

        <section>
          <Reveal from="up">
            <div className="mb-10">
              <Eyebrow>Rahbariyat</Eyebrow>
              <h2 className="mt-3 text-[clamp(1.75rem,3.2vw,2.5rem)] font-medium leading-tight text-primary">
                Maktab rahbariyati
              </h2>
            </div>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SCHOOL_LEADERSHIP.map((person, index) => (
              <Reveal
                key={person.slug}
                from="up"
                delay={index * 90}
                className="card-surface overflow-hidden"
              >
                <div className="aspect-[4/5] bg-secondary">
                  <Portrait src={person.photo} name={person.name} />
                </div>
                <div className="p-5">
                  <p className="eyebrow">{person.role}</p>
                  <h3 className="mt-3 text-xl font-semibold leading-snug text-primary">
                    {person.name}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {person.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <Eyebrow>Maktab bo‘ylab</Eyebrow>
          <h2 className="text-3xl font-medium text-primary">Mutolaa va ta’lim muhiti</h2>
          <p className="max-w-3xl leading-relaxed text-muted-foreground">
            Kutubxona javonlarida badiiy asarlar va o‘quv adabiyotlari jamlangan. Mutolaa stollari
            kitob bilan ishlash uchun joy ajratadi. Kutubxona mudiri — Baboyeva Zumratoy Xakimdjon
            qizi.
          </p>
          <PhotoGallery
            images={[MEDIA.library.src, MEDIA.campus.src, MEDIA.reading.src]}
            title="Maktab kutubxonasi, hovlisi va foyesi"
          />
          <p className="text-xs text-muted-foreground">
            Maktab taqdim etgan suratlar. Kutubxona surati yorug‘lik va rang bo‘yicha tahrirlangan.
          </p>
        </section>
      </div>
    </>
  );
}
