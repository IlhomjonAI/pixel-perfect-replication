import type { Achievement } from "@/data/types";
import { formatDate } from "@/lib/site";
import { DemoBadge } from "./common";
import { Lightbox } from "./Lightbox";
import { PhotoPlaceholder } from "./PhotoPlaceholder";

export function CertificateModal({
  item,
  onClose,
}: {
  item: Achievement | null;
  onClose: () => void;
}) {
  const images = item?.certificateImage ? [item.certificateImage] : [];
  return (
    <Lightbox
      open={item !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={item?.title ?? ""}
      description={
        item
          ? `${item.studentName} · ${formatDate(item.achievementDate)} · ${item.result}`
          : undefined
      }
      images={images}
      index={0}
      onIndexChange={() => {}}
      altPrefix={item?.title ?? ""}
      openLabel="Sertifikatni to‘liq ochish"
    >
      {item?.isDemo && <DemoBadge className="mb-3" />}
      {!item?.certificateImage && (
        <div className="overflow-hidden rounded-xl border bg-secondary">
          <div className="aspect-[4/3]">
            <PhotoPlaceholder label="Sertifikat surati tez orada qo‘shiladi" />
          </div>
        </div>
      )}
    </Lightbox>
  );
}
