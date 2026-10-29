import Link from "next/link";
import { PageHero } from "@/components/site/PageHero";
export default function NotFound() {
  return (
    <PageHero
      eyebrow="Xatolik 404"
      title="Sahifa topilmadi"
      intro="Siz qidirgan sahifa mavjud emas yoki boshqa manzilga ko‘chirilgan."
    >
      <Link href="/" className="btn btn-gold">
        Bosh sahifa
      </Link>
    </PageHero>
  );
}
