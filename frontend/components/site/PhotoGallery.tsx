"use client";

import { useState } from "react";
import { Lightbox } from "@/components/site/Lightbox";
import { PhotoPlaceholder } from "@/components/site/PhotoPlaceholder";

export function PhotoGallery({
  images,
  title,
  captions,
  landscape = false,
}: {
  images: (string | null)[];
  title: string;
  captions?: string[];
  landscape?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const photos = Array.from(new Set(images.filter((url): url is string => !!url)));
  const currentIndex = Math.max(0, Math.min(index, photos.length - 1));
  if (!photos.length) return null;
  return (
    <>
      <div
        className={
          landscape
            ? "grid grid-cols-1 gap-5 sm:grid-cols-2"
            : "grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4"
        }
      >
        {photos.map((url, i) => (
          <button
            key={url}
            type="button"
            className={`group relative ${landscape ? "aspect-[3/2]" : "aspect-square"} cursor-zoom-in overflow-hidden rounded-xl border bg-secondary text-left`}
            aria-label={`${captions?.[images.indexOf(url)] ?? title}, ${i + 1}-rasmni kattalashtirish`}
            onClick={() => {
              setIndex(i);
              setOpen(true);
            }}
          >
            <PhotoPlaceholder
              src={url}
              alt={captions?.[images.indexOf(url)] ?? `${title}, ${i + 1}-rasm`}
              compact
              className="transition-transform duration-500 group-hover:scale-[1.06]"
            />
            {captions?.[images.indexOf(url)] && (
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-5 pb-5 pt-12 text-base font-medium text-white">
                {captions[images.indexOf(url)]}
              </span>
            )}
          </button>
        ))}
      </div>
      <Lightbox
        open={open}
        onOpenChange={setOpen}
        title={title}
        description={
          photos.length > 1 ? `${currentIndex + 1} / ${photos.length} ta rasm` : undefined
        }
        images={photos}
        index={currentIndex}
        onIndexChange={setIndex}
        altPrefix={title}
      />
    </>
  );
}
