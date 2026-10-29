"use client";

import { useRef, useState } from "react";
import { AchievementCard } from "@/components/site/cards";
import { CertificateModal } from "@/components/site/CertificateModal";
import { EmptyState, LoadingState } from "@/components/site/common";
import { FilterBar, SelectField } from "@/components/site/filters";
import { PageHero } from "@/components/site/PageHero";
import type { Achievement } from "@school/contracts/models";
import { getAchievementsPage, getAchievementFilters } from "@/api/achievement";
import {
  achievementTypes,
  achievementStages,
  type AchievementQuery,
} from "@school/contracts/achievement";
import { MEDIA } from "@/config/brand";

const ALL = "Barchasi";

export default function Achievements({ initialData }: { initialData: PageData }) {
  const initial = initialData;
  const [items, setItems] = useState(initial.page.items);
  const [more, setMore] = useState(initial.page.hasMore);
  const [offset, setOffset] = useState(initial.page.items.length);
  const [f, setF] = useState({ year: ALL, subject: ALL, type: ALL, stage: ALL });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const retryAppend = useRef(false);
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
    retryAppend.current = append;
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
      <PageHero
        eyebrow="Yutuqlar"
        title="O‘quvchilar yutuqlari"
        intro="Olimpiadalar va sertifikatlar bo‘yicha e’lon qilingan natijalar."
        image={MEDIA.science}
      />
      <div className="container-site py-12 md:py-16">
        <FilterBar className="mb-8">
          {(Object.keys(labels) as (keyof typeof f)[]).map((key) => (
            <SelectField
              key={key}
              id={`ach-${key}`}
              label={labels[key]}
              value={f[key]}
              onChange={(value) => change(key, value)}
              options={opts[key].map((v) => ({ value: v, label: v }))}
            />
          ))}
        </FilterBar>

        {error && (
          <div
            role="alert"
            className="card-surface flex flex-col items-center gap-4 py-12 text-center"
          >
            <p className="text-destructive">{error}</p>
            <button
              className="btn btn-outline"
              disabled={loading}
              onClick={() => void load(f, retryAppend.current)}
            >
              Qayta urinish
            </button>
          </div>
        )}
        {loading && !items.length ? (
          <LoadingState label="Yutuqlar yuklanmoqda…" />
        ) : !items.length && !error ? (
          <EmptyState
            title="Mos yutuq topilmadi"
            description="Filtrlarni o‘zgartiring yoki keyinroq qayta tekshiring."
          >
            <button className="btn btn-outline" onClick={clear}>
              Filtrlarni tozalash
            </button>
          </EmptyState>
        ) : items.length > 0 ? (
          <div aria-busy={loading}>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <AchievementCard key={item.id} a={item} onPreview={setCert} />
              ))}
            </div>
            {more && !error && (
              <div className="mt-10 text-center">
                <button
                  className="btn btn-outline"
                  disabled={loading}
                  onClick={() => void load(f, true)}
                >
                  {loading ? "Yuklanmoqda…" : "Ko‘proq ko‘rsatish"}
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>
      <CertificateModal item={cert} onClose={() => setCert(null)} />
    </>
  );
}

type PageData = {
  page: Awaited<ReturnType<typeof getAchievementsPage>>;
  options: Awaited<ReturnType<typeof getAchievementFilters>>;
};
