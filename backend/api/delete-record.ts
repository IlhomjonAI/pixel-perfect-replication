import { fail, json } from "./http";

const resources = {
  posts: { table: "posts", key: "slug" },
  achievements: { table: "achievements", key: "id" },
  teachers: { table: "teachers", key: "slug" },
  "school-life": { table: "school_life", key: "id" },
  messages: { table: "contact_messages", key: "id" },
} as const;

/** Call only after authentication and same-origin validation in the handler. */
export async function deleteRecord(
  request: Request,
  db: Database,
  resource: keyof typeof resources,
  id: string | number,
) {
  const raw = new URL(request.url).searchParams.get("version");
  const version = Number(raw);
  if (raw === null || !/^\d+$/.test(raw) || !Number.isSafeInteger(version))
    return fail(400, "Yozuv versiyasini ko‘rsating. Ro‘yxatni yangilab qayta tanlang.");
  const { table, key } = resources[resource];
  // Table/column names come exclusively from the fixed map above; values are bound.
  const removed = await db
    .prepare(`DELETE FROM ${table} WHERE ${key}=? AND version=? RETURNING ${key}`)
    .bind(id, version)
    .first();
  if (removed) return json(200, { data: { deleted: true, id } });
  const exists = await db.prepare(`SELECT ${key} FROM ${table} WHERE ${key}=?`).bind(id).first();
  return exists
    ? fail(409, "Yozuv boshqa oynada o‘zgartirilgan. Ro‘yxatni yangilab qayta tanlang.")
    : fail(404, "Yozuv topilmadi yoki allaqachon o‘chirilgan.");
}
