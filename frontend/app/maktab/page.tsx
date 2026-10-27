import { pageMetadata } from "@/config/metadata";
import About from "@/views/About";
import { SCHOOL_NAME } from "@/config/site";
export const metadata = pageMetadata(
  "Maktab haqida",
  `${SCHOOL_NAME}: tarix, ta’lim yo‘nalishlari, rahbariyat va imkoniyatlar.`,
);
export default function Page() {
  return <About />;
}
