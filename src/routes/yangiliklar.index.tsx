import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PostCard } from "@/components/site/cards";
import { EmptyState } from "@/components/site/common";
import { PageHero } from "@/components/site/PageHero";
import { ChipGroup, FilterBar, ResultsCount, SearchField } from "@/components/site/filters";
import { getPostsPage } from "@/lib/news-api";
import { useLoadMore } from "@/lib/paging";
import { pageHead } from "@/lib/site";

export const Route = createFileRoute("/yangiliklar/")({
  head: () => pageHead("Yangiliklar", "Maktab yangiliklari, tadbirlari va e’lonlari."),
  loader: () => getPostsPage(50),
  component: News,
});

const CATS = [
  { value: "all", label: "Barchasi" },
  { value: "Yangilik", label: "Yangilik" },
  { value: "Tadbir", label: "Tadbir" },
  { value: "E’lon", label: "E’lon" },
];

function News() {
  const initialPosts = Route.useLoaderData();
  const {
    items: posts,
    hasMore,
    loading,
    error,
    loadMore,
  } = useLoadMore({
    initial: initialPosts,
    pageSize: 50,
    keyOf: (p) => p.slug,
    load: (offset) => getPostsPage(50, offset),
  });
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");

  const list = useMemo(
    () =>
      posts.filter(
        (p) =>
          (cat === "all" || p.category === cat) &&
          (p.title + " " + p.excerpt).toLowerCase().includes(q.trim().toLowerCase()),
      ),
    [posts, q, cat],
  );

  return (
    <>
      <PageHero
        eyebrow="Yangiliklar"
        title="Yangiliklar, tadbirlar va e’lonlar"
        intro="Maktabimiz hayotidan yangi xabarlar, tadbirlar va e’lonlar."
      />
      <div className="container-site py-12 md:py-16">
        <FilterBar>
          <SearchField
            id="news-search"
            value={q}
            onChange={setQ}
            label="Yangiliklarni qidirish"
            placeholder="Sarlavha yoki matn bo‘yicha qidirish…"
          />
          <ChipGroup label="Turkum" options={CATS} value={cat} onChange={setCat} />
        </FilterBar>

        <div className="mb-6 mt-6 flex flex-wrap items-center justify-between gap-3">
          <ResultsCount count={list.length} label="ta xabar" />
          {(q || cat !== "all") && (
            <button
              type="button"
              className="text-sm font-semibold text-primary underline underline-offset-4 hover:text-gold-ink"
              onClick={() => {
                setQ("");
                setCat("all");
              }}
            >
              Filtrlarni tozalash
            </button>
          )}
        </div>

        {list.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={posts.length ? "Hech narsa topilmadi" : "Yangiliklar tez orada"}
            description={
              posts.length
                ? "Qidiruv so‘zini yoki turkumni o‘zgartirib ko‘ring."
                : "E’lon qilingan yangiliklar shu yerda ko‘rsatiladi."
            }
          >
            {posts.length > 0 && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setQ("");
                  setCat("all");
                }}
              >
                Filtrlarni tozalash
              </button>
            )}
          </EmptyState>
        )}

        {hasMore && (
          <div className="mt-10 flex flex-col items-center gap-3">
            <p className="text-sm text-muted-foreground">
              Qidiruv faqat yuklangan xabarlar orasida ishlaydi.
            </p>
            <button disabled={loading} className="btn btn-outline" onClick={() => void loadMore()}>
              {loading ? "Yuklanmoqda…" : "Ko‘proq yangilik"}
            </button>
          </div>
        )}
        {error && (
          <p role="alert" className="mt-4 text-center text-destructive">
            {error}
          </p>
        )}
      </div>
    </>
  );
}
