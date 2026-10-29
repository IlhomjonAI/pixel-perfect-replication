import { requireAdmin } from "./admin-auth";
import { fail, json } from "./http";

export async function handleRecycleBin(request: Request, env: Partial<AppBindings>) {
  if (!env.DB || !env.ADMIN_PASSWORD_HASH) return fail(503, "Admin tizimi sozlanmagan.");
  if (!(await requireAdmin(request, env))) return fail(401, "Sessiya tugagan. Qayta kiring.");
  const url = new URL(request.url);
  if (request.method === "GET" && url.pathname === "/api/admin/trash") {
    const offset = Number(url.searchParams.get("offset") ?? 0);
    if (!Number.isSafeInteger(offset) || offset < 0 || offset > 100000)
      return fail(400, "Sahifa noto‘g‘ri.");
    const { results } = await env.DB.prepare(
      "SELECT id,resource,record_key,label,deleted_at FROM recycle_bin ORDER BY id DESC LIMIT 21 OFFSET ?",
    )
      .bind(offset)
      .all();
    return json(200, { data: results.slice(0, 20), pagination: { hasMore: results.length > 20 } });
  }
  const restore = /^\/api\/admin\/trash\/(\d{1,15})\/restore$/.exec(url.pathname);
  if (request.method !== "POST" || !restore) return fail(405, "Usulga ruxsat yo‘q.");
  if (request.headers.get("origin") !== url.origin) return fail(403, "So‘rovga ruxsat yo‘q.");
  const id = Number(restore[1]);
  if (!(await env.DB.prepare("SELECT id FROM recycle_bin WHERE id=?").bind(id).first()))
    return fail(404, "Yozuv topilmadi.");
  try {
    // INSTEAD OF DELETE triggers atomically restore all original fields and remove the archive.
    await env.DB.prepare("DELETE FROM restore_bin WHERE id=?").bind(id).run();
    return json(200, { data: { restored: true } });
  } catch {
    return fail(
      409,
      "Tiklab bo‘lmadi: shu ID bilan yozuv mavjud yoki ma’lumot mos kelmadi. Savatdagi nusxa saqlandi.",
    );
  }
}
