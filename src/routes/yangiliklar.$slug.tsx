import { PhotoGallery } from "@/components/site/PhotoGallery";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { DemoBadge, EmptyState } from "@/components/site/common";
import { PhotoPlaceholder } from "@/components/site/PhotoPlaceholder";
import { getPost } from "@/lib/api";
import { formatDate, pageHead } from "@/lib/site";

export const Route = createFileRoute("/yangiliklar/$slug")({
  loader: async ({ params }) => {
    const post = await getPost(params.slug);
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
    <article className="container-site max-w-4xl py-12">
      <Link
        to="/yangiliklar"
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-gold"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> Barcha yangiliklar
      </Link>
      <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
        <span className="rounded-full bg-primary px-3 py-1 font-semibold text-primary-foreground">
          {post.category}
        </span>
        <time dateTime={post.date} className="text-muted-foreground">
          {formatDate(post.date)}
        </time>
        {post.isDemo && <DemoBadge />}
      </div>
      <h1 className="mt-4 text-3xl font-semibold text-primary md:text-5xl">{post.title}</h1>
      <div className="mt-8 aspect-[16/9] overflow-hidden rounded-2xl">
        <PhotoPlaceholder src={post.coverImage} alt={post.title} lazy={false} />
      </div>
      <div className="mt-8 space-y-5 text-lg leading-relaxed text-foreground">
        {post.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      {post.gallery.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-primary">Fotogalereya</h2>
          <div className="mt-5">
            <PhotoGallery images={post.gallery} title={post.title} />
          </div>
        </section>
      )}
    </article>
  );
}
