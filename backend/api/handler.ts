import { handleAdminSchoolLife } from "@backend/api/admin-school-life";
import { handlePublicApi } from "@backend/api/public-api";
import { handleImageUpload } from "@backend/api/image-upload";
import { handleContactSubmit, handleAdminMessages } from "@backend/api/contact-api";
import { handleAdminTeachers } from "@backend/api/admin-teachers";
import { handleAdminAchievements } from "@backend/api/admin-achievements";
import { handleAdminPosts } from "@backend/api/admin-posts";
import { handleAdminAuth } from "@backend/api/admin-auth";
import { handleRecycleBin } from "./recycle-bin";

export const handle = ({ request, env }: { request: Request; env: AppBindings }) => {
  const path = new URL(request.url).pathname;
  if (path === "/api/admin/trash" || path.startsWith("/api/admin/trash/"))
    return handleRecycleBin(request, env);
  const handler =
    path === "/api/admin/school-life" || path.startsWith("/api/admin/school-life/")
      ? handleAdminSchoolLife
      : path === "/api/admin/uploads" || path === "/api/admin/uploads/"
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
  return handler(request, env);
};
