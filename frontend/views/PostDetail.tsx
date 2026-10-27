"use client";

import { PhotoGallery } from "@/components/site/PhotoGallery";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DemoBadge } from "@/components/site/common";
import { PageHero } from "@/components/site/PageHero";
import { PhotoPlaceholder } from "@/components/site/PhotoPlaceholder";
import { getDatabasePost } from "@/api/news";
import { formatDate } from "@/config/site";

export default function PostDetail({ initialData }: { initialData: PageData }) {
  const post = initialData;
  const heroImage = post.coverImage ? { src: post.coverImage, alt: post.title, caption: "" } : null;
  return (
    <article>
      <PageHero
        eyebrow={post.category}
        title={post.title}
        className="text-on-navy"
        image={heroImage}
      >
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/yangiliklar"
            className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-on-navy-muted hover:text-gold"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden /> Barcha yangiliklar
          </Link>
          <span className="h-4 w-px bg-on-navy/25" aria-hidden />
          <time dateTime={post.date} className="text-sm text-on-navy-muted">
            {formatDate(post.date)}
          </time>
          {post.isDemo && <DemoBadge />}
        </div>
      </PageHero>

      <div className="container-narrow py-12 md:py-16">
        {!heroImage && (
          <div className="aspect-[16/9] overflow-hidden rounded-2xl border bg-secondary shadow-[var(--shadow-card)]">
            <PhotoPlaceholder src={post.coverImage} alt={post.title} lazy={false} />
          </div>
        )}

        <div className="prose-editorial mt-10">
          {post.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {post.gallery.length > 0 && (
          <section className="mt-14 border-t pt-10">
            <h2 className="text-2xl font-medium text-primary">Fotogalereya</h2>
            <div className="mt-6">
              <PhotoGallery images={post.gallery} title={post.title} />
            </div>
          </section>
        )}

        <div className="mt-14 border-t pt-8">
          <Link
            href="/yangiliklar"
            className="inline-flex min-h-11 items-center gap-2 font-semibold text-primary hover:text-gold-ink"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden /> Barcha yangiliklar
          </Link>
        </div>
      </div>
    </article>
  );
}

type PageData = NonNullable<Awaited<ReturnType<typeof getDatabasePost>>>;
