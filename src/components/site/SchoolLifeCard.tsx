import { useState } from "react";
import type { SchoolLifeItem } from "@/data/types";
import { formatDate } from "@/lib/site";
import { PhotoPlaceholder } from "@/components/site/PhotoPlaceholder";
import { DemoBadge } from "@/components/site/common";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
export function SchoolLifeCard({ item, dark = false }: { item: SchoolLifeItem; dark?: boolean }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const photos = Array.from(
    new Set([item.image, ...(item.gallery ?? [])].filter((url): url is string => !!url)),
  );
  return (
    <>
      <article
        className={`overflow-hidden rounded-xl border ${dark ? "border-on-navy/15" : "bg-card"}`}
      >
        <div className="aspect-[4/3]">
          <PhotoPlaceholder src={item.image ?? photos[0] ?? null} alt={item.title} compact />
        </div>
        <div className="p-5">
          <p className={`text-xs ${dark ? "text-on-navy-muted" : "text-muted-foreground"}`}>
            {item.category ?? "Faoliyat"}
            {item.eventDate ? " · " + formatDate(item.eventDate) : ""}
          </p>
          {item.isDemo && <DemoBadge />}
          <h3 className="mt-3 text-xl font-semibold">{item.title}</h3>
          <p
            className={`mt-2 line-clamp-3 whitespace-pre-line text-sm ${dark ? "text-on-navy-muted" : "text-muted-foreground"}`}
          >
            {item.description}
          </p>
          <button
            className="mt-4 text-sm underline underline-offset-4"
            onClick={() => {
              setIndex(0);
              setOpen(true);
            }}
            aria-label={item.title + " — batafsil"}
          >
            Batafsil{photos.length ? ` · ${photos.length} ta rasm` : ""}
          </button>
        </div>
      </article>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{item.title}</DialogTitle>
            <DialogDescription>
              {item.category ?? "Faoliyat"}
              {item.eventDate ? " · " + formatDate(item.eventDate) : ""}
            </DialogDescription>
          </DialogHeader>
          <p className="whitespace-pre-line text-sm leading-relaxed">{item.description}</p>
          {photos.length > 0 && (
            <>
              <div className="aspect-[4/3]">
                <PhotoPlaceholder
                  src={photos[index] ?? null}
                  alt={`${item.title}, ${index + 1}-rasm`}
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
                <p role="status">
                  {index + 1} / {photos.length}
                </p>
                <button
                  className="btn btn-outline"
                  disabled={index >= photos.length - 1}
                  onClick={() => setIndex((v) => v + 1)}
                >
                  Keyingi rasm
                </button>
              </div>
              <a
                className="text-sm underline"
                href={photos[index]}
                target="_blank"
                rel="noopener noreferrer"
              >
                Rasmni to‘liq ochish
              </a>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
