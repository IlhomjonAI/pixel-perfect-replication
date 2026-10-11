import { createServerFn } from "@tanstack/react-start";
import { getRequestD1 } from "@/lib/d1-binding";
import { paginationInput, slugInput } from "@/lib/pagination";

const loadPage = createServerFn({ method: "GET" })
  .inputValidator(paginationInput)
  .handler(async ({ data }) => {
    const { listPosts } = await import("@/server/db");
    return listPosts(await getRequestD1(), data.limit, data.offset);
  });

const loadPost = createServerFn({ method: "GET" })
  .inputValidator(slugInput)
  .handler(async ({ data }) => {
    const { getPostBySlug } = await import("@/server/db");
    return getPostBySlug(await getRequestD1(), data);
  });

export const getPostsPage = (limit = 50, offset = 0) => loadPage({ data: { limit, offset } });
export const getDatabasePost = (slug: string) => loadPost({ data: slug });
