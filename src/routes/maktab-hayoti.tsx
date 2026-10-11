import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageHeader, EmptyState } from "@/components/site/common";
import { SchoolLifeCard } from "@/components/site/SchoolLifeCard";
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
  const [items, setItems] = useState(initial),
    [offset, setOffset] = useState(initial.length);
  const [more, setMore] = useState(initial.length === 20),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    setItems(initial);
    setOffset(initial.length);
    setMore(initial.length === 20);
  }, [initial]);
  async function loadMore() {
    setBusy(true);
    setError("");
    try {
      const next = await getSchoolLifePage(20, offset);
      setItems((current) => [
        ...current,
        ...next.filter((n) => !current.some((c) => c.id === n.id)),
      ]);
      setOffset((v) => v + next.length);
      setMore(next.length === 20);
    } catch {
      setError("Faoliyatlar yuklanmadi. Qayta urinib ko‘ring.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeader
        eyebrow="Maktab muhiti"
        title="Maktab hayoti"
        intro="Tadbirlar, to‘garaklar, loyihalar va esda qolarli lahzalar."
      />
      <section className="container-site py-12">
        {items.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <SchoolLifeCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Faoliyatlar tez orada e’lon qilinadi"
            description="Maktab tadbirlari va galereyalar shu yerda chiqadi."
          />
        )}
        {more && (
          <div className="mt-8 text-center">
            <button className="btn btn-outline" disabled={busy} onClick={loadMore}>
              {busy ? "Yuklanmoqda…" : "Ko‘proq faoliyat"}
            </button>
          </div>
        )}
        {error && (
          <p role="alert" className="mt-4 text-destructive">
            {error}
          </p>
        )}
      </section>
    </>
  );
}
