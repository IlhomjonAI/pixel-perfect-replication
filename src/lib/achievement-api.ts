import { createServerFn } from "@tanstack/react-start";
import { achievementQuery, type AchievementQuery } from "@/lib/achievement-editor";
import { getRequestD1 } from "@/lib/d1-binding";

const page = createServerFn({ method: "GET" })
  .inputValidator(achievementQuery)
  .handler(async ({ data }) => {
    const { getAchievementPage } = await import("@/server/achievement-page");
    return getAchievementPage(await getRequestD1(), data);
  });

const options = createServerFn({ method: "GET" }).handler(async () => {
  const { getAchievementOptions } = await import("@/server/achievement-page");
  return getAchievementOptions(await getRequestD1());
});

export const getAchievementsPage = (query: Partial<AchievementQuery> = {}) =>
  page({ data: achievementQuery.parse(query) });
export const getAchievementFilters = () => options();
