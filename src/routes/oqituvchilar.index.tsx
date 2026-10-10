import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import { TeacherCard } from "@/components/site/cards";
import { EmptyState, PageHeader } from "@/components/site/common";
import { getTeachers } from "@/lib/api";
import { pageHead } from "@/lib/site";

export const Route = createFileRoute("/oqituvchilar/")({
  head: () => pageHead("O‘qituvchilar", "Maktab o‘qituvchilari ro‘yxati va ularning fanlari."),
  loader: () => getTeachers(),
  component: Teachers,
});

function Teachers() {
  const teachers = Route.useLoaderData();
  const [q, setQ] = useState("");
  const [subject, setSubject] = useState("Barchasi");
  const subjects = ["Barchasi", ...Array.from(new Set(teachers.map((t) => t.subject)))];
  const list = teachers.filter((t) =>
    (subject === "Barchasi" || t.subject === subject) &&
    (t.name + " " + t.subject).toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <>
      <PageHeader eyebrow="Jamoa" title="O‘qituvchilar" intro="Barcha profillar namuna. Haqiqiy ma’lumotlar tez orada qo‘shiladi." />
      <div className="container-site py-12">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row">
          <label className="relative block w-full sm:max-w-sm">
            <span className="sr-only">O‘qituvchini qidirish</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ism yoki fan…" className="field pl-9" />
          </label>
          <label className="block w-full sm:max-w-xs">
            <span className="sr-only">Fan bo‘yicha saralash</span>
            <select value={subject} onChange={(e) => setSubject(e.target.value)} className="field">
              {subjects.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
        </div>
        {list.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{list.map((t) => <TeacherCard key={t.slug} t={t} />)}</div>
        ) : (
          <EmptyState title="O‘qituvchi topilmadi" description="Qidiruv shartlarini o‘zgartirib ko‘ring." />
        )}
      </div>
    </>
  );
}
