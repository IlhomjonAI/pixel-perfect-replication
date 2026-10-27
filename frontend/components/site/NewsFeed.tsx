"use client";

import Link from "next/link";
import type { Post } from "@backend/contracts/models";
import { PostCard } from "@/components/site/cards";
import { Reveal } from "@/components/site/Reveal";
import { PhotoPlaceholder } from "@/components/site/PhotoPlaceholder";
import { formatDate } from "@/config/site";

/**
 * Homepage news composition: the newest post is featured large on the left
 * with a complementary compact feed of thumbnails beside it on desktop; on
 * mobile everything stacks into a readable photo feed.
 */
export function NewsFeed({ posts }: { posts: Post[] }) {
  if (!posts.length) return null;
  const [featured, ...rest] = posts;

  return (
    <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
      {featured && (
        <Reveal from="left" className="lg:col-span-7">
          <PostCard post={featured} feature />
        </Reveal>
      )}
      {rest.length > 0 && (
        <Reveal from="right" delay={80} className="lg:col-span-5">
          <div className="card-surface divide-y divide-border overflow-hidden">
            {rest.map((post) => (
              <Link
                key={post.slug}
                href={`/yangiliklar/${encodeURIComponent(post.slug)}`}
                className="group flex gap-4 p-4 transition-colors hover:bg-secondary/70"
              >
                <div className="h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-sage/40 sm:h-[5.5rem] sm:w-28">
                  <PhotoPlaceholder
                    src={post.coverImage}
                    alt=""
                    className="transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gold-ink">
                      {post.category}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {formatDate(post.date)}
                    </span>
                  </div>
                  <h3 className="mt-1 line-clamp-2 font-display text-base leading-snug text-primary transition-colors group-hover:text-gold-ink">
                    {post.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </Reveal>
      )}
    </div>
  );
}
