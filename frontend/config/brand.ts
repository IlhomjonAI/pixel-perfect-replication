/**
 * Public brand and hero-media configuration.
 *
 * This module holds non-secret, user-editable assets only. The official school
 * logo lives at `BRAND.logo` and is shown by the shared `Logo` component
 * everywhere (header, hero, footer, admin) with the built-in SVG mark as an
 * automatic fallback.
 *
 * `MEDIA` contains supplied school photographs; provenance and editing notes
 * are recorded in `public/media/school/README.md`.
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

/** A centrally configured, replaceable illustrative photograph. */
export interface SamplePhoto {
  /** Public path, e.g. "/media/hero-campus.jpg". */
  src: string;
  /** Describes the visible subject. */
  alt: string;
  /** Discreet on-page caption; empty string hides the caption. */
  caption: string;
  /** `object-position` percentages. */
  focal?: HeroFocalPoint;
  /** Attribution kept for the asset manifest and credits. */
  credit?: { photographer?: string; source: string };
}

/** Label shown on every illustrative photograph. */
export const SAMPLE_LABEL = "Namunaviy tasvir";

export const MEDIA = {
  hero: {
    src: "/media/school/entrance.webp",
    alt: "Maktabning bosh kirish qismi",
    caption: "Maktabning bosh kirish qismi",
    focal: { x: 50, y: 65 },
  },
  campus: {
    src: "/media/school/courtyard.webp",
    alt: "Maktab binosi va yashil hovli",
    caption: "Maktab binosi va yashil hovli",
    focal: { x: 50, y: 50 },
  },
  library: {
    src: "/media/school/library.webp",
    alt: "Maktab kutubxonasi",
    caption: "Kutubxona · surat tahrirlangan",
    focal: { x: 50, y: 55 },
  },
  shelves: {
    src: "/media/school/library.webp",
    alt: "Kutubxona kitob javonlari",
    caption: "Kutubxona · surat tahrirlangan",
    focal: { x: 50, y: 40 },
  },
  science: {
    src: "/media/school/courtyard.webp",
    alt: "Maktab hovlisi",
    caption: "Maktab hovlisi",
    focal: { x: 50, y: 50 },
  },
  classroom: {
    src: "/media/school/lobby.webp",
    alt: "Maktabning kirish foyesi",
    caption: "Maktabning kirish foyesi",
    focal: { x: 50, y: 60 },
  },
  collab: {
    src: "/media/school/courtyard.webp",
    alt: "Maktab hududi",
    caption: "Maktab hududi",
    focal: { x: 50, y: 50 },
  },
  notebook: {
    src: "/media/school/library.webp",
    alt: "Kutubxonadagi mutolaa muhiti",
    caption: "Kutubxona · surat tahrirlangan",
    focal: { x: 50, y: 60 },
  },
  reading: {
    src: "/media/school/lobby.webp",
    alt: "Maktab kirish qismi",
    caption: "Maktab kirish qismi",
    focal: { x: 50, y: 55 },
  },
} satisfies Record<string, SamplePhoto>;

export type MediaKey = keyof typeof MEDIA;

/** Four distinct views from the supplied school photographs. */
export const HERO_SLIDES = [
  { photo: MEDIA.hero, label: "Yangi marralar sari" },
  { photo: MEDIA.library, label: "Bilim va izlanish" },
  { photo: MEDIA.campus, label: "Maktabimiz muhiti" },
  { photo: MEDIA.reading, label: "Maktabga xush kelibsiz" },
] as const;

export interface Brand {
  /** Official logo path (served from `public/`). */
  logo: string;
  /** Accessible label when the logo is not purely decorative. */
  logoAlt: string;
  /** Homepage hero media; `image` points at the illustrative photograph. */
  hero: HeroMedia;
}

export const BRAND: Brand = {
  logo: "/brand/school-logo.svg",
  logoAlt: "Bekobod tumani ixtisoslashtirilgan maktabi logotipi",
  hero: {
    image: MEDIA.hero.src,
    focal: MEDIA.hero.focal,
    // A licensed short clip can be added later (`video`, `poster`); the hero
    // stays photographic meanwhile.
  },
};
