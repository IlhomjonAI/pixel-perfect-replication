import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { TeacherCard } from "@/components/site/cards";
import { EmptyState, PageHeader } from "@/components/site/common";
import { getTeachersPage } from "@/lib/teacher-api";
import { getTeachers } from "@/lib/api";
import { pageHead } from "@/lib/site";

export const Route = createFileRoute("/oqituvchilar/")({
  head: () => pageHead("O‘qituvchilar", "Maktab o‘qituvchilari ro‘yxati va ularning fanlari."),
  loader: () => getTeachers(),
  component: Teachers,
});

function Teachers() {
  const initial = Route.useLoaderData();
  const [teachers, setTeachers] = useState(initial);
  const [offset, setOffset] = useState(initial.length);
  const [hasMore, setHasMore] = useState(initial.length === 50);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    setTeachers(initial);
    setOffset(initial.length);
    setHasMore(initial.length === 50);
  }, [initial]);
  async function loadMore() {
    setLoading(true);
    setError("");
    try {
      const next = await getTeachersPage(50, offset);
      setTeachers((current) => [
        ...current,
        ...next.filter((t) => !current.some((p) => p.slug === t.slug)),
      ]);
      setOffset((v) => v + next.length);
      setHasMore(next.length === 50);
    } catch {
      setError("Ustozlar yuklanmadi. Qayta urinib ko‘ring.");
    } finally {
      setLoading(false);
    }
  }
  const [q, setQ] = useState("");
  const [subject, setSubject] = useState("Barchasi");
  const subjects = ["Barchasi", ...Array.from(new Set(teachers.map((t) => t.subject)))];
  const list = teachers.filter(
    (t) =>
      (subject === "Barchasi" || t.subject === subject) &&
      (t.name + " " + t.subject).toLowerCase().includes(q.trim().toLowerCase()),
  );

  return (
    <>
      <PageHeader
        eyebrow="Jamoa"
        title="O‘qituvchilar"
        intro="Maktabimiz ustozlari, ularning tajribasi va malakasi."
      />
      <div className="container-site py-12">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row">
          <label className="relative block w-full sm:max-w-sm">
            <span className="sr-only">O‘qituvchini qidirish</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ism yoki fan…"
              className="field pl-9"
            />
          </label>
          <label className="block w-full sm:max-w-xs">
            <span className="sr-only">Fan bo‘yicha saralash</span>
            <select value={subject} onChange={(e) => setSubject(e.target.value)} className="field">
              {subjects.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
            {list.length} ta ustoz ko‘rsatilmoqda
          </p>
          {(q || subject !== "Barchasi") && (
            <button
              type="button"
              className="text-sm font-semibold text-primary underline"
              onClick={() => {
                setQ("");
                setSubject("Barchasi");
              }}
            >
              Filtrlarni tozalash
            </button>
          )}
        </div>
        {list.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
          <div className="mt-8 text-center">
            <p className="mb-3 text-sm text-muted-foreground">
              Qidiruv yuklangan profillar orasida ishlaydi.
            </p>
            <button className="btn btn-outline" disabled={loading} onClick={loadMore}>
              {loading ? "Yuklanmoqda…" : "Ko‘proq ustoz"}
            </button>
          </div>
        )}
        {error && (
          <p role="alert" className="mt-4 text-destructive">
            {error}
          </p>
        )}
      </div>
    </>
  );
}
