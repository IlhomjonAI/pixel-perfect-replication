import type { Achievement } from "@/data/types";
import { formatDate } from "@/lib/site";
import { DemoBadge } from "./common";
import { PhotoPlaceholder } from "./PhotoPlaceholder";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function CertificateModal({
  item,
  onClose,
}: {
  item: Achievement | null;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={item !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-2xl overflow-hidden p-0">
        <DialogHeader className="border-b p-5">
          {item?.isDemo && <DemoBadge />}
          <DialogTitle className="mt-2 text-xl font-semibold text-primary">
            {item?.title}
          </DialogTitle>
          <DialogDescription>
            {item
              ? `${item.studentName} · ${formatDate(item.achievementDate)} · ${item.result}`
              : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto">
          <div className="aspect-[4/3]">
            {item && (
              <PhotoPlaceholder
                src={item.certificateImage}
                label="Sertifikat surati uchun joy"
                alt={item.title}
                lazy={false}
                fit="contain"
              />
            )}
          </div>
        </div>
        {item?.certificateImage && (
          <a
            href={item.certificateImage}
            target="_blank"
            rel="noopener noreferrer"
            className="border-t p-4 text-center text-sm font-semibold text-primary underline"
          >
            Sertifikatni to‘liq ochish
          </a>
        )}
      </DialogContent>
    </Dialog>
  );
}
