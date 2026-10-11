import { createFileRoute } from "@tanstack/react-router";
import { EmptyState } from "@/components/site/common";
import { PageHero } from "@/components/site/PageHero";
import { SchoolLifeCard } from "@/components/site/SchoolLifeCard";
import { useLoadMore } from "@/lib/paging";
import { getSchoolLifePage } from "@/lib/school-life-api";
import { pageHead } from "@/lib/site";

export const Route = createFileRoute("/maktab-hayoti")({
  head: () =>
    pageHead("Maktab hayoti", "Maktab tadbirlari, to‘garaklar, loyihalar va fotogalereyalar."),
  loader: () => getSchoolLifePage(20),
  component: SchoolLife,
});

function SchoolLife() {
  const initial = Route.useLoaderData();
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
      />
      <section className="container-site py-12 md:py-16">
        {items.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => (
              <SchoolLifeCard key={item.id} item={item} feature={index === 0} />
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
