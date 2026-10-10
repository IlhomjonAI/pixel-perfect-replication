import { createServerFn } from "@tanstack/react-start";
import { achievementQuery, type AchievementQuery } from "@/lib/achievement-editor";
const page = createServerFn({ method: "GET" })
  .inputValidator(achievementQuery)
  .handler(async ({ data }) => {
    const { getRequest } = await import("@tanstack/react-start/server");
    const { getD1 } = await import("@/server/db");
    const { getAchievementPage } = await import("@/server/achievement-page");
    const r = getRequest() as Request & { runtime?: { cloudflare?: { env?: CloudflareBindings } } };
    return getAchievementPage(getD1(r.runtime?.cloudflare?.env), data);
  });
const options = createServerFn({ method: "GET" }).handler(async () => {
  const { getRequest } = await import("@tanstack/react-start/server");
  const { getD1 } = await import("@/server/db");
  const { getAchievementOptions } = await import("@/server/achievement-page");
  const r = getRequest() as Request & { runtime?: { cloudflare?: { env?: CloudflareBindings } } };
  return getAchievementOptions(getD1(r.runtime?.cloudflare?.env));
});
export const getAchievementsPage = (query: Partial<AchievementQuery> = {}) =>
  page({ data: achievementQuery.parse(query) });
export const getAchievementFilters = () => options();
