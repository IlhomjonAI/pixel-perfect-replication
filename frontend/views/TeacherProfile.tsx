"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DemoBadge, PendingBlock } from "@/components/site/common";
import { PageHero } from "@/components/site/PageHero";
import { PhotoPlaceholder } from "@/components/site/PhotoPlaceholder";
import { Portrait } from "@/components/site/Portrait";
import { Reveal } from "@/components/site/Reveal";
import { getDatabaseTeacher } from "@/api/teacher";
import { PENDING } from "@/config/site";

export default function TeacherProfile({ initialData }: { initialData: PageData }) {
  const t = initialData;
  const rows: [string, string][] = [
    ["Fan", t.subject],
    ["Kasbiy tavsif", t.qualification],
    ["Ma’lumoti", t.education],
    ["Ish tajribasi", t.experience],
  ];
  return (
    <article>
      <PageHero eyebrow={t.subject} title={t.name}>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/oqituvchilar"
            className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-on-navy-muted hover:text-gold"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden /> Barcha o‘qituvchilar
          </Link>
          {t.isDemo && <DemoBadge />}
        </div>
      </PageHero>

      <div className="container-site py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-[minmax(0,320px)_1fr] lg:gap-14">
          <Reveal
            from="left"
            className="aspect-[4/5] overflow-hidden rounded-2xl border bg-secondary shadow-[var(--shadow-card)]"
          >
            <Portrait src={t.photo} name={t.name} eager />
          </Reveal>
          <Reveal from="right" className="min-w-0">
            <dl className="card-surface divide-y divide-border overflow-hidden">
              {rows.map(([k, v]) => (
                <div key={k} className="grid gap-1 px-5 py-4 sm:grid-cols-[180px_1fr]">
                  <dt className="text-sm font-semibold text-muted-foreground">{k}</dt>
                  <dd className="text-foreground">{v}</dd>
                </div>
              ))}
            </dl>

            <h2 className="mt-10 font-display text-2xl text-primary">Ustoz haqida</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-muted-foreground">
              {t.biography}
            </p>

            <h2 className="mt-10 font-display text-2xl text-primary">Sertifikatlar</h2>
            {t.certificates.length ? (
              <ul className="mt-3 space-y-2">
                {t.certificates.map((c) => (
                  <li key={c} className="flex gap-2 text-muted-foreground">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden />
                    {c}
                  </li>
                ))}
              </ul>
            ) : !t.certificateImages?.length ? (
              <p className="mt-3 text-muted-foreground">{PENDING}</p>
            ) : null}

            {!!t.certificateImages?.length && (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {t.certificateImages.map((url, index) => (
                  <a
                    key={url + index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group card-surface card-interactive block overflow-hidden"
                  >
                    <div className="aspect-[4/3] bg-sage/40 p-3">
                      <div className="h-full w-full overflow-hidden rounded-lg">
                        <PhotoPlaceholder
                          src={url}
                          alt={`${t.name} sertifikati ${index + 1}`}
                          fit="contain"
                        />
                      </div>
                    </div>
                    <span className="flex items-center justify-between px-5 py-4 text-sm font-semibold text-primary">
                      Sertifikatni ochish {index + 1}
                      <span aria-hidden>↗</span>
                    </span>
                  </a>
                ))}
              </div>
            )}
          </Reveal>
        </div>

        {!t.certificates.length && !t.certificateImages?.length && (
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            <PendingBlock title="Kasbiy yutuqlar" />
          </div>
        )}
      </div>
    </article>
  );
}

type PageData = NonNullable<Awaited<ReturnType<typeof getDatabaseTeacher>>>;
