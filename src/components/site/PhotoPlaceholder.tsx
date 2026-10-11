import { useState } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  src?: string | null;
  alt?: string;
  className?: string;
  label?: string;
  lazy?: boolean;
  compact?: boolean;
  fit?: "cover" | "contain";
}

/**
 * Shows a real image when available, otherwise an intentional, labelled
 * fallback. The fallback reserves the same space (the parent sets the aspect
 * ratio) so a missing or broken image never shifts the layout.
 */
export function PhotoPlaceholder({
  src,
  alt = "",
  className,
  label = "Fotosurat tez orada qo‘shiladi",
  lazy = true,
  compact,
  fit = "cover",
}: Props) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (src && failedSrc !== src) {
    return (
      <img
        src={src}
        alt={alt}
        loading={lazy ? "lazy" : "eager"}
        decoding="async"
        onError={() => setFailedSrc(src)}
        className={cn(
          "h-full w-full",
          fit === "contain" ? "object-contain" : "object-cover",
          className,
        )}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={src ? "Rasm hozir ochilmadi" : label}
      className={cn(
        "placeholder-pattern flex h-full w-full flex-col items-center justify-center gap-3 text-center text-muted-foreground",
        className,
      )}
    >
      <ImageOff
        className={cn(compact ? "h-5 w-5" : "h-7 w-7 text-gold-ink")}
        strokeWidth={1.4}
        aria-hidden
      />
      {!compact && (
        <span className="max-w-[18ch] px-3 text-xs font-medium leading-snug">
          {src ? "Rasm hozir ochilmadi" : label}
        </span>
      )}
    </div>
  );
}
