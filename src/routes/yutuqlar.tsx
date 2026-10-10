import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AchievementCard } from "@/components/site/cards";
import { CertificateModal } from "@/components/site/CertificateModal";
import { EmptyState, PageHeader } from "@/components/site/common";
import type { Achievement } from "@/data/types";
import { getAchievements } from "@/lib/api";
import { pageHead } from "@/lib/site";

export const Route = createFileRoute("/yutuqlar")({
  head: () => pageHead("O‘quvchilar yutuqlari", "Fan olimpiadalari, STEM, Al-Xorazmiy, IELTS, SAT va milliy sertifikat natijalari."),
  loader: () => getAchievements(),
  component: Achievements,
});

const PAGE = 6;
const ALL = "Barchasi";
const uniq = (xs: string[]) => [ALL, ...Array.from(new Set(xs)).sort()];

function Achievements() {
  const items = Route.useLoaderData();
  const [f, setF] = useState({ year: ALL, subject: ALL, type: ALL, stage: ALL });
  const [shown, setShown] = useState(PAGE);
  const [cert, setCert] = useState<Achievement | null>(null);

  const opts = useMemo(() => ({
    year: uniq(items.map((i) => i.achievementDate.slice(0, 4))).reverse().sort((a, b) => (a === ALL ? -1 : b === ALL ? 1 : b.localeCompare(a))),
    subject: uniq(items.map((i) => i.subject)),
    type: uniq(items.map((i) => i.type)),
    stage: uniq(items.map((i) => i.stage)),
  }), [items]);

  const list = items.filter((i) =>
    (f.year === ALL || i.achievementDate.startsWith(f.year)) &&
    (f.subject === ALL || i.subject === f.subject) &&
    (f.type === ALL || i.type === f.type) &&
    (f.stage === ALL || i.stage === f.stage));

  const set = (k: keyof typeof f, v: string) => { setF((p) => ({ ...p, [k]: v })); setShown(PAGE); };
  const labels: Record<keyof typeof f, string> = { year: "Yil", subject: "Fan", type: "Yutuq turi", stage: "Bosqich" };

  return (
    <>
      <PageHeader eyebrow="Yutuqlar" title="O‘quvchilar yutuqlari" intro="Barcha yozuvlar namuna. Natijalar turlari bo‘yicha alohida ko‘rsatiladi va o‘zaro reytingda solishtirilmaydi." />
      <div className="container-site py-12">
        <div className="card-surface mb-8 grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(labels) as (keyof typeof f)[]).map((k) => (
            <label key={k} className="block text-sm font-semibold text-primary">
              {labels[k]}
              <select value={f[k]} onChange={(e) => set(k, e.target.value)} className="field mt-1.5 font-normal">
                {opts[k].map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </label>
          ))}
        </div>
        {list.length ? (
          <>
            <p className="mb-5 text-sm text-muted-foreground">{list.length} ta natija</p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {list.slice(0, shown).map((a) => <AchievementCard key={a.id} a={a} onPreview={setCert} />)}
            </div>
            {shown < list.length && (
              <div className="mt-10 text-center">
                <button type="button" className="btn btn-outline" onClick={() => setShown((s) => s + PAGE)}>Ko‘proq ko‘rsatish</button>
              </div>
            )}
          </>
        ) : (
          <EmptyState title="Mos yutuq topilmadi" description="Filtrlarni o‘zgartirib ko‘ring.">
            <button type="button" className="btn btn-outline" onClick={() => setF({ year: ALL, subject: ALL, type: ALL, stage: ALL })}>Filtrlarni tozalash</button>
          </EmptyState>
        )}
      </div>
      <CertificateModal item={cert} onClose={() => setCert(null)} />
    </>
  );
}
