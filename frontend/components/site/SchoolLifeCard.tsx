"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import type { SchoolLifeItem } from "@backend/contracts/models";
import { formatDate } from "@/config/site";
import { PhotoPlaceholder } from "@/components/site/PhotoPlaceholder";
import { DemoBadge } from "@/components/site/common";
import { Lightbox } from "@/components/site/Lightbox";
import { cn } from "@/lib/utils";

interface Props {
  item: SchoolLifeItem;
  dark?: boolean;
  /** Larger leading treatment used by varied listing/homepage compositions. */
  feature?: boolean;
}

export function SchoolLifeCard({ item, dark = false, feature = false }: Props) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const photos = Array.from(
    new Set([item.image, ...(item.gallery ?? [])].filter((url): url is string => !!url)),
  );
  const meta = [item.category ?? "Faoliyat", item.eventDate ? formatDate(item.eventDate) : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <article
        className={cn(
          "group flex h-full flex-col overflow-hidden",
          feature ? "rounded-2xl" : "rounded-xl",
          dark ? "border border-on-navy/15 bg-navy-deep/40" : "card-surface card-interactive",
        )}
      >
        <button
          type="button"
          onClick={() => {
            setIndex(0);
            setOpen(true);
          }}
          className="relative block w-full cursor-zoom-in overflow-hidden text-left"
          aria-label={`${item.title} — batafsil ko‘rish`}
        >
          <div className={cn("overflow-hidden", feature ? "aspect-[16/10]" : "aspect-[4/3]")}>
            <PhotoPlaceholder
              src={item.image ?? photos[0] ?? null}
              alt={item.title}
              className="transition-transform duration-500 group-hover:scale-[1.04]"
            />
          </div>
          {photos.length > 1 && (
            <span className="absolute bottom-3 right-3 rounded-full bg-forest-deep/80 px-2.5 py-1 text-[11px] font-semibold text-on-navy backdrop-blur">
              {photos.length} ta rasm
            </span>
          )}
        </button>
        <div className={cn("flex flex-1 flex-col p-5", feature && "md:p-7")}>
          <p
            className={cn(
              "text-xs font-medium tracking-wide",
              dark ? "text-on-navy-muted" : "text-muted-foreground",
            )}
          >
            {meta}
          </p>
          <h3
            className={cn(
              "mt-2 font-display leading-snug",
              feature ? "text-2xl md:text-3xl" : "text-xl",
              dark ? "text-on-navy" : "text-primary",
            )}
          >
            {item.title}
          </h3>
          <p
            className={cn(
              "mt-2 whitespace-pre-line text-sm leading-relaxed",
              feature ? "line-clamp-4" : "line-clamp-3",
              dark ? "text-on-navy-muted" : "text-muted-foreground",
            )}
          >
            {item.description}
          </p>
          <div className="mt-auto flex items-center justify-between gap-3 pt-5">
            <button
              type="button"
              onClick={() => {
                setIndex(0);
                setOpen(true);
              }}
              aria-label={`${item.title} — batafsil`}
              className={cn(
                "inline-flex min-h-9 items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline",
                dark ? "text-gold" : "text-primary",
              )}
            >
              Batafsil <ArrowUpRight className="h-4 w-4" aria-hidden />
            </button>
            {item.isDemo && <DemoBadge />}
          </div>
        </div>
      </article>
      <Lightbox
        open={open}
        onOpenChange={setOpen}
        title={item.title}
        description={meta}
        images={photos}
        index={index}
        onIndexChange={setIndex}
        altPrefix={item.title}
        openLabel="Rasmni to‘liq ochish"
      >
        <p className="whitespace-pre-line text-sm leading-relaxed">{item.description}</p>
      </Lightbox>
    </>
  );
}
