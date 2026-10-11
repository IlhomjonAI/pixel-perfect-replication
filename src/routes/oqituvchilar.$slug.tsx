import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { DemoBadge, EmptyState } from "@/components/site/common";
import { PhotoPlaceholder } from "@/components/site/PhotoPlaceholder";
import { getTeacher } from "@/lib/api";
import { pageHead, PENDING } from "@/lib/site";

export const Route = createFileRoute("/oqituvchilar/$slug")({
  loader: async ({ params }) => {
    const t = await getTeacher(params.slug);
    if (!t) throw notFound();
    return t;
  },
  head: ({ loaderData }) =>
    loaderData
      ? pageHead(loaderData.name, `${loaderData.name} — ${loaderData.subject} o‘qituvchisi profili.`)
      : { meta: [{ title: "O‘qituvchi topilmadi" }, { name: "robots", content: "noindex" }] },
  notFoundComponent: TeacherNotFound,
  component: TeacherProfile,
});

function TeacherNotFound() {
  return (
    <div className="container-site py-20">
      <EmptyState title="O‘qituvchi topilmadi">
        <Link to="/oqituvchilar" className="btn btn-primary">O‘qituvchilarga qaytish</Link>
      </EmptyState>
    </div>
  );
}

function TeacherProfile() {
  const t = Route.useLoaderData();
  const rows: [string, string][] = [
    ["Fan", t.subject], ["Malaka toifasi", t.qualification], ["Ma’lumoti", t.education], ["Ish tajribasi", t.experience],
  ];
  return (
    <div className="container-site py-12">
      <Link to="/oqituvchilar" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-gold">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Barcha o‘qituvchilar
      </Link>
      <div className="mt-8 grid gap-10 md:grid-cols-[minmax(0,320px)_1fr]">
        <div className="aspect-[4/5] overflow-hidden rounded-2xl"><PhotoPlaceholder src={t.photo} label="O‘qituvchi fotosurati uchun joy" lazy={false} /></div>
        <div>
          {t.isDemo && <DemoBadge />}
          <p className="eyebrow mt-3">{t.subject}</p>
          <h1 className="mt-1 text-4xl font-semibold text-primary">{t.name}</h1>
          <dl className="card-surface mt-6 divide-y">
            {rows.map(([k, v]) => (
              <div key={k} className="grid gap-1 px-5 py-3 sm:grid-cols-[180px_1fr]">
                <dt className="text-sm font-semibold text-muted-foreground">{k}</dt><dd>{v}</dd>
              </div>
            ))}
          </dl>
          <h2 className="mt-8 text-2xl font-semibold text-primary">Tarjimai hol</h2>
          <p className="mt-3 text-muted-foreground">{t.biography}</p>
          <h2 className="mt-8 text-2xl font-semibold text-primary">Sertifikatlar</h2>
          {t.certificates.length ? (
            <ul className="mt-3 list-disc pl-5">{t.certificates.map((c) => <li key={c}>{c}</li>)}</ul>
          ) : <p className="mt-3 text-muted-foreground">{PENDING}</p>}
        </div>
      </div>
    </div>
  );
}
