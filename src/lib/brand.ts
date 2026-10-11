/**
 * Public brand and hero-media configuration.
 *
 * This module holds non-secret, user-editable assets only. To ship the official
 * school logo, drop the file at the public path below; the shared `Logo`
 * component then shows it everywhere (header, hero, footer, admin, favicon)
 * and keeps the built-in SVG mark as an automatic fallback.
 *
 * Hero media is intentionally optional. It must point to real, verified school
 * media — never a news image or another school's building. While it is empty
 * the hero renders its own graphic backdrop.
 */
export interface HeroFocalPoint {
  /** Horizontal focal position, percentage from the left (0–100). */
  x: number;
  /** Vertical focal position, percentage from the top (0–100). */
  y: number;
}

export interface HeroMedia {
  /** Full-width background photograph (optional). */
  image?: string;
  /** Poster frame shown while media loads, and the still fallback (optional). */
  poster?: string;
  /** Short, muted, looping background clip (optional). */
  video?: string;
  /** Responsive crop anchor used for `object-position`. */
  focal?: HeroFocalPoint;
}

export interface Brand {
  /** Official logo path (served from `public/`). */
  logo: string;
  /** Accessible label when the logo is not purely decorative. */
  logoAlt: string;
  /** Optional hero photograph / video configuration. */
  hero: HeroMedia;
}

export const BRAND: Brand = {
  logo: "/brand/school-logo.svg",
  logoAlt: "Bekobod tumani ixtisoslashtirilgan maktabi logotipi",
  hero: {
    // No verified school photograph or video has been supplied yet, so the
    // media stays empty and the hero uses its graphic fallback. Add real
    // paths here (`image`, `poster`, `video`, `focal`) to enable them.
    focal: { x: 50, y: 42 },
  },
};
