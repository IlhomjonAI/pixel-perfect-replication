import { pageMetadata } from "@/config/metadata";
import TeacherProfile from "@/views/TeacherProfile";
import { SCHOOL_NAME } from "@/config/site";
import { getDatabaseTeacher } from "@/api/teacher";
export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const item = await getDatabaseTeacher(slug);
  return item
    ? pageMetadata(item.name, `${item.name} — ${item.subject} o‘qituvchisi profili.`)
    : { title: "Sahifa topilmadi", robots: { index: false } };
}
export default async function Page({ params }: Props) {
  const { slug } = await params;
  const initialData = await getDatabaseTeacher(slug);
  if (!initialData) notFound();
  return <TeacherProfile initialData={initialData} />;
}
