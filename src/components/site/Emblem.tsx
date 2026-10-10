export function Emblem({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <circle cx="20" cy="20" r="19" className="fill-primary stroke-gold" strokeWidth="1.5" />
      <path d="M11 15 L20 11 L29 15 L20 19 Z" className="fill-gold" />
      <path d="M14 17.5 V23 C14 25.5 26 25.5 26 23 V17.5 L20 20.2 Z" className="fill-on-navy" />
      <path d="M29 15 V22" className="stroke-gold" strokeWidth="1.3" />
      <text x="20" y="33" textAnchor="middle" className="fill-gold" fontSize="5" fontWeight="700" fontFamily="Manrope, sans-serif">BTIM</text>
    </svg>
  );
}
