"use client";

import { MEDIA, type MediaKey } from "@/config/brand";
import { cn } from "@/lib/utils";

interface Props {
  /** Which configured media slot to show. */
  name: MediaKey;
  /** Wrapper classes (controls size/aspect via the parent grid). */
  className?: string;
  /** Classes for the image itself. */
  imgClassName?: string;
  /** Hide the discreet caption (used where a caption sits in adjacent copy). */
  hideCaption?: boolean;
  /** Above-the-fold images load eagerly with high priority. */
  priority?: boolean;
}

/**
 * Renders one centrally configured illustrative photograph with the discreet
 * "Namunaviy tasvir" caption, so stock imagery is never mistaken for a photo
 * of this school. The image is marked decorative here because the caption and
 * adjacent copy describe it; swap the slot's `src` in `frontend/config/brand.ts`
 * when a real photograph becomes available.
 */
export function SampleImage({
  name,
  className,
  imgClassName,
  hideCaption = false,
  priority = false,
}: Props) {
  const photo = MEDIA[name];
  const focal = photo.focal ? `${photo.focal.x}% ${photo.focal.y}%` : "50% 50%";

  return (
    <figure className={cn("relative overflow-hidden", className)}>
      <img
        src={photo.src}
        alt=""
        aria-hidden
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        style={{ objectPosition: focal }}
        className={cn("h-full w-full object-cover", imgClassName)}
      />
      {!hideCaption && photo.caption && (
        <figcaption className="absolute bottom-3 left-3 rounded-full bg-forest-deep/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-on-navy/90">
          {photo.caption}
        </figcaption>
      )}
    </figure>
  );
}
