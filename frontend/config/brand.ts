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
    src: "/media/school/school-facade.webp",
    alt: "Maktabimizga xush kelibsiz",
    caption: "Maktabimizga xush kelibsiz",
    focal: { x: 50, y: 58 },
  },
  campus: {
    src: "/media/school/campus-wide.webp",
    alt: "Bekobod tumani ixtisoslashtirilgan maktabi",
    caption: "Bekobod tumani ixtisoslashtirilgan maktabi",
    focal: { x: 50, y: 50 },
  },
  library: {
    src: "/media/school/library.webp",
    alt: "Kutubxona — bilim va mutolaa maskani",
    caption: "Kutubxona — bilim va mutolaa maskani",
    focal: { x: 50, y: 55 },
  },
  shelves: {
    src: "/media/school/library-wide.webp",
    alt: "Kitoblar olami",
    caption: "Kitoblar olami",
    focal: { x: 50, y: 52 },
  },
  science: {
    src: "/media/school/physics-room.webp",
    alt: "Fizika xonasi",
    caption: "Fizika xonasi",
    focal: { x: 50, y: 60 },
  },
  classroom: {
    src: "/media/school/mathematics-room.webp",
    alt: "Matematika xonasi",
    caption: "Matematika xonasi",
    focal: { x: 50, y: 60 },
  },
  collab: {
    src: "/media/school/sports-court.webp",
    alt: "Sport va faol hayot",
    caption: "Sport va faol hayot",
    focal: { x: 50, y: 55 },
  },
  notebook: {
    src: "/media/school/computer-lab.webp",
    alt: "Informatika xonasi",
    caption: "Informatika xonasi",
    focal: { x: 50, y: 65 },
  },
  reading: {
    src: "/media/school/foyer-wide.webp",
    alt: "Maktab foyesi",
    caption: "Maktab foyesi",
    focal: { x: 50, y: 55 },
  },
  garden: {
    src: "/media/school/garden-walk.webp",
    alt: "Yashil yo‘laklar",
    caption: "Yashil yo‘laklar",
    focal: { x: 50, y: 55 },
  },
  heritage: {
    src: "/media/school/national-corner.webp",
    alt: "Milliy qadriyatlar burchagi",
    caption: "Milliy qadriyatlar burchagi",
    focal: { x: 50, y: 55 },
  },
  learning: {
    src: "/media/school/classroom-wide.webp",
    alt: "Dars va izlanish muhiti",
    caption: "Dars va izlanish muhiti",
    focal: { x: 50, y: 60 },
  },
  gate: {
    src: "/media/school/school-gate.webp",
    alt: "Maktabga kirish",
    caption: "Maktabga kirish",
    focal: { x: 50, y: 55 },
  },
} satisfies Record<string, SamplePhoto>;

export type MediaKey = keyof typeof MEDIA;

/** Three main views of the school building and grounds. */
export const HERO_SLIDES = [
  { photo: MEDIA.hero, label: "Yangi marralar sari" },
  { photo: MEDIA.campus, label: "Maktabimiz muhiti" },
  { photo: MEDIA.garden, label: "Ilhom beruvchi muhit" },
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
