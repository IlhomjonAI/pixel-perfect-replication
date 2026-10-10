import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { AchievementCard } from "@/components/site/cards";
import { CertificateModal } from "@/components/site/CertificateModal";
import { EmptyState, PageHeader } from "@/components/site/common";
import type { Achievement } from "@/data/types";
import { getAchievementsPage, getAchievementFilters } from "@/lib/achievement-api";
import {
  achievementTypes,
  achievementStages,
  type AchievementQuery,
} from "@/lib/achievement-editor";
import { pageHead } from "@/lib/site";
export const Route = createFileRoute("/yutuqlar")({
  head: () =>
    pageHead(
      "O‘quvchilar yutuqlari",
      "Fan olimpiadalari, STEM, Al-Xorazmiy, IELTS, SAT va milliy sertifikat natijalari.",
    ),
  loader: async () => ({
    page: await getAchievementsPage(),
    options: await getAchievementFilters(),
  }),
  component: Achievements,
});
const ALL = "Barchasi";
function Achievements() {
  const initial = Route.useLoaderData();
  const [items, setItems] = useState(initial.page.items);
  const [more, setMore] = useState(initial.page.hasMore);
  const [offset, setOffset] = useState(initial.page.items.length);
  const [f, setF] = useState({ year: ALL, subject: ALL, type: ALL, stage: ALL });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cert, setCert] = useState<Achievement | null>(null);
  const sequence = useRef(0);
  const opts = {
    year: [ALL, ...initial.options.year],
    subject: [ALL, ...initial.options.subject],
    type: [ALL, ...achievementTypes],
    stage: [ALL, ...achievementStages],
  };
  const labels = { year: "Yil", subject: "Fan", type: "Yutuq turi", stage: "Bosqich" };
  async function load(filters: typeof f, append = false) {
    const current = ++sequence.current;
    setLoading(true);
    setError("");
    const query: Partial<AchievementQuery> = { limit: 12, offset: append ? offset : 0 };
    if (filters.year !== ALL) query.year = filters.year;
    if (filters.subject !== ALL) query.subject = filters.subject;
    if (filters.type !== ALL) query.type = filters.type as AchievementQuery["type"];
    if (filters.stage !== ALL) query.stage = filters.stage as AchievementQuery["stage"];
    try {
      const page = await getAchievementsPage(query);
      if (current !== sequence.current) return;
      setItems((previous) =>
        append
          ? [...previous, ...page.items.filter((v) => !previous.some((p) => p.id === v.id))]
          : page.items,
      );
      setOffset((append ? offset : 0) + page.items.length);
      setMore(page.hasMore);
    } catch {
      if (current === sequence.current) {
        setError("Yutuqlar yuklanmadi. Qayta urinib ko‘ring.");
        if (!append) {
          setItems([]);
          setMore(false);
        }
      }
    } finally {
      if (current === sequence.current) setLoading(false);
    }
  }
  function change(key: keyof typeof f, value: string) {
    const next = { ...f, [key]: value };
    setF(next);
    void load(next);
  }
  function clear() {
    const next = { year: ALL, subject: ALL, type: ALL, stage: ALL };
    setF(next);
    void load(next);
  }
  return (
    <>
      <PageHeader
        eyebrow="Yutuqlar"
        title="O‘quvchilar yutuqlari"
        intro="Olimpiadalar va sertifikatlar bo‘yicha e’lon qilingan natijalar."
      />
      <div className="container-site py-12">
        <div className="card-surface mb-8 grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(labels) as (keyof typeof f)[]).map((key) => (
            <label key={key} className="block text-sm font-semibold text-primary">
              {labels[key]}
              <select
                value={f[key]}
                onChange={(e) => change(key, e.target.value)}
                className="field mt-1.5 font-normal"
              >
                {opts[key].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
          ))}
        </div>
        {loading && (
          <p role="status" className="mb-5 text-muted-foreground">
            Yuklanmoqda…
          </p>
        )}
        {error ? (
          <div role="alert" className="py-8">
            <p className="text-destructive">{error}</p>
            <button className="btn btn-outline mt-4" onClick={() => void load(f)}>
              Qayta urinish
            </button>
          </div>
        ) : !loading && !items.length ? (
          <EmptyState
            title="Mos yutuq topilmadi"
            description="Filtrlarni o‘zgartiring yoki keyinroq qayta tekshiring."
          >
            <button className="btn btn-outline" onClick={clear}>
              Filtrlarni tozalash
            </button>
          </EmptyState>
        ) : (
          <div aria-busy={loading}>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <AchievementCard key={item.id} a={item} onPreview={setCert} />
              ))}
            </div>
            {more && (
              <div className="mt-10 text-center">
                <button
                  className="btn btn-outline"
                  disabled={loading}
                  onClick={() => void load(f, true)}
                >
                  Ko‘proq ko‘rsatish
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <CertificateModal item={cert} onClose={() => setCert(null)} />
    </>
  );
}
