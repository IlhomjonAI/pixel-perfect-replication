import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  src?: string | null;
  alt?: string;
  className?: string;
  label?: string;
  lazy?: boolean;
  compact?: boolean;
}

/** Shows a real image when available, otherwise a neutral labelled placeholder. */
export function PhotoPlaceholder({ src, alt = "", className, label = "Maktab fotosurati uchun joy", lazy = true, compact }: Props) {
  if (src) {
    return <img src={src} alt={alt} loading={lazy ? "lazy" : "eager"} className={cn("h-full w-full object-cover", className)} />;
  }
  return (
    <div role="img" aria-label={label} className={cn("placeholder-pattern flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground", className)}>
      <ImageIcon className={compact ? "h-5 w-5" : "h-8 w-8"} strokeWidth={1.5} aria-hidden />
      {!compact && <span className="rounded-full bg-card px-3 py-1 text-xs font-medium">{label}</span>}
    </div>
  );
}
