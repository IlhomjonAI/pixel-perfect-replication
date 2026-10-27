import { pageMetadata } from "@/config/metadata";
import Admissions from "@/views/Admissions";
import { SCHOOL_NAME } from "@/config/site";
export const metadata = pageMetadata(
  "Qabul",
  "Qabul haqida ma’lumot. Arizalar rasmiy ariza.piima.uz platformasi orqali topshiriladi.",
);
export default function Page() {
  return <Admissions />;
}
