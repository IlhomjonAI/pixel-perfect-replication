import { pageMetadata } from "@/config/metadata";
import Teachers from "@/views/Teachers";
import { SCHOOL_NAME } from "@/config/site";
import { getTeachersPage } from "@/api/teacher";
export const dynamic = "force-dynamic";
export const metadata = pageMetadata(
  "O‘qituvchilar",
  "Maktab o‘qituvchilari ro‘yxati va ularning fanlari.",
);
export default async function Page() {
  const initialData = await getTeachersPage(50);
  return <Teachers initialData={initialData} />;
}
