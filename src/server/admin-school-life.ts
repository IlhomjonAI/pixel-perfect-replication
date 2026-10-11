import { requireAdmin } from "@/server/admin-auth";
import { schoolLifeInput } from "@/lib/school-life-editor";
import { mapSchoolLifeRow, type SchoolLifeRow } from "@/server/d1-mappers";
const fields = "id,title,description,image,category,event_date,gallery,is_demo,status,version";
type Row = SchoolLifeRow & { status: "draft" | "published" | "archived"; version: number };
const map = (r: Row) => ({ ...mapSchoolLifeRow(r), status: r.status, version: r.version });
const json = (status: number, body: unknown, extra: Record<string, string> = {}) =>
  Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", ...extra },
  });
const fail = (status: number, message: string) => json(status, { error: { message } });
export async function handleAdminSchoolLife(
  request: Request,
  env: Partial<CloudflareBindings> = {},
) {
  try {
    if (!env.DB || !env.ADMIN_PASSWORD_HASH) return fail(503, "Admin tizimi sozlanmagan.");
    if (!(await requireAdmin(request, env))) return fail(401, "Sessiya tugagan. Qayta kiring.");
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, "");
    const id =
      path === "/api/admin/school-life" ? null : path.slice("/api/admin/school-life/".length);
    if (id !== null && !/^[a-z0-9][a-z0-9-]{0,199}$/.test(id)) return fail(404, "Yozuv topilmadi.");
    const allowed = id ? "GET, PUT" : "GET, POST";
    if (!(id ? ["GET", "PUT"] : ["GET", "POST"]).includes(request.method))
      return json(405, { error: { message: "Usulga ruxsat yo‘q." } }, { Allow: allowed });
    if (request.method === "GET") {
      if (id) {
        const row = await env.DB.prepare(`SELECT ${fields} FROM school_life WHERE id=?`)
          .bind(id)
          .first<Row>();
        return row ? json(200, { data: map(row) }) : fail(404, "Yozuv topilmadi.");
      }
      const raw = url.searchParams.get("offset") ?? "0";
      const offset = Number(raw);
      if (!/^\d+$/.test(raw) || !Number.isSafeInteger(offset) || offset > 100000)
        return fail(400, "Sahifa noto‘g‘ri.");
      const { results } = await env.DB.prepare(
        `SELECT ${fields} FROM school_life ORDER BY COALESCE(event_date, '0000-01-01') DESC,id ASC LIMIT 21 OFFSET ?`,
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
      if (size > 65536) {
        await reader.cancel();
        return fail(413, "Yozuv hajmi 64 KB dan oshmasin.");
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
    const parsed = schoolLifeInput.safeParse(input);
    if (!parsed.success)
      return fail(400, "Sarlavha, tavsif, sana, tur va rasm havolalarini tekshiring.");
    const p = parsed.data;
    const values = [
      p.title,
      p.description,
      p.image,
      p.category,
      p.eventDate,
      JSON.stringify(p.gallery),
      p.status,
      new Date().toISOString(),
    ];
    if (!id) {
      if (p.version !== 0) return fail(400, "Yangi yozuv versiyasi noto‘g‘ri.");
      const newId = "life-" + crypto.randomUUID();
      const row = await env.DB.prepare(
        `INSERT INTO school_life (title,description,image,category,event_date,gallery,status,updated_at,id,is_demo) VALUES (?,?,?,?,?,?,?,?,?,0) RETURNING ${fields}`,
      )
        .bind(...values, newId)
        .first<Row>();
      if (!row) throw new Error("Insert failed");
      return json(201, { data: map(row) });
    }
    const row = await env.DB.prepare(
      `UPDATE school_life SET title=?,description=?,image=?,category=?,event_date=?,gallery=?,status=?,updated_at=?,version=version+1,is_demo=0 WHERE id=? AND version=? RETURNING ${fields}`,
    )
      .bind(...values, id, p.version)
      .first<Row>();
    if (row) return json(200, { data: map(row) });
    const exists = await env.DB.prepare("SELECT id FROM school_life WHERE id=?").bind(id).first();
    return exists
      ? fail(409, "Yozuv boshqa oynada o‘zgartirilgan. Ro‘yxatni yangilab qayta oching.")
      : fail(404, "Yozuv topilmadi.");
  } catch (error) {
    console.error("Admin school life failed", error);
    return fail(503, "Server vaqtincha ishlamayapti.");
  }
}
