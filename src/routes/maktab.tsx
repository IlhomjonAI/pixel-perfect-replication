import { createFileRoute } from "@tanstack/react-router";
import { Eyebrow, PendingBlock } from "@/components/site/common";
import { PageHero } from "@/components/site/PageHero";
import { PhotoPlaceholder } from "@/components/site/PhotoPlaceholder";
import { pageHead, SCHOOL_NAME } from "@/lib/site";

export const Route = createFileRoute("/maktab")({
  head: () =>
    pageHead(
      "Maktab haqida",
      `${SCHOOL_NAME}: tarix, ta’lim yo‘nalishlari, rahbariyat va imkoniyatlar.`,
    ),
  component: About,
});

const LEADERSHIP = [
  "Direktor",
  "O‘quv ishlari bo‘yicha direktor o‘rinbosari",
  "Ma’naviy-ma’rifiy ishlar bo‘yicha o‘rinbosar",
];

function About() {
  return (
    <>
      <PageHero
        eyebrow="Maktab haqida"
        title={SCHOOL_NAME}
        intro="Maktab haqidagi rasmiy ma’lumotlar tasdiqlanganidan so‘ng ushbu bo‘limlarga qo‘shiladi."
      />

      <div className="container-site section-lg space-y-16 md:space-y-24">
        <section className="grid items-center gap-10 md:grid-cols-2 lg:gap-16">
          <div className="reveal">
            <Eyebrow>Kirish</Eyebrow>
            <h2 className="mt-3 text-[clamp(1.75rem,3.2vw,2.5rem)] font-medium leading-tight text-primary">
              Maktabimiz bilan tanishing
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground md:text-lg">
              Maktabning umumiy tavsifi, qadriyatlari va ta’lim muhiti haqidagi matn tez orada
              qo‘shiladi. Har bir bo‘lim tasdiqlangan ma’lumot asosida to‘ldirib boriladi.
            </p>
          </div>
          <div className="reveal aspect-[4/3] overflow-hidden rounded-2xl border bg-secondary shadow-[var(--shadow-card)]">
            <PhotoPlaceholder label="Maktab surati tez orada qo‘shiladi" />
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <PendingBlock title="Tarix">
            Maktab tarixi haqidagi tasdiqlangan ma’lumot tez orada qo‘shiladi.
          </PendingBlock>
          <PendingBlock title="Ta’lim yo‘nalishlari">
            Ixtisoslashgan fanlar va o‘quv dasturlari haqidagi ma’lumot tez orada qo‘shiladi.
          </PendingBlock>
        </section>

        <section className="reveal">
          <div className="mb-10">
            <Eyebrow>Rahbariyat</Eyebrow>
            <h2 className="mt-3 text-[clamp(1.75rem,3.2vw,2.5rem)] font-medium leading-tight text-primary">
              Maktab rahbariyati
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {LEADERSHIP.map((role) => (
              <div key={role} className="card-surface overflow-hidden">
                <div className="aspect-[4/5] bg-secondary">
                  <PhotoPlaceholder label="Fotosurat uchun joy" compact />
                </div>
                <div className="p-5">
                  <p className="eyebrow">{role}</p>
                  <p className="mt-2 font-semibold text-primary">Ma’lumot tez orada qo‘shiladi</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="reveal">
          <PendingBlock title="Imkoniyatlar va jihozlar">
            Sinfxonalar, laboratoriyalar va boshqa imkoniyatlar haqidagi ma’lumot tasdiqlangandan
            so‘ng qo‘shiladi.
          </PendingBlock>
        </section>
      </div>
    </>
  );
}
