"use client";

import { useRef, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PhotoPlaceholder } from "@/components/site/PhotoPlaceholder";
import { cn } from "@/lib/utils";

interface LightboxProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string | undefined;
  images: string[];
  index: number;
  onIndexChange: (index: number) => void;
  /** Prefix for each image alt, e.g. "Tadbir" -> "Tadbir, 2-rasm". */
  altPrefix?: string | undefined;
  /** Label of the full-resolution link. */
  openLabel?: string | undefined;
  /** Optional extra content rendered above the image stage. */
  children?: ReactNode;
  className?: string | undefined;
  imageAspect?: "landscape" | "portrait";
}

/**
 * Keyboard-accessible image browser shared by news galleries, school-life
 * activities, teacher certificates and achievement certificates. Radix Dialog
 * provides focus trapping, Escape handling, scroll locking and focus return.
 */
export function Lightbox({
  open,
  onOpenChange,
  title,
  description,
  images,
  index,
  onIndexChange,
  altPrefix,
  openLabel = "To‘liq ochish",
  children,
  className,
  imageAspect = "landscape",
}: LightboxProps) {
  const count = images.length;
  const opener = useRef<HTMLElement | null>(null);
  const currentIndex = Math.max(
    0,
    Math.min(Number.isFinite(index) ? Math.trunc(index) : 0, count - 1),
  );
  const current = images[currentIndex] ?? null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onOpenAutoFocus={() => {
          opener.current =
            document.activeElement instanceof HTMLElement ? document.activeElement : null;
        }}
        onCloseAutoFocus={(event) => {
          if (opener.current?.isConnected) {
            event.preventDefault();
            opener.current.focus();
          }
        }}
        className={cn(
          "max-h-[92vh] grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden p-0 sm:max-w-3xl",
          className,
        )}
        onKeyDown={(event) => {
          if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
          if (
            event.target instanceof HTMLElement &&
            event.target.closest("input, textarea, select, [contenteditable=true]")
          )
            return;
          if (event.key === "ArrowLeft" && currentIndex > 0) {
            event.preventDefault();
            onIndexChange(currentIndex - 1);
          } else if (event.key === "ArrowRight" && currentIndex + 1 < count) {
            event.preventDefault();
            onIndexChange(currentIndex + 1);
          }
        }}
      >
        <DialogHeader className="border-b px-5 py-4 pr-14 text-left">
          <DialogTitle className="font-display text-xl leading-snug text-primary">
            {title}
          </DialogTitle>
          <DialogDescription className={description ? "" : "sr-only"}>
            {description || title}
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 overflow-y-auto px-5 py-5">
          {children && <div className="mb-4">{children}</div>}
          {count > 0 && (
            <div className="overflow-hidden rounded-xl border bg-secondary">
              <div
                className={
                  imageAspect === "portrait" ? "aspect-[3/4] max-h-[65vh]" : "aspect-[4/3]"
                }
              >
                <PhotoPlaceholder
                  src={current}
                  alt={`${altPrefix ?? title}, ${currentIndex + 1}-rasm`}
                  fit="contain"
                  lazy={false}
                />
              </div>
            </div>
          )}
          {count > 1 && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                className="btn btn-outline"
                disabled={currentIndex === 0}
                onClick={() => onIndexChange(currentIndex - 1)}
              >
                Oldingi rasm
              </button>
              <p role="status" className="text-sm text-muted-foreground">
                {currentIndex + 1} / {count} ta rasm
              </p>
              <button
                type="button"
                className="btn btn-outline"
                disabled={currentIndex >= count - 1}
                onClick={() => onIndexChange(currentIndex + 1)}
              >
                Keyingi rasm
              </button>
            </div>
          )}
          {current && (
            <a
              href={current}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex min-h-9 items-center text-sm font-semibold text-primary underline underline-offset-4 hover:text-gold-ink"
            >
              {openLabel}
            </a>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
