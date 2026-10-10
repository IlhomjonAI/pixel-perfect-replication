import { achievementQuery, type AchievementQuery } from "@/lib/achievement-editor";
import { mapAchievementRow, type AchievementRow } from "@/server/d1-mappers";
const fields =
  "id,student_name,class_at_achievement,type,title,subject,stage,result,achievement_date,teacher_name,certificate_image,is_demo";
export async function getAchievementPage(db: D1Database, input: AchievementQuery) {
  const q = achievementQuery.parse(input);
  const clauses = ["status='published'"];
  const values: unknown[] = [];
  if (q.year) {
    clauses.push("achievement_date>=? AND achievement_date<=?");
    values.push(q.year + "-01-01", q.year + "-12-31");
  }
  for (const [column, value] of [
    ["subject", q.subject],
    ["type", q.type],
    ["stage", q.stage],
  ] as const) {
    if (value) {
      clauses.push(column + "=?");
      values.push(value);
    }
  }
  const { results } = await db
    .prepare(
      `SELECT ${fields} FROM achievements WHERE ${clauses.join(" AND ")} ORDER BY achievement_date DESC,id ASC LIMIT ? OFFSET ?`,
    )
    .bind(...values, q.limit + 1, q.offset)
    .all<AchievementRow>();
  return {
    items: results.slice(0, q.limit).map(mapAchievementRow),
    hasMore: results.length > q.limit,
    offset: q.offset,
  };
}
export async function getAchievementOptions(db: D1Database) {
  const years = await db
    .prepare(
      "SELECT DISTINCT substr(achievement_date,1,4) AS value FROM achievements WHERE status='published' ORDER BY value DESC LIMIT 100",
    )
    .all<{ value: string }>();
  const subjects = await db
    .prepare(
      "SELECT DISTINCT subject AS value FROM achievements WHERE status='published' ORDER BY value LIMIT 100",
    )
    .all<{ value: string }>();
  return { year: years.results.map((r) => r.value), subject: subjects.results.map((r) => r.value) };
}
