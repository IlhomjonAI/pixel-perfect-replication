import { contactInput, messageStatuses, messageUpdate } from "@/lib/contact-workflow";
import { digest, requireAdmin } from "@/server/admin-auth";
const json = (status: number, body: unknown, extra: Record<string, string> = {}) =>
  Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", ...extra },
  });
const fail = (status: number, message: string) => json(status, { error: { message } });
async function readJson(request: Request, limit: number) {
  const reader = request.body?.getReader();
  if (!reader) return { error: fail(400, "Ma’lumot kiriting.") };
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      return { error: fail(413, "So‘rov hajmi juda katta.") };
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  try {
    return { data: JSON.parse(new TextDecoder().decode(bytes)) as unknown };
  } catch {
    return { error: fail(400, "So‘rov noto‘g‘ri.") };
  }
}
export async function handleContactSubmit(request: Request, env: Partial<CloudflareBindings> = {}) {
  if (request.method !== "POST")
    return json(405, { error: { message: "Faqat yuborish mumkin." } }, { Allow: "POST" });
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return fail(403, "So‘rovga ruxsat yo‘q.");
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return fail(415, "JSON kerak.");
  try {
    if (!env.DB || !env.ADMIN_PASSWORD_HASH)
      return fail(503, "Murojaat tizimi vaqtincha ishlamayapti.");
    const payload = await readJson(request, 16384);
    if (payload.error) return payload.error;
    const parsed = contactInput.safeParse(payload.data);
    if (!parsed.success)
      return fail(400, "Ism, telefon yoki email, xabar va rozilikni tekshiring.");
    const p = parsed.data;
    const existing = await env.DB.prepare("SELECT id FROM contact_messages WHERE request_id=?")
      .bind(p.requestId)
      .first();
    if (existing) return json(202, { data: { received: true } });
    const now = Math.floor(Date.now() / 1000);
    const ip = request.headers.get("cf-connecting-ip") ?? "local";
    for (const [bucket, seconds, maximum] of [
      ["global", 3600, 100],
      [await digest(env.ADMIN_PASSWORD_HASH + ":contact:" + ip), 900, 3],
    ] as const) {
      const row = await env.DB.prepare(
        "INSERT INTO contact_submission_limits (bucket,window_start,attempts) VALUES (?,?,1) ON CONFLICT(bucket) DO UPDATE SET attempts=CASE WHEN window_start<=? THEN 1 ELSE attempts+1 END, window_start=CASE WHEN window_start<=? THEN excluded.window_start ELSE window_start END RETURNING attempts",
      )
        .bind(bucket, now, now - seconds, now - seconds)
        .first<{ attempts: number }>();
      if (!row || row.attempts > maximum)
        return json(
          429,
          {
            error: {
              message:
                seconds === 900
                  ? "Ko‘p murojaat yuborildi. 15 daqiqadan keyin urinib ko‘ring."
                  : "Yuborish vaqtincha cheklangan. Keyinroq urinib ko‘ring.",
            },
          },
          { "Retry-After": String(seconds) },
        );
    }
    const date = new Date().toISOString();
    await env.DB.prepare(
      "INSERT INTO contact_messages (name,contact,type,message,consent_at,request_id,created_at,status) VALUES (?,?,?,?,?,?,?,'new') ON CONFLICT(request_id) DO NOTHING",
    )
      .bind(p.name, p.contact, p.type, p.message, date, p.requestId, date)
      .run();
    await env.DB.prepare("DELETE FROM contact_submission_limits WHERE window_start<?")
      .bind(now - 86400)
      .run()
      .catch((error) => console.error("Contact rate cleanup failed", error));
    return json(202, { data: { received: true } });
  } catch (error) {
    console.error("Contact submission failed", error);
    return fail(503, "Murojaat saqlanmadi. Qayta urinib ko‘ring.");
  }
}
const fields = "id,name,contact,type,message,created_at,consent_at,status,version";
export async function handleAdminMessages(request: Request, env: Partial<CloudflareBindings> = {}) {
  try {
    if (!env.DB || !env.ADMIN_PASSWORD_HASH) return fail(503, "Admin tizimi sozlanmagan.");
    if (!(await requireAdmin(request, env))) return fail(401, "Sessiya tugagan. Qayta kiring.");
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, "");
    const raw = path === "/api/admin/messages" ? null : path.slice("/api/admin/messages/".length);
    const id = raw === null ? null : Number(raw);
    if (raw !== null && (!/^\d+$/.test(raw) || !Number.isSafeInteger(id) || id === null || id < 1))
      return fail(404, "Murojaat topilmadi.");
    if (request.method === "GET") {
      if (id !== null) {
        const row = await env.DB.prepare(`SELECT ${fields} FROM contact_messages WHERE id=?`)
          .bind(id)
          .first();
        return row ? json(200, { data: row }) : fail(404, "Murojaat topilmadi.");
      }
      const offsetText = url.searchParams.get("offset") ?? "0";
      const offset = Number(offsetText);
      const status = url.searchParams.get("status");
      if (!/^\d+$/.test(offsetText) || !Number.isSafeInteger(offset) || offset > 100000)
        return fail(400, "Sahifa noto‘g‘ri.");
      if (status && !messageStatuses.includes(status as (typeof messageStatuses)[number]))
        return fail(400, "Holat noto‘g‘ri.");
      const where = status ? "WHERE status=?" : "";
      const { results } = await env.DB.prepare(
        `SELECT ${fields} FROM contact_messages ${where} ORDER BY created_at DESC,id DESC LIMIT 21 OFFSET ?`,
      )
        .bind(...(status ? [status] : []), offset)
        .all();
      const counts = await env.DB.prepare(
        "SELECT status,COUNT(*) AS count FROM contact_messages GROUP BY status",
      ).all<{ status: string; count: number }>();
      return json(200, {
        data: results.slice(0, 20),
        pagination: { offset, hasMore: results.length > 20 },
        counts: Object.fromEntries(counts.results.map((v) => [v.status, v.count])),
      });
    }
    if (request.method !== "PATCH" || id === null)
      return json(
        405,
        { error: { message: "Usulga ruxsat yo‘q." } },
        { Allow: id === null ? "GET" : "GET, PATCH" },
      );
    if (request.headers.get("origin") !== url.origin) return fail(403, "So‘rovga ruxsat yo‘q.");
    if (!request.headers.get("content-type")?.startsWith("application/json"))
      return fail(415, "JSON kerak.");
    const payload = await readJson(request, 1024);
    if (payload.error) return payload.error;
    const parsed = messageUpdate.safeParse(payload.data);
    if (!parsed.success) return fail(400, "Holat noto‘g‘ri.");
    const p = parsed.data;
    const row = await env.DB.prepare(
      `UPDATE contact_messages SET status=?,updated_at=?,version=version+1 WHERE id=? AND version=? RETURNING ${fields}`,
    )
      .bind(p.status, new Date().toISOString(), id, p.version)
      .first();
    if (row) return json(200, { data: row });
    const exists = await env.DB.prepare("SELECT id FROM contact_messages WHERE id=?")
      .bind(id)
      .first();
    return exists
      ? fail(409, "Murojaat boshqa oynada o‘zgartirilgan. Ro‘yxatni yangilang.")
      : fail(404, "Murojaat topilmadi.");
  } catch (error) {
    console.error("Admin messages failed", error);
    return fail(503, "Server vaqtincha ishlamayapti.");
  }
}
