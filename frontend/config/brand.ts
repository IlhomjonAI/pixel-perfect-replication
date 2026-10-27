/**
 * Public brand and hero-media configuration.
 *
 * This module holds non-secret, user-editable assets only. The official school
 * logo lives at `BRAND.logo` and is shown by the shared `Logo` component
 * everywhere (header, hero, footer, admin) with the built-in SVG mark as an
 * automatic fallback.
 *
 * `MEDIA` centralizes every replaceable illustrative photograph: local public
 * path, subject description, discreet caption, focal position and attribution.
 * These are temporary stock images (see `public/media/manifest.json`) and are
 * always labelled "Namunaviy tasvir" on the page — they must never be implied
 * to show this school, its building or its people. Replace `src` with a real
 * school photograph to make a slot authentic; the caption/credit can then be
 * cleared.
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
  /** Describes the visible subject; must not claim the photo is of this school. */
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

const sampleCaption = (subject: string) => `${SAMPLE_LABEL} — ${subject}`;

export const MEDIA = {
  /** Homepage hero: school-like architecture with sky and columns. */
  hero: {
    src: "/media/hero-campus.jpg",
    alt: "Sayt namunasi uchun ta’lim binosi tasviri",
    caption: sampleCaption("ta’lim binosi"),
    focal: { x: 50, y: 58 },
    credit: { source: "https://images.unsplash.com/photo-1562774053-701939374585" },
  },
  /** About / introduction split section and maktab page hero. */
  campus: {
    src: "/media/campus-dusk.jpg",
    alt: "Sayt namunasi uchun kampus binosi tasviri",
    caption: sampleCaption("kampus binosi"),
    focal: { x: 50, y: 45 },
    credit: { source: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f" },
  },
  /** Homepage introduction image (library). */
  library: {
    src: "/media/intro-library.jpg",
    alt: "Sayt namunasi uchun kutubxona tasviri",
    caption: sampleCaption("kutubxona"),
    focal: { x: 50, y: 50 },
    credit: {
      photographer: "Alfons Morales",
      source: "https://images.unsplash.com/photo-1507842217343-583bb7270b66",
    },
  },
  /** News page hero: library shelves. */
  shelves: {
    src: "/media/library-shelves.jpg",
    alt: "Sayt namunasi uchun kitob javonlari tasviri",
    caption: sampleCaption("kitob javonlari"),
    focal: { x: 50, y: 45 },
    credit: {
      photographer: "Iñaki del Olmo",
      source: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da",
    },
  },
  /** Achievements page hero: science glassware. */
  science: {
    src: "/media/science-lab.jpg",
    alt: "Sayt namunasi uchun laboratoriya texnikasi tasviri",
    caption: sampleCaption("laboratoriya"),
    focal: { x: 50, y: 55 },
    credit: {
      photographer: "Hans Reniers",
      source: "https://images.unsplash.com/photo-1532094349884-543bc11b234d",
    },
  },
  /** Teachers page hero: empty classroom. */
  classroom: {
    src: "/media/classroom.jpg",
    alt: "Sayt namunasi uchun sinfxona tasviri",
    caption: sampleCaption("sinfxona"),
    focal: { x: 50, y: 50 },
    credit: { source: "https://images.unsplash.com/photo-1509062522246-3755977927d7" },
  },
  /** School life page hero: collaborative study. */
  collab: {
    src: "/media/study-collab.jpg",
    alt: "Sayt namunasi uchun birga o‘qish tasviri",
    caption: sampleCaption("birga o‘qish"),
    focal: { x: 50, y: 40 },
    credit: { source: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f" },
  },
  /** Admissions page hero: notebook and study desk. */
  notebook: {
    src: "/media/notebook.jpg",
    alt: "Sayt namunasi uchun daftar bilan o‘qish tasviri",
    caption: sampleCaption("o‘quv stoli"),
    focal: { x: 50, y: 50 },
    credit: { source: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8" },
  },
  /** Contact page hero: reading in a library. */
  reading: {
    src: "/media/reading.jpg",
    alt: "Sayt namunasi uchun kutubxonada o‘qish tasviri",
    caption: sampleCaption("o‘quv muhiti"),
    focal: { x: 50, y: 40 },
    credit: { source: "https://images.unsplash.com/photo-1588072432836-e10032774350" },
  },
} satisfies Record<string, SamplePhoto>;

export type MediaKey = keyof typeof MEDIA;

/** Replace these images with school photographs when they are available. */
export const HERO_SLIDES = [
  { photo: MEDIA.hero, label: "Yangi marralar sari" },
  { photo: MEDIA.library, label: "Bilim va izlanish" },
  { photo: MEDIA.campus, label: "Kampus muhiti" },
  { photo: MEDIA.science, label: "Kashfiyotlar boshlanadigan joy" },
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
