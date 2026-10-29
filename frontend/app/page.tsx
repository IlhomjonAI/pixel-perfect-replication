import { pageMetadata } from "@/config/metadata";
import Home from "@/views/Home";
import { SCHOOL_NAME } from "@/config/site";
import { getAchievementsPage } from "@/api/achievement";
import { getPostsPage } from "@/api/news";
import { getSchoolLifePage } from "@/api/school-life";
import { getTeachersPage } from "@/api/teacher";
export const dynamic = "force-dynamic";
export const metadata = pageMetadata(
  "Bosh sahifa",
  `${SCHOOL_NAME}ning ta’lim muhiti, maktab hayoti va o‘quvchilar yutuqlari bilan tanishing.`,
);
export default async function Page() {
  const [posts, achievements, life, teachers] = await Promise.all([
    getPostsPage(6),
    getAchievementsPage({ limit: 4 }),
    getSchoolLifePage(4),
    getTeachersPage(3),
  ]);
  const initialData = { posts, achievements: achievements.items, life, teachers };
  return <Home initialData={initialData} />;
}
