import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import type { Achievement } from "@/data/types";
import { formatDate } from "@/lib/site";
import { DemoBadge } from "./common";
import { PhotoPlaceholder } from "./PhotoPlaceholder";

export function CertificateModal({ item, onClose }: { item: Achievement | null; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!item) return;
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      prev?.focus();
    };
  }, [item, onClose]);

  if (!item) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-deep/70 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="cert-title" onClick={(e) => e.stopPropagation()}
        className="card-surface w-full max-w-2xl overflow-hidden">
        <div className="flex items-start justify-between gap-4 border-b p-5">
          <div>
            {item.isDemo && <DemoBadge />}
            <h2 id="cert-title" className="mt-2 text-xl font-semibold text-primary">{item.title}</h2>
            <p className="text-sm text-muted-foreground">{item.studentName} · {formatDate(item.achievementDate)} · {item.result}</p>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Yopish" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="aspect-[4/3]">
          <PhotoPlaceholder src={item.certificateImage} label="Sertifikat surati uchun joy" alt={item.title} lazy={false} />
        </div>
      </div>
    </div>
  );
}
