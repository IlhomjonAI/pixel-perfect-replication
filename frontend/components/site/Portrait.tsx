"use client";

import { useState } from "react";
import { ZoomIn } from "lucide-react";
import { PhotoPlaceholder } from "./PhotoPlaceholder";
import { Lightbox } from "./Lightbox";

export function Portrait({
  src,
  name,
  eager = false,
}: {
  src: string | null;
  name: string;
  eager?: boolean;
}) {
  const [open, setOpen] = useState(false);
  if (!src) return <PhotoPlaceholder alt={name} label="Fotosurat tez orada qo‘shiladi" />;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`${name} rasmini kattalashtirish`}
        className="group relative block h-full w-full cursor-zoom-in text-left"
      >
        <PhotoPlaceholder src={src} alt={name} lazy={!eager} className="object-top" />
        <span
          className="absolute bottom-3 right-3 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-navy-deep/80 text-white shadow-sm transition-colors group-hover:bg-primary"
          aria-hidden
        >
          <ZoomIn size={20} />
        </span>
      </button>
      <Lightbox
        open={open}
        onOpenChange={setOpen}
        title={name}
        description="Portretni kattalashtirib ko‘rish."
        images={[src]}
        imageAspect="portrait"
        index={0}
        onIndexChange={() => {}}
        altPrefix={name}
        openLabel="Rasmni to‘liq ochish"
      />
    </>
  );
}
