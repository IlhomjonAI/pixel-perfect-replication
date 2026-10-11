import { useState } from "react";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { Emblem } from "@/components/site/Emblem";

interface LogoProps {
  className?: string;
  /** Override the accessible label when the logo is not decorative. */
  alt?: string;
  /**
   * The official logo sits next to the school name in every current placement,
   * so it is decorative by default and does not duplicate the text.
   */
  decorative?: boolean;
  /** Adds a subtle light backing so the mark stays legible over media. */
  backing?: boolean;
}

/**
 * Shared school identity mark.
 *
 * Shows the official logo from `BRAND.logo` when it is available, falling back
 * to the built-in SVG emblem while the file is missing or fails to load. The
 * image keeps its original proportions via `object-contain` inside an explicit
 * square box.
 */
export function Logo({
  className,
  alt = BRAND.logoAlt,
  decorative = true,
  backing = false,
}: LogoProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(!BRAND.logo);
  const showFallback = failed || !loaded;

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center",
        backing &&
          "rounded-2xl bg-ivory/95 p-1.5 ring-1 ring-black/5 shadow-[0_10px_24px_-14px_rgba(9,40,32,0.7)]",
        className,
      )}
    >
      {showFallback && <Emblem className="h-full w-full" />}
      {!failed && (
        <img
          src={BRAND.logo}
          alt={decorative ? "" : alt}
          aria-hidden={decorative || undefined}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn(
            "absolute inset-0 h-full w-full object-contain transition-opacity duration-300",
            loaded ? "opacity-100" : "opacity-0",
          )}
        />
      )}
    </span>
  );
}
