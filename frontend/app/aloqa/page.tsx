import { pageMetadata } from "@/config/metadata";
import Contact from "@/views/Contact";
import { SCHOOL_NAME } from "@/config/site";
export const metadata = pageMetadata(
  "Aloqa va murojaat",
  "Maktabga savol, taklif yoki hamkorlik bo‘yicha murojaat yuborish.",
);
export default function Page() {
  return <Contact />;
}
