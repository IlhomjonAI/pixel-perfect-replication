"use client";

import { BRAND } from "@/config/brand";
import { cn } from "@/lib/utils";
import { SchoolSeal } from "@/components/site/SchoolSeal";

export const LOGO_TONES = {
  /** Original seal blue — for light surfaces. */
  brand: "text-[#14134F]",
  /** White seal — for dark/photo backgrounds. */
  onDark: "text-white",
  /** Muted gold seal — for small decorative accents only. */
  gold: "text-[#C9A227]",
} as const;

export type LogoTone = keyof typeof LOGO_TONES;

interface LogoProps {
  className?: string;
  /** Override the accessible label when the logo is not decorative. */
  alt?: string;
  /**
   * The official logo sits next to the school name in every current placement,
   * so it is decorative by default and does not duplicate the text.
   */
  decorative?: boolean;
  /** Which seal color to paint with; pick per surface. */
  tone?: LogoTone;
}

/**
 * Shared school identity mark.
 *
 * Renders the official seal as an inline vector, so it never flashes a
 * placeholder, never 404s and can be recolored per surface through `tone`.
 */
export function Logo({
  className,
  alt = BRAND.logoAlt,
  decorative = true,
  tone = "brand",
}: LogoProps) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center",
        LOGO_TONES[tone],
        className,
      )}
    >
      <SchoolSeal className="h-full w-full" />
      {!decorative && <span className="sr-only">{alt}</span>}
    </span>
  );
}
