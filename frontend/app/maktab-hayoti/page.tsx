import { pageMetadata } from "@/config/metadata";
import SchoolLife from "@/views/SchoolLife";
import { SCHOOL_NAME } from "@/config/site";
import { getSchoolLifePage } from "@/api/school-life";
export const dynamic = "force-dynamic";
export const metadata = pageMetadata(
  "Maktab hayoti",
  "Maktab tadbirlari, to‘garaklar, loyihalar va fotogalereyalar.",
);
export default async function Page() {
  const initialData = await getSchoolLifePage(20);
  return <SchoolLife initialData={initialData} />;
}
