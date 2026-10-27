import { pageMetadata } from "@/config/metadata";
import PostDetail from "@/views/PostDetail";
import { SCHOOL_NAME } from "@/config/site";
import { getDatabasePost } from "@/api/news";
export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const item = await getDatabasePost(slug);
  return item
    ? pageMetadata(item.title, item.excerpt)
    : { title: "Sahifa topilmadi", robots: { index: false } };
}
export default async function Page({ params }: Props) {
  const { slug } = await params;
  const initialData = await getDatabasePost(slug);
  if (!initialData) notFound();
  return <PostDetail initialData={initialData} />;
}
