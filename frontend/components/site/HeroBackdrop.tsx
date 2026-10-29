"use client";

/**
 * Lightweight decorative academic motif (books, laurel, arcs, columns).
 * Used behind the hero and inside empty/error states so a missing photograph
 * still produces an intentional composition. Rendered with CSS + inline SVG
 * only, no image request and no animation library.
 */
export function HeroBackdrop({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1440 720"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="academic-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D6B46B" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#D6B46B" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <g
        fill="none"
        stroke="url(#academic-fade)"
        strokeWidth="1.2"
        vectorEffect="non-scaling-stroke"
      >
        <circle cx="1180" cy="150" r="260" />
        <circle cx="1180" cy="150" r="180" />
        <circle cx="1180" cy="150" r="110" />
        <circle cx="220" cy="620" r="220" />
        <path d="M0 560H1440M0 600H1440M0 640H1440" />
        <path d="M120 720V430M180 720V430M240 720V430M300 720V430" />
      </g>
      <g fill="url(#academic-fade)">
        <path d="M250 120 L360 78 L470 120 L360 162 Z" />
        <path d="M285 140 V190 Q360 240 435 190 V140 L360 175 Z" opacity="0.85" />
        <path d="M470 120 V182" stroke="url(#academic-fade)" strokeWidth="3" />
      </g>
    </svg>
  );
}
