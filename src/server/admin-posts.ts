import { requireAdmin } from "@/server/admin-auth";
import { postInput } from "@/lib/post-editor";
import { mapPostRow, type PostRow } from "@/server/d1-mappers";
const fields = "slug,title,category,date,excerpt,body,cover_image,gallery,is_demo,status,version";
type Row = PostRow & { status: "draft" | "published" | "archived"; version: number };
const map = (r: Row) => ({ ...mapPostRow(r), status: r.status, version: r.version });
const json = (status: number, body: unknown, extra: Record<string, string> = {}) =>
  Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", ...extra },
  });
const fail = (status: number, message: string) => json(status, { error: { message } });
export async function handleAdminPosts(request: Request, env: Partial<CloudflareBindings> = {}) {
  try {
    if (!env.DB || !env.ADMIN_PASSWORD_HASH) return fail(503, "Admin tizimi sozlanmagan.");
    if (!(await requireAdmin(request, env))) return fail(401, "Sessiya tugagan. Qayta kiring.");
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, "");
    const slug = path === "/api/admin/posts" ? null : path.slice("/api/admin/posts/".length);
    if (slug !== null && !/^[a-z0-9][a-z0-9-]{0,199}$/.test(slug))
      return fail(404, "Yangilik topilmadi.");
    const allowed = slug ? "GET, PUT" : "GET, POST";
    if (!(slug ? ["GET", "PUT"] : ["GET", "POST"]).includes(request.method))
      return json(405, { error: { message: "Usulga ruxsat yo‘q." } }, { Allow: allowed });
    if (request.method === "GET") {
      if (slug) {
        const row = await env.DB.prepare(`SELECT ${fields} FROM posts WHERE slug=?`)
          .bind(slug)
          .first<Row>();
        return row ? json(200, { data: map(row) }) : fail(404, "Yangilik topilmadi.");
      }
      const raw = url.searchParams.get("offset") ?? "0";
      const offset = Number(raw);
      if (!/^\d+$/.test(raw) || !Number.isSafeInteger(offset) || offset > 100000)
        return fail(400, "Sahifa noto‘g‘ri.");
      const { results } = await env.DB.prepare(
        `SELECT ${fields} FROM posts ORDER BY date DESC,slug ASC LIMIT 21 OFFSET ?`,
      )
        .bind(offset)
        .all<Row>();
      return json(200, {
        data: results.slice(0, 20).map(map),
        pagination: { offset, hasMore: results.length > 20 },
      });
    }
    if (request.headers.get("origin") !== url.origin) return fail(403, "So‘rovga ruxsat yo‘q.");
    if (!request.headers.get("content-type")?.startsWith("application/json"))
      return fail(415, "JSON kerak.");
    const reader = request.body?.getReader();
    if (!reader) return fail(400, "Ma’lumot kiriting.");
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 32768) {
        await reader.cancel();
        return fail(413, "Post hajmi 32 KB dan oshmasin.");
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
    let input: unknown;
    try {
      input = JSON.parse(new TextDecoder().decode(bytes));
    } catch {
      return fail(400, "So‘rov noto‘g‘ri.");
    }
    const parsed = postInput.safeParse(input);
    if (!parsed.success)
      return fail(
        400,
        "Maydonlarni tekshiring: sarlavha, sana, qisqa izoh, matn va rasm havolalari.",
      );
    const p = parsed.data;
    const values = [
      p.title,
      p.category,
      p.date,
      p.excerpt,
      JSON.stringify(p.body),
      p.coverImage,
      JSON.stringify(p.gallery),
      p.status,
      new Date().toISOString(),
    ];
    if (!slug) {
      if (p.version !== 0) return fail(400, "Yangi post versiyasi noto‘g‘ri.");
      const id = "post-" + crypto.randomUUID();
      const row = await env.DB.prepare(
        `INSERT INTO posts (title,category,date,excerpt,body,cover_image,gallery,status,updated_at,slug,is_demo) VALUES (?,?,?,?,?,?,?,?,?,?,0) RETURNING ${fields}`,
      )
        .bind(...values, id)
        .first<Row>();
      if (!row) throw new Error("Insert failed");
      return json(201, { data: map(row) });
    }
    const row = await env.DB.prepare(
      `UPDATE posts SET title=?,category=?,date=?,excerpt=?,body=?,cover_image=?,gallery=?,status=?,updated_at=?,version=version+1,is_demo=0 WHERE slug=? AND version=? RETURNING ${fields}`,
    )
      .bind(...values, slug, p.version)
      .first<Row>();
    if (row) return json(200, { data: map(row) });
    const exists = await env.DB.prepare("SELECT slug FROM posts WHERE slug=?").bind(slug).first();
    return exists
      ? fail(409, "Post boshqa oynada o‘zgartirilgan. Ro‘yxatni yangilab qayta oching.")
      : fail(404, "Yangilik topilmadi.");
  } catch (error) {
    console.error("Admin posts failed", error);
    return fail(503, "Server vaqtincha ishlamayapti.");
  }
}
