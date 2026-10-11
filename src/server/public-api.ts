import {
  boundPagination,
  getD1,
  getPostBySlug,
  getTeacherBySlug,
  listAchievements,
  listPosts,
  listTeachers,
  listSchoolLife,
  MAX_OFFSET,
  MAX_PAGE_SIZE,
} from "@/server/db";

function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", ...headers },
  });
}

function error(code: string, message: string, status: number, headers?: Record<string, string>) {
  return json({ error: { code, message } }, status, headers);
}

function integerParam(params: URLSearchParams, name: string, fallback: number) {
  const raw = params.get(name);
  if (raw === null) return fallback;
  if (!/^\d+$/.test(raw)) return null;
  const value = Number(raw);
  return Number.isSafeInteger(value) ? value : null;
}

/** Environment bindings come from the server runtime, never from request input. */
export async function handlePublicApi(request: Request, env: unknown): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/$/, "");
  const list =
    path === "/api/posts"
      ? listPosts
      : path === "/api/teachers"
        ? listTeachers
        : path === "/api/achievements"
          ? listAchievements
          : path === "/api/school-life"
            ? listSchoolLife
            : null;
  const detail = /^\/api\/(posts|teachers)\/([^/]+)$/.exec(path);
  if (path !== "/api/health" && !list && !detail) {
    return error("NOT_FOUND", "API manzili topilmadi.", 404);
  }
  if (request.method !== "GET") {
    return error("METHOD_NOT_ALLOWED", "Bu manzil faqat GET so‘rovini qabul qiladi.", 405, {
      Allow: "GET",
    });
  }
  try {
    const db = getD1(env);
    if (path === "/api/health") {
      await db.prepare("SELECT slug FROM posts LIMIT 1").first();
      return json({ data: { status: "ok", database: "ready" } });
    }
    if (list) {
      const limit = integerParam(url.searchParams, "limit", 20);
      const offset = integerParam(url.searchParams, "offset", 0);
      if (
        limit === null ||
        offset === null ||
        limit < 1 ||
        limit > MAX_PAGE_SIZE ||
        offset > MAX_OFFSET
      ) {
        return error(
          "INVALID_PAGINATION",
          `limit 1–${MAX_PAGE_SIZE}, offset 0–${MAX_OFFSET} oralig‘ida bo‘lishi kerak.`,
          400,
        );
      }
      const page = boundPagination(limit, offset);
      return json({ data: await list(db, page.limit, page.offset), pagination: page });
    }
    const slug = decodeURIComponent(detail![2]!);
    if (!slug || slug.length > 200) return error("NOT_FOUND", "Yozuv topilmadi.", 404);
    const data =
      detail![1] === "posts" ? await getPostBySlug(db, slug) : await getTeacherBySlug(db, slug);
    return data ? json({ data }) : error("NOT_FOUND", "Yozuv topilmadi.", 404);
  } catch (cause) {
    if (cause instanceof URIError) return error("INVALID_PATH", "Manzil noto‘g‘ri.", 400);
    console.error("Public API request failed", cause);
    return error(
      "SERVICE_UNAVAILABLE",
      "Ma’lumotlarni yuklab bo‘lmadi. Keyinroq urinib ko‘ring.",
      503,
    );
  }
}
