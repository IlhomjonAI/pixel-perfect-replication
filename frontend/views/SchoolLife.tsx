"use client";

import { PhotoGallery } from "@/components/site/PhotoGallery";
import { EmptyState } from "@/components/site/common";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { SchoolLifeCard } from "@/components/site/SchoolLifeCard";
import { MEDIA } from "@/config/brand";
import { useLoadMore } from "@/hooks/use-load-more";
import { getSchoolLifePage } from "@/api/school-life";

export default function SchoolLife({ initialData }: { initialData: PageData }) {
  const initial = initialData;
  const { items, hasMore, loading, error, loadMore } = useLoadMore({
    initial,
    pageSize: 20,
    keyOf: (item) => item.id,
    load: (offset) => getSchoolLifePage(20, offset),
    errorLabel: "Faoliyatlar yuklanmadi. Qayta urinib ko‘ring.",
  });

  return (
    <>
      <PageHero
        eyebrow="Maktab muhiti"
        title="Maktab hayoti"
        intro="Tadbirlar, to‘garaklar, loyihalar va esda qolarli lahzalar."
        image={MEDIA.collab}
      />
      <section className="container-site pt-12 space-y-5">
        <h2 className="text-3xl font-medium text-primary">Maktabimizdan lavhalar</h2>
        <p className="text-muted-foreground">
          Bosh kirish qismi, yashil hovli, foye va kutubxona — maktab muhiti bilan suratlar orqali
          tanishing.
        </p>
        <PhotoGallery
          images={[MEDIA.hero.src, MEDIA.campus.src, MEDIA.reading.src, MEDIA.library.src]}
          title="Maktabimizdan lavhalar"
        />
        <p className="text-xs text-muted-foreground">
          Kutubxona suratining yorug‘ligi va ranglari tahrirlangan.
        </p>
      </section>
      <section className="container-site py-12 md:py-16">
        {items.length ? (
          <div className="grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => (
              <Reveal
                key={item.id}
                from={index % 2 === 0 ? "left" : "right"}
                delay={(index % 3) * 70}
                className={index === 0 ? "sm:col-span-2" : undefined}
              >
                <SchoolLifeCard item={item} feature={index === 0} />
              </Reveal>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Faoliyatlar tez orada e’lon qilinadi"
            description="Maktab tadbirlari va galereyalar shu yerda chiqadi."
          />
        )}
        {hasMore && (
          <div className="mt-10 text-center">
            <button className="btn btn-outline" disabled={loading} onClick={() => void loadMore()}>
              {loading ? "Yuklanmoqda…" : "Ko‘proq faoliyat"}
            </button>
          </div>
        )}
        {error && (
          <p role="alert" className="mt-4 text-center text-destructive">
            {error}
          </p>
        )}
      </section>
    </>
  );
}

type PageData = NonNullable<Awaited<ReturnType<typeof getSchoolLifePage>>>;
