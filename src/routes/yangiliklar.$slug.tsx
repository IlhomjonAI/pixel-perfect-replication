import { PhotoGallery } from "@/components/site/PhotoGallery";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { DemoBadge, EmptyState } from "@/components/site/common";
import { PageHero } from "@/components/site/PageHero";
import { PhotoPlaceholder } from "@/components/site/PhotoPlaceholder";
import { getDatabasePost } from "@/lib/news-api";
import { formatDate, pageHead } from "@/lib/site";

export const Route = createFileRoute("/yangiliklar/$slug")({
  loader: async ({ params }) => {
    const post = await getDatabasePost(params.slug);
    if (!post) throw notFound();
    return post;
  },
  head: ({ loaderData }) =>
    loaderData
      ? pageHead(loaderData.title, loaderData.excerpt)
      : { meta: [{ title: "Yangilik topilmadi" }, { name: "robots", content: "noindex" }] },
  notFoundComponent: PostNotFound,
  component: PostDetail,
});

function PostNotFound() {
  return (
    <div className="container-site py-20">
      <EmptyState
        title="Yangilik topilmadi"
        description="Ushbu yangilik mavjud emas yoki o‘chirilgan."
      >
        <Link to="/yangiliklar" className="btn btn-primary">
          Yangiliklarga qaytish
        </Link>
      </EmptyState>
    </div>
  );
}

function PostDetail() {
  const post = Route.useLoaderData();
  return (
    <article>
      <PageHero eyebrow={post.category} title={post.title} className="text-on-navy">
        <div className="flex flex-wrap items-center gap-4">
          <Link
            to="/yangiliklar"
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
        <div className="aspect-[16/9] overflow-hidden rounded-2xl border bg-secondary shadow-[var(--shadow-card)]">
          <PhotoPlaceholder src={post.coverImage} alt={post.title} lazy={false} />
        </div>

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
            to="/yangiliklar"
            className="inline-flex min-h-11 items-center gap-2 font-semibold text-primary hover:text-gold-ink"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden /> Barcha yangiliklar
          </Link>
        </div>
      </div>
    </article>
  );
}
