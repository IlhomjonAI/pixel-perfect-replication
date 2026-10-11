import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { PostCard } from "@/components/site/cards";
import { EmptyState, PageHeader } from "@/components/site/common";
import type { PostCategory } from "@/data/types";
import { getPosts } from "@/lib/api";
import { pageHead } from "@/lib/site";

export const Route = createFileRoute("/yangiliklar/")({
  head: () => pageHead("Yangiliklar", "Maktab yangiliklari, tadbirlari va e’lonlari."),
  loader: () => getPosts(),
  component: News,
});

const CATS: ("Barchasi" | PostCategory)[] = ["Barchasi", "Yangilik", "Tadbir", "E’lon"];

function News() {
  const posts = Route.useLoaderData();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<(typeof CATS)[number]>("Barchasi");
  const list = useMemo(() => posts.filter((p) =>
    (cat === "Barchasi" || p.category === cat) &&
    (p.title + " " + p.excerpt).toLowerCase().includes(q.trim().toLowerCase())), [posts, q, cat]);

  return (
    <>
      <PageHeader eyebrow="Yangiliklar" title="Yangiliklar, tadbirlar va e’lonlar" intro="Hozircha namuna xabarlar ko‘rsatilmoqda." />
      <div className="container-site py-12">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <label className="relative block w-full md:max-w-sm">
            <span className="sr-only">Yangiliklarni qidirish</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Qidirish…" className="field pl-9" />
          </label>
          <div role="group" aria-label="Turkum bo‘yicha saralash" className="flex flex-wrap gap-2">
            {CATS.map((c) => (
              <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(c)}
                className={`btn py-2 text-sm ${cat === c ? "btn-primary" : "btn-outline"}`}>{c}</button>
            ))}
          </div>
        </div>
        {list.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{list.map((p) => <PostCard key={p.slug} post={p} />)}</div>
        ) : (
          <EmptyState title="Hech narsa topilmadi" description="Qidiruv so‘zini yoki turkumni o‘zgartirib ko‘ring.">
            <button type="button" className="btn btn-outline" onClick={() => { setQ(""); setCat("Barchasi"); }}>Filtrlarni tozalash</button>
          </EmptyState>
        )}
      </div>
    </>
  );
}
