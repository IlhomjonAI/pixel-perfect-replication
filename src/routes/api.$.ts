import { createFileRoute } from "@tanstack/react-router";
import { handlePublicApi } from "@/server/public-api";
import { handleAdminPosts } from "@/server/admin-posts";
import { handleAdminAuth } from "@/server/admin-auth";

type CloudflareRequest = Request & {
  runtime?: { cloudflare?: { env?: CloudflareBindings } };
};

const handle = ({ request }: { request: Request }) => {
  const path = new URL(request.url).pathname;
  const handler =
    path === "/api/admin/posts" || path.startsWith("/api/admin/posts/")
      ? handleAdminPosts
      : path.startsWith("/api/admin/")
        ? handleAdminAuth
        : handlePublicApi;
  return handler(request, (request as CloudflareRequest).runtime?.cloudflare?.env);
};

export const Route = createFileRoute("/api/$")({
  server: {
    handlers: {
      GET: handle,
      POST: handle,
      PUT: handle,
      PATCH: handle,
      DELETE: handle,
      OPTIONS: handle,
      HEAD: handle,
    },
  },
});
