import type { Post } from "@/data/types";
import { PostCard } from "@/components/site/cards";

/**
 * Homepage news composition: the newest post is featured full-width, the rest
 * follow in a stable, unmodified order. Single column on mobile.
 */
export function NewsFeed({ posts }: { posts: Post[] }) {
  if (!posts.length) return null;
  const [featured, ...rest] = posts;
  return (
    <div>
      {featured && <PostCard post={featured} feature />}
      {rest.length > 0 && (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
