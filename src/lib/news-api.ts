import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
const loadPage = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({
      limit: z.number().int().min(1).max(50),
      offset: z.number().int().min(0).max(100000),
    }),
  )
  .handler(async ({ data }) => {
    const { getRequest } = await import("@tanstack/react-start/server");
    const { getD1, listPosts } = await import("@/server/db");
    const request = getRequest() as Request & {
      runtime?: { cloudflare?: { env?: CloudflareBindings } };
    };
    return listPosts(getD1(request.runtime?.cloudflare?.env), data.limit, data.offset);
  });
const loadPost = createServerFn({ method: "GET" })
  .inputValidator(z.string().min(1).max(200))
  .handler(async ({ data }) => {
    const { getRequest } = await import("@tanstack/react-start/server");
    const { getD1, getPostBySlug } = await import("@/server/db");
    const request = getRequest() as Request & {
      runtime?: { cloudflare?: { env?: CloudflareBindings } };
    };
    return getPostBySlug(getD1(request.runtime?.cloudflare?.env), data);
  });
export const getPostsPage = (limit = 50, offset = 0) => loadPage({ data: { limit, offset } });
export const getDatabasePost = (slug: string) => loadPost({ data: slug });
