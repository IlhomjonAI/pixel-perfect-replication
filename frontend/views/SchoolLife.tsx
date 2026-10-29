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
      <section className="container-site pt-12 space-y-12">
        <div className="max-w-2xl space-y-4">
          <h2 className="text-3xl font-medium text-primary">Maktabimizdan lavhalar</h2>
          <p className="text-muted-foreground">
            Bilim olish, izlanish va faol dam olish uchun yaratilgan maktab muhitini kashf eting.
          </p>
        </div>
        {[
          {
            title: "Ilm va izlanish",
            description:
              "Informatika, fizika va matematika xonalari — yangi bilimlar sari har kungi qadam.",
            photos: [MEDIA.notebook, MEDIA.science, MEDIA.classroom, MEDIA.learning],
          },
          {
            title: "Mutolaa va qadriyatlar",
            description:
              "Kutubxonadagi kitoblar olami, milliy qadriyatlar burchagi va yorug‘ foye.",
            photos: [MEDIA.library, MEDIA.shelves, MEDIA.heritage, MEDIA.reading],
          },
          {
            title: "Ochiq osmon ostida",
            description: "Maktab binosi, yashil yo‘laklar va sport maydoni.",
            photos: [MEDIA.hero, MEDIA.campus, MEDIA.garden, MEDIA.collab],
          },
        ].map((group) => (
          <div key={group.title} className="space-y-5">
            <div className="border-l-2 border-gold pl-5">
              <h3 className="text-2xl font-medium text-primary">{group.title}</h3>
              <p className="mt-2 text-muted-foreground">{group.description}</p>
            </div>
            <PhotoGallery
              images={group.photos.map((photo) => photo.src)}
              captions={group.photos.map((photo) => photo.caption)}
              title={group.title}
              landscape
            />
          </div>
        ))}
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
