import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PhotoPlaceholder } from "@/components/site/PhotoPlaceholder";
export function PhotoGallery({ images, title }: { images: (string | null)[]; title: string }) {
  const [open, setOpen] = useState(false),
    [index, setIndex] = useState(0);
  const photos = Array.from(new Set(images.filter((url): url is string => !!url)));
  if (!photos.length) return null;
  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {photos.map((url, i) => (
          <button
            key={url}
            type="button"
            className="aspect-square cursor-zoom-in overflow-hidden rounded-xl border"
            aria-label={`${title}, ${i + 1}-rasmni kattalashtirish`}
            onClick={() => {
              setIndex(i);
              setOpen(true);
            }}
          >
            <PhotoPlaceholder src={url} alt={`${title}, ${i + 1}-rasm`} compact />
          </button>
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {index + 1} / {photos.length} ta rasm
            </DialogDescription>
          </DialogHeader>
          <div className="aspect-[4/3]">
            <PhotoPlaceholder
              src={photos[index] ?? null}
              alt={`${title}, ${index + 1}-rasm`}
              fit="contain"
              lazy={false}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              className="btn btn-outline"
              disabled={index === 0}
              onClick={() => setIndex((v) => v - 1)}
            >
              Oldingi rasm
            </button>
            <a
              href={photos[index]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-primary underline"
            >
              To‘liq ochish
            </a>
            <button
              className="btn btn-outline"
              disabled={index === photos.length - 1}
              onClick={() => setIndex((v) => v + 1)}
            >
              Keyingi rasm
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
