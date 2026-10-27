"use client";

import type { ReactNode } from "react";
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
}: LightboxProps) {
  const count = images.length;
  const current = images[index] ?? null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn("max-h-[92vh] gap-0 overflow-hidden p-0 sm:max-w-3xl", className)}
      >
        <DialogHeader className="border-b px-5 py-4 pr-14 text-left">
          <DialogTitle className="font-display text-xl leading-snug text-primary">
            {title}
          </DialogTitle>
          <DialogDescription className={description ? "" : "sr-only"}>
            {description || title}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[74vh] overflow-y-auto px-5 py-5">
          {children && <div className="mb-4">{children}</div>}
          {count > 0 && (
            <div className="overflow-hidden rounded-xl border bg-secondary">
              <div className="aspect-[4/3]">
                <PhotoPlaceholder
                  src={current}
                  alt={`${altPrefix ?? title}, ${index + 1}-rasm`}
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
                disabled={index === 0}
                onClick={() => onIndexChange(index - 1)}
              >
                Oldingi rasm
              </button>
              <p role="status" className="text-sm text-muted-foreground">
                {index + 1} / {count} ta rasm
              </p>
              <button
                type="button"
                className="btn btn-outline"
                disabled={index >= count - 1}
                onClick={() => onIndexChange(index + 1)}
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
