// @vitest-environment node
import { afterEach, beforeEach, expect, it } from "vitest";
import { SqliteDatabase } from "@backend/database/sqlite";
import { digest } from "@backend/api/admin-auth";
import { handle } from "@backend/api/handler";

let db: SqliteDatabase;
const token = "a".repeat(64);
const credential = "delete-test-only-credential";
const resources = [
  [
    "posts",
    "post-delete",
    "posts",
    "slug",
    "INSERT INTO posts (slug,title,category,date,excerpt,body,status) VALUES ('post-delete','Test','Yangilik','2026-10-16','Test','[]','published')",
  ],
  [
    "teachers",
    "teacher-delete",
    "teachers",
    "slug",
    "INSERT INTO teachers (slug,name,subject,qualification,education,experience,biography,status) VALUES ('teacher-delete','Test','Math','Test','Test','Test','Test','published')",
  ],
  [
    "achievements",
    "achievement-delete",
    "achievements",
    "id",
    "INSERT INTO achievements (id,student_name,class_at_achievement,type,title,subject,stage,result,achievement_date,status) VALUES ('achievement-delete','Test','9-sinf','STEM','Test','Math','Tuman','1','2026-10-16','published')",
  ],
  [
    "school-life",
    "life-delete",
    "school_life",
    "id",
    "INSERT INTO school_life (id,title,description,status) VALUES ('life-delete','Test','Test','published')",
  ],
  [
    "messages",
    "1",
    "contact_messages",
    "id",
    "INSERT INTO contact_messages (id,name,contact,type,message) VALUES (1,'Test','test@example.test','Savol','Test')",
  ],
] as const;

beforeEach(async () => {
  db = new SqliteDatabase();
  db.migrate();
  await db
    .prepare("INSERT INTO admin_sessions (token_hash,credential_hash,expires_at) VALUES (?,?,?)")
    .bind(await digest(token), await digest(credential), Math.floor(Date.now() / 1000) + 3600)
    .run();
});
afterEach(() => db.close());

it.each(resources)(
  "deletes %s with authentication, origin and version checks",
  async (resource, id, table, key, insert) => {
    await db.prepare(insert).run();
    const remove = (version = "0", auth = true, origin = "https://school.test") =>
      handle({
        request: new Request(`https://school.test/api/admin/${resource}/${id}?version=${version}`, {
          method: "DELETE",
          headers: { origin, ...(auth ? { cookie: "bekobod_admin=" + token } : {}) },
        }),
        env: { DB: db, ADMIN_PASSWORD_HASH: credential },
      });
    expect((await remove("0", false)).status).toBe(401);
    expect((await remove("0", true, "https://foreign.test")).status).toBe(403);
    expect((await remove("-1")).status).toBe(400);
    expect((await remove("1")).status).toBe(409);
    expect(
      await db.prepare(`SELECT ${key} FROM ${table} WHERE ${key}=?`).bind(id).first(),
    ).not.toBeNull();
    const deleted = await remove();
    expect(deleted.status).toBe(200);
    expect(await deleted.json()).toEqual({
      data: { deleted: true, id: resource === "messages" ? 1 : id },
    });
    expect(
      await db.prepare(`SELECT ${key} FROM ${table} WHERE ${key}=?`).bind(id).first(),
    ).toBeNull();
    if (resource !== "messages") {
      const publicList = await handle({
        request: new Request(`https://school.test/api/${resource}`),
        env: { DB: db },
      });
      expect((await publicList.json()).data).toEqual([]);
    }
    expect((await remove()).status).toBe(404);
  },
);
