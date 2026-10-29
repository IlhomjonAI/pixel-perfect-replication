import { pageMetadata } from "@/config/metadata";
import Achievements from "@/views/Achievements";
import { SCHOOL_NAME } from "@/config/site";
import { getAchievementsPage, getAchievementFilters } from "@/api/achievement";
export const dynamic = "force-dynamic";
export const metadata = pageMetadata(
  "O‘quvchilar yutuqlari",
  "Fan olimpiadalari, STEM, Al-Xorazmiy, IELTS, SAT va milliy sertifikat natijalari.",
);
export default async function Page() {
  const [page, options] = await Promise.all([getAchievementsPage(), getAchievementFilters()]);
  const initialData = { page, options };
  return <Achievements initialData={initialData} />;
}
