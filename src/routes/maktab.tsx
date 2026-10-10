import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PendingBlock } from "@/components/site/common";
import { PhotoPlaceholder } from "@/components/site/PhotoPlaceholder";
import { pageHead } from "@/lib/site";

export const Route = createFileRoute("/maktab")({
  head: () => pageHead("Maktab haqida", "Bekobod tuman ixtisoslashtirilgan maktabi: tarix, ta’lim yo‘nalishlari, rahbariyat va imkoniyatlar."),
  component: About,
});

function About() {
  return (
    <>
      <PageHeader eyebrow="Maktab haqida" title="Bekobod tuman ixtisoslashtirilgan maktabi" intro="Maktab haqidagi rasmiy ma’lumotlar tasdiqlanganidan so‘ng ushbu bo‘limlarga qo‘shiladi." />
      <div className="container-site space-y-20 py-16">
        <section className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="eyebrow">Kirish</p>
            <h2 className="mt-2 text-3xl font-semibold text-primary">Maktabimiz bilan tanishing</h2>
            <p className="mt-4 text-muted-foreground">Maktabning umumiy tavsifi va qadriyatlari haqidagi matn tez orada qo‘shiladi.</p>
          </div>
          <div className="aspect-[4/3] overflow-hidden rounded-2xl"><PhotoPlaceholder /></div>
        </section>
        <section className="grid gap-6 md:grid-cols-2">
          <PendingBlock title="Tarix">Maktab tarixi haqidagi tasdiqlangan ma’lumot tez orada qo‘shiladi.</PendingBlock>
          <PendingBlock title="Ta’lim yo‘nalishlari">Ixtisoslashgan fanlar va o‘quv dasturlari haqidagi ma’lumot tez orada qo‘shiladi.</PendingBlock>
        </section>
        <section>
          <p className="eyebrow">Rahbariyat</p>
          <h2 className="mt-2 text-3xl font-semibold text-primary">Maktab rahbariyati</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {["Direktor", "O‘quv ishlari bo‘yicha direktor o‘rinbosari", "Ma’naviy-ma’rifiy ishlar bo‘yicha o‘rinbosar"].map((r) => (
              <div key={r} className="card-surface overflow-hidden">
                <div className="aspect-[4/3]"><PhotoPlaceholder label="Fotosurat uchun joy" /></div>
                <div className="p-5">
                  <p className="eyebrow">{r}</p>
                  <p className="mt-1 font-semibold text-primary">Ma’lumot tez orada qo‘shiladi</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section>
          <PendingBlock title="Imkoniyatlar va jihozlar">Sinfxonalar, laboratoriyalar va boshqa imkoniyatlar haqidagi ma’lumot tasdiqlangandan so‘ng qo‘shiladi.</PendingBlock>
        </section>
      </div>
    </>
  );
}
