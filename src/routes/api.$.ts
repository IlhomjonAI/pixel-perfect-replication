import { createFileRoute } from "@tanstack/react-router";
import { handlePublicApi } from "@/server/public-api";
import { handleImageUpload } from "@/server/image-upload";
import { handleContactSubmit, handleAdminMessages } from "@/server/contact-api";
import { handleAdminTeachers } from "@/server/admin-teachers";
import { handleAdminAchievements } from "@/server/admin-achievements";
import { handleAdminPosts } from "@/server/admin-posts";
import { handleAdminAuth } from "@/server/admin-auth";

type CloudflareRequest = Request & {
  runtime?: { cloudflare?: { env?: CloudflareBindings } };
};

const handle = ({ request }: { request: Request }) => {
  const path = new URL(request.url).pathname;
  const handler =
    path === "/api/admin/uploads" || path === "/api/admin/uploads/"
      ? handleImageUpload
      : path === "/api/contact" || path === "/api/contact/"
        ? handleContactSubmit
        : path === "/api/admin/messages" || path.startsWith("/api/admin/messages/")
          ? handleAdminMessages
          : path === "/api/admin/teachers" || path.startsWith("/api/admin/teachers/")
            ? handleAdminTeachers
            : path === "/api/admin/achievements" || path.startsWith("/api/admin/achievements/")
              ? handleAdminAchievements
              : path === "/api/admin/posts" || path.startsWith("/api/admin/posts/")
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
