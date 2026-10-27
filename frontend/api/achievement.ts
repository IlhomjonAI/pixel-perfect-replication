import { apiGet } from "./client";
import { achievementQuery, type AchievementQuery } from "@backend/contracts/achievement";
import type { Achievement } from "@backend/contracts/models";
export function getAchievementsPage(query: Partial<AchievementQuery> = {}) {
  const parsed = achievementQuery.parse(query);
  const params = new URLSearchParams(
    Object.entries(parsed)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, String(v)]),
  );
  return apiGet<{ items: Achievement[]; hasMore: boolean; offset: number }>(
    `achievement-page?${params}`,
  );
}
export const getAchievementFilters = () =>
  apiGet<{ year: string[]; subject: string[] }>("achievement-filters");
