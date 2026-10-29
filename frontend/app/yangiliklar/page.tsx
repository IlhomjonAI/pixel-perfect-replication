import { pageMetadata } from "@/config/metadata";
import News from "@/views/News";
import { SCHOOL_NAME } from "@/config/site";
import { getPostsPage } from "@/api/news";
export const dynamic = "force-dynamic";
export const metadata = pageMetadata(
  "Yangiliklar",
  "Maktab yangiliklari, tadbirlari va e’lonlari.",
);
export default async function Page() {
  const initialData = await getPostsPage(50);
  return <News initialData={initialData} />;
}
