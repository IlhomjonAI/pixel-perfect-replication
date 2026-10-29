"use client";

import { useMemo, useState } from "react";
import { TeacherCard } from "@/components/site/cards";
import { EmptyState } from "@/components/site/common";
import { ChipGroup, FilterBar, ResultsCount, SearchField } from "@/components/site/filters";
import { PageHero } from "@/components/site/PageHero";
import { MEDIA } from "@/config/brand";
import { useLoadMore } from "@/hooks/use-load-more";
import { getTeachersPage } from "@/api/teacher";
import { matchesSearch } from "@/lib/search";

export default function Teachers({ initialData }: { initialData: PageData }) {
  const initial = initialData;
  const {
    items: teachers,
    hasMore,
    loading,
    error,
    loadMore,
  } = useLoadMore({
    initial,
    pageSize: 50,
    keyOf: (t) => t.slug,
    load: (offset) => getTeachersPage(50, offset),
    errorLabel: "Ustozlar yuklanmadi. Qayta urinib ko‘ring.",
  });
  const [q, setQ] = useState("");
  const [subject, setSubject] = useState("all");

  const subjects = useMemo(
    () => [
      { value: "all", label: "Barcha fanlar" },
      ...Array.from(new Set(teachers.map((t) => t.subject))).map((s) => ({
        value: s,
        label: s,
      })),
    ],
    [teachers],
  );

  const list = teachers.filter(
    (t) =>
      (subject === "all" || t.subject === subject) && matchesSearch(t.name + " " + t.subject, q),
  );

  return (
    <>
      <PageHero
        eyebrow="Jamoa"
        title="O‘qituvchilar"
        intro="Maktabimiz ustozlari, ularning tajribasi va malakasi."
        image={MEDIA.classroom}
      />
      <div className="container-site py-12 md:py-16">
        <FilterBar>
          <SearchField
            id="teacher-search"
            value={q}
            onChange={setQ}
            label="O‘qituvchini qidirish"
            placeholder="Ism yoki fan bo‘yicha qidirish…"
          />
          <ChipGroup
            label="Fan"
            options={subjects}
            value={subject}
            onChange={setSubject}
            className="md:justify-self-end"
          />
        </FilterBar>

        <div className="mb-6 mt-6 flex flex-wrap items-center justify-between gap-3">
          <ResultsCount count={list.length} label="ta ustoz" />
          {(q || subject !== "all") && (
            <button
              type="button"
              className="text-sm font-semibold text-primary underline underline-offset-4 hover:text-gold-ink"
              onClick={() => {
                setQ("");
                setSubject("all");
              }}
            >
              Filtrlarni tozalash
            </button>
          )}
        </div>

        {list.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((t) => (
              <TeacherCard key={t.slug} t={t} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={
              teachers.length
                ? "O‘qituvchi topilmadi"
                : "Ustozlar profillari tez orada e’lon qilinadi"
            }
            description={
              teachers.length
                ? "Qidiruv shartlarini o‘zgartirib ko‘ring."
                : "E’lon qilingan profillar shu yerda ko‘rsatiladi."
            }
          />
        )}

        {hasMore && (
          <div className="mt-10 flex flex-col items-center gap-3">
            <p className="text-sm text-muted-foreground">
              Qidiruv faqat yuklangan profillar orasida ishlaydi.
            </p>
            <button className="btn btn-outline" disabled={loading} onClick={() => void loadMore()}>
              {loading ? "Yuklanmoqda…" : "Ko‘proq ustoz"}
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

type PageData = NonNullable<Awaited<ReturnType<typeof getTeachersPage>>>;
