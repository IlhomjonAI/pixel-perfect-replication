import { Link } from "@tanstack/react-router";
import { Award, ArrowUpRight } from "lucide-react";
import type { Achievement, Post, Teacher } from "@/data/types";
import { formatDate } from "@/lib/site";
import { DemoBadge, Pill } from "@/components/site/common";
import { PhotoPlaceholder } from "@/components/site/PhotoPlaceholder";
import { cn } from "@/lib/utils";

export function PostCard({ post, feature = false }: { post: Post; feature?: boolean }) {
  return (
    <Link
      to="/yangiliklar/$slug"
      params={{ slug: post.slug }}
      className={cn(
        "card-surface card-interactive group flex h-full flex-col overflow-hidden",
        feature && "md:flex-row",
      )}
    >
      <div
        className={cn(
          "overflow-hidden",
          feature ? "aspect-[16/10] md:aspect-auto md:w-1/2" : "aspect-[16/10]",
        )}
      >
        <PhotoPlaceholder
          src={post.coverImage}
          alt={post.title}
          className={cn(
            feature
              ? "transition-transform duration-700 group-hover:scale-[1.03]"
              : "transition-transform duration-700 group-hover:scale-[1.05]",
          )}
        />
      </div>
      <div className={cn("flex flex-1 flex-col p-5", feature && "md:justify-center md:p-8")}>
        <div className="flex flex-wrap items-center gap-3">
          <Pill tone="soft">{post.category}</Pill>
          <span className="text-xs font-medium text-muted-foreground">{formatDate(post.date)}</span>
        </div>
        <h3
          className={cn(
            "mt-3 font-display leading-snug text-primary",
            feature ? "text-2xl md:text-3xl" : "line-clamp-2 text-xl",
          )}
        >
          {post.title}
        </h3>
        <p
          className={cn(
            "mt-2 text-sm leading-relaxed text-muted-foreground",
            feature ? "line-clamp-3" : "line-clamp-3",
          )}
        >
          {post.excerpt}
        </p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
            Batafsil
            <ArrowUpRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden
            />
          </span>
          {post.isDemo && <DemoBadge />}
        </div>
      </div>
    </Link>
  );
}

export function AchievementCard({
  a,
  onPreview,
}: {
  a: Achievement;
  onPreview?: (a: Achievement) => void;
}) {
  return (
    <article className="card-surface card-interactive flex h-full flex-col overflow-hidden">
      <div className="relative aspect-[4/3] bg-sage/50 p-3">
        <div className="h-full w-full overflow-hidden rounded-lg">
          <PhotoPlaceholder
            src={a.certificateImage}
            alt={`${a.title} — ${a.studentName} sertifikati`}
            fit="contain"
            label="Sertifikat surati tez orada qo‘shiladi"
          />
        </div>
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-forest-deep/85 px-2.5 py-1 text-[11px] font-semibold text-on-navy backdrop-blur">
          <Award className="h-3.5 w-3.5 text-gold" aria-hidden />
          {a.stage}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Pill tone="soft">{a.type}</Pill>
          <span className="text-xs font-medium text-muted-foreground">
            {formatDate(a.achievementDate)}
          </span>
        </div>
        <h3 className="mt-3 line-clamp-2 font-display text-xl leading-snug text-primary">
          {a.title}
        </h3>
        <dl className="mt-3 space-y-1 text-sm text-muted-foreground">
          <div className="flex gap-2">
            <dt className="font-semibold text-foreground">O‘quvchi:</dt>
            <dd className="min-w-0 flex-1">{a.studentName}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-semibold text-foreground">Sinf:</dt>
            <dd className="min-w-0 flex-1">{a.classAtAchievement}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-semibold text-foreground">Natija:</dt>
            <dd className="min-w-0 flex-1">{a.result}</dd>
          </div>
        </dl>
        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <button
            type="button"
            className="btn btn-outline min-h-10 px-4 py-2 text-sm"
            onClick={() => onPreview?.(a)}
          >
            Sertifikatni ko‘rish
          </button>
          {a.isDemo && <DemoBadge />}
        </div>
      </div>
    </article>
  );
}

export function TeacherCard({ t }: { t: Teacher }) {
  return (
    <Link
      to="/oqituvchilar/$slug"
      params={{ slug: t.slug }}
      className="card-surface card-interactive group flex h-full flex-col overflow-hidden"
    >
      <div className="aspect-[4/5] overflow-hidden bg-sage/40">
        <PhotoPlaceholder
          src={t.photo}
          alt={t.name}
          label="Surat tez orada qo‘shiladi"
          className="transition-transform duration-700 group-hover:scale-[1.04]"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 font-display text-xl leading-snug text-primary">{t.name}</h3>
        <p className="mt-1 text-sm font-semibold text-gold-ink">{t.subject}</p>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {t.qualification}
        </p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
            Profil
            <ArrowUpRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden
            />
          </span>
          {t.isDemo && <DemoBadge />}
        </div>
      </div>
    </Link>
  );
}
