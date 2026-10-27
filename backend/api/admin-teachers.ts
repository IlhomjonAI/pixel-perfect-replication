import { json, fail, readJson } from "./http";
import { deleteRecord } from "./delete-record";
import { requireAdmin } from "@backend/api/admin-auth";
import { teacherInput } from "@backend/contracts/teacher";
import { mapTeacherRow, type TeacherRow } from "@backend/database/mappers";
const fields =
  "slug,name,photo,subject,qualification,education,experience,biography,certificates,certificate_images,is_demo,status,version";
type Row = TeacherRow & { status: "draft" | "published" | "archived"; version: number };
const map = (r: Row) => ({ ...mapTeacherRow(r), status: r.status, version: r.version });
export async function handleAdminTeachers(request: Request, env: Partial<AppBindings> = {}) {
  try {
    if (!env.DB || !env.ADMIN_PASSWORD_HASH) return fail(503, "Admin tizimi sozlanmagan.");
    if (!(await requireAdmin(request, env))) return fail(401, "Sessiya tugagan. Qayta kiring.");
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, "");
    const slug = path === "/api/admin/teachers" ? null : path.slice("/api/admin/teachers/".length);
    if (slug !== null && !/^[a-z0-9][a-z0-9-]{0,199}$/.test(slug))
      return fail(404, "Ustoz topilmadi.");
    const allowed = slug ? "GET, PUT, DELETE" : "GET, POST";
    if (!(slug ? ["GET", "PUT", "DELETE"] : ["GET", "POST"]).includes(request.method))
      return json(405, { error: { message: "Usulga ruxsat yo‘q." } }, { Allow: allowed });
    if (request.method === "GET") {
      if (slug) {
        const row = await env.DB.prepare(`SELECT ${fields} FROM teachers WHERE slug=?`)
          .bind(slug)
          .first<Row>();
        return row ? json(200, { data: map(row) }) : fail(404, "Ustoz topilmadi.");
      }
      const raw = url.searchParams.get("offset") ?? "0";
      const offset = Number(raw);
      if (!/^\d+$/.test(raw) || !Number.isSafeInteger(offset) || offset > 100000)
        return fail(400, "Sahifa noto‘g‘ri.");
      const { results } = await env.DB.prepare(
        `SELECT ${fields} FROM teachers ORDER BY name ASC,slug ASC LIMIT 21 OFFSET ?`,
      )
        .bind(offset)
        .all<Row>();
      return json(200, {
        data: results.slice(0, 20).map(map),
        pagination: { offset, hasMore: results.length > 20 },
      });
    }
    if (request.headers.get("origin") !== url.origin) return fail(403, "So‘rovga ruxsat yo‘q.");
    if (request.method === "DELETE" && slug !== null)
      return await deleteRecord(request, env.DB, "teachers", slug);
    if (!request.headers.get("content-type")?.startsWith("application/json"))
      return fail(415, "JSON kerak.");
    const payload = await readJson(request, 32768);
    if (payload.error) return payload.error;
    const parsed = teacherInput.safeParse(payload.data);
    if (!parsed.success)
      return fail(
        400,
        "Ism, fan, malaka, ta’lim, tajriba, tarjimai hol va rasm havolalarini tekshiring.",
      );
    const p = parsed.data;
    const values = [
      p.name,
      p.photo,
      p.subject,
      p.qualification,
      p.education,
      p.experience,
      p.biography,
      JSON.stringify(p.certificates),
      JSON.stringify(p.certificateImages),
      p.status,
      new Date().toISOString(),
    ];
    if (!slug) {
      if (p.version !== 0) return fail(400, "Yangi profil versiyasi noto‘g‘ri.");
      const id = "teacher-" + crypto.randomUUID();
      const row = await env.DB.prepare(
        `INSERT INTO teachers (name,photo,subject,qualification,education,experience,biography,certificates,certificate_images,status,updated_at,slug,is_demo) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,0) RETURNING ${fields}`,
      )
        .bind(...values, id)
        .first<Row>();
      if (!row) throw new Error("Insert failed");
      return json(201, { data: map(row) });
    }
    const row = await env.DB.prepare(
      `UPDATE teachers SET name=?,photo=?,subject=?,qualification=?,education=?,experience=?,biography=?,certificates=?,certificate_images=?,status=?,updated_at=?,version=version+1,is_demo=0 WHERE slug=? AND version=? RETURNING ${fields}`,
    )
      .bind(...values, slug, p.version)
      .first<Row>();
    if (row) return json(200, { data: map(row) });
    const exists = await env.DB.prepare("SELECT slug FROM teachers WHERE slug=?")
      .bind(slug)
      .first();
    return exists
      ? fail(409, "Profil boshqa oynada o‘zgartirilgan. Ro‘yxatni yangilab qayta oching.")
      : fail(404, "Ustoz topilmadi.");
  } catch (error) {
    console.error("Admin teachers failed", error);
    return fail(503, "Server vaqtincha ishlamayapti.");
  }
}
