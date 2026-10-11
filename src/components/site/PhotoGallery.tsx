import { useState } from "react";
import { Lightbox } from "@/components/site/Lightbox";
import { PhotoPlaceholder } from "@/components/site/PhotoPlaceholder";

export function PhotoGallery({ images, title }: { images: (string | null)[]; title: string }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const photos = Array.from(new Set(images.filter((url): url is string => !!url)));
  if (!photos.length) return null;
  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4">
        {photos.map((url, i) => (
          <button
            key={url}
            type="button"
            className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-xl border bg-secondary"
            aria-label={`${title}, ${i + 1}-rasmni kattalashtirish`}
            onClick={() => {
              setIndex(i);
              setOpen(true);
            }}
          >
            <PhotoPlaceholder
              src={url}
              alt={`${title}, ${i + 1}-rasm`}
              compact
              className="transition-transform duration-500 group-hover:scale-[1.06]"
            />
          </button>
        ))}
      </div>
      <Lightbox
        open={open}
        onOpenChange={setOpen}
        title={title}
        description={photos.length > 1 ? `${index + 1} / ${photos.length} ta rasm` : undefined}
        images={photos}
        index={index}
        onIndexChange={setIndex}
        altPrefix={title}
      />
    </>
  );
}
