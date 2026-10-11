import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Award } from "lucide-react";
import type { Achievement, Post, Teacher } from "@/data/types";
import { formatDate } from "@/lib/site";
import { DemoBadge } from "./common";
import { PhotoPlaceholder } from "./PhotoPlaceholder";

export function PostCard({ post }: { post: Post }) {
  return (
    <Link
      to="/yangiliklar/$slug"
      params={{ slug: post.slug }}
      className="card-surface card-interactive group flex flex-col overflow-hidden"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <PhotoPlaceholder
          src={post.coverImage}
          alt={post.title}
          className="transition-transform duration-300 group-hover:scale-[1.025]"
        />
        <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
          {post.category}
        </span>
        {post.isDemo && <DemoBadge className="absolute right-3 top-3" />}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <time dateTime={post.date} className="text-xs font-medium text-muted-foreground">
          {formatDate(post.date)}
        </time>
        <h3 className="mt-2 text-lg font-semibold leading-snug text-primary group-hover:underline group-hover:decoration-gold group-hover:underline-offset-4">
          {post.title}
        </h3>
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {post.excerpt}
        </p>
        <span className="mt-5 flex items-center justify-between border-t pt-4 text-xs font-semibold text-primary">
          Batafsil o‘qish <ArrowUpRight className="h-4 w-4" aria-hidden />
        </span>
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
    <article className="card-surface flex flex-col overflow-hidden">
      <button
        type="button"
        onClick={() => onPreview?.(a)}
        disabled={!onPreview}
        aria-label={`${a.title} — sertifikatni ko‘rish`}
        className="relative aspect-[4/3] overflow-hidden border-b enabled:cursor-zoom-in"
      >
        <PhotoPlaceholder
          src={a.certificateImage}
          label="Sertifikat surati uchun joy"
          alt={a.title}
          fit="contain"
        />
        {a.isDemo && <DemoBadge className="absolute right-3 top-3" />}
      </button>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-accent px-2.5 py-0.5 font-semibold text-accent-foreground">
            {a.type}
          </span>
          <span className="text-muted-foreground">
            {a.stage} · {a.achievementDate.slice(0, 4)}
          </span>
        </div>
        <h3 className="mt-3 text-base font-semibold leading-snug text-primary">{a.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {a.studentName}, {a.classAtAchievement}
        </p>
        <p className="mt-auto flex items-center gap-2 pt-4 text-sm font-semibold text-foreground">
          <Award className="h-4 w-4 text-gold" aria-hidden /> {a.result}
        </p>
      </div>
    </article>
  );
}

export function TeacherCard({ t }: { t: Teacher }) {
  return (
    <Link
      to="/oqituvchilar/$slug"
      params={{ slug: t.slug }}
      className="card-surface card-interactive group overflow-hidden"
    >
      <div className="relative aspect-[4/5]">
        <PhotoPlaceholder src={t.photo} label="O‘qituvchi fotosurati uchun joy" alt={t.name} />
        {t.isDemo && <DemoBadge className="absolute right-3 top-3" />}
      </div>
      <div className="p-5">
        <p className="eyebrow">{t.subject}</p>
        <h3 className="mt-1 text-lg font-semibold text-primary group-hover:underline group-hover:decoration-gold group-hover:underline-offset-4">
          {t.name}
        </h3>
      </div>
    </Link>
  );
}
