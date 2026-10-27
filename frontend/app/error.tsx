"use client";
import { useEffect } from "react";
import { PageHero } from "@/components/site/PageHero";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <PageHero
      eyebrow="Xatolik"
      title="Sahifa yuklanmadi"
      intro="Xatolik yuz berdi. Qayta urinib ko‘ring."
    >
      <button className="btn btn-gold" onClick={reset}>
        Qayta urinish
      </button>
    </PageHero>
  );
}
