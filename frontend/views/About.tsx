"use client";

import { Eyebrow, PendingBlock } from "@/components/site/common";
import { PageHero } from "@/components/site/PageHero";
import { PhotoPlaceholder } from "@/components/site/PhotoPlaceholder";
import { Reveal } from "@/components/site/Reveal";
import { MEDIA } from "@/config/brand";
import { SCHOOL_NAME } from "@/config/site";
import { SCHOOL_LEADERSHIP } from "@school/contracts/staff";
import { Portrait } from "@/components/site/Portrait";

export default function About() {
  return (
    <>
      <PageHero
        eyebrow="Maktab haqida"
        title={SCHOOL_NAME}
        intro="Maktab haqidagi rasmiy ma’lumotlar tasdiqlanganidan so‘ng ushbu bo‘limlarga qo‘shiladi."
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
              Maktabning umumiy tavsifi, qadriyatlari va ta’lim muhiti haqidagi matn tez orada
              qo‘shiladi. Har bir bo‘lim tasdiqlangan ma’lumot asosida to‘ldirib boriladi.
            </p>
          </Reveal>
          <Reveal
            from="right"
            className="aspect-[4/3] overflow-hidden rounded-2xl border bg-secondary shadow-[var(--shadow-card)]"
          >
            <PhotoPlaceholder label="Maktab surati tez orada qo‘shiladi" />
          </Reveal>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <PendingBlock title="Tarix">
            Maktab tarixi haqidagi tasdiqlangan ma’lumot tez orada qo‘shiladi.
          </PendingBlock>
          <PendingBlock title="Ta’lim yo‘nalishlari">
            Ixtisoslashgan fanlar va o‘quv dasturlari haqidagi ma’lumot tez orada qo‘shiladi.
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

        <section>
          <Reveal from="up">
            <PendingBlock title="Imkoniyatlar va jihozlar">
              Sinfxonalar, laboratoriyalar va boshqa imkoniyatlar haqidagi ma’lumot tasdiqlangandan
              so‘ng qo‘shiladi.
            </PendingBlock>
          </Reveal>
        </section>
      </div>
    </>
  );
}
