import { Link } from "@tanstack/react-router";
import { ArrowRight, Send } from "lucide-react";
import { ARIZA_URL, NAV, SCHOOL_NAME, SCHOOL_TAGLINE, TELEGRAM_URL } from "@/lib/site";
import { Emblem } from "./Emblem";

export function SiteFooter() {
  return (
    <footer className="relative bg-navy-deep text-on-navy">
      <div className="divider-gold absolute left-0 top-0 w-full" aria-hidden />
      <div className="container-site grid gap-10 py-14 md:grid-cols-[1.2fr_1fr_1fr] md:py-16">
        <div>
          <Link to="/" className="flex max-w-sm items-center gap-3">
            <Emblem className="h-12 w-12 shrink-0" />
            <p className="font-display text-xl font-medium leading-snug text-on-navy">
              {SCHOOL_NAME}
            </p>
          </Link>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-on-navy-muted">
            {SCHOOL_TAGLINE} Har kungi izlanish va yangi yutuqlar — maktab hayotimizning bir qismi.
          </p>
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-gold hover:text-on-navy"
          >
            <Send className="h-4 w-4" aria-hidden /> Telegram kanal{" "}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </a>
        </div>
        <nav aria-label="Pastki menyu">
          <p className="eyebrow">Maktabni kashf eting</p>
          <ul className="mt-4 grid grid-cols-2 gap-x-5 gap-y-1 text-sm">
            {NAV.map((n) => (
              <li key={n.to}>
                <Link
                  to={n.to}
                  className="inline-flex min-h-10 items-center text-on-navy-muted hover:text-gold"
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="eyebrow">Savol va takliflar</p>
          <p className="mt-5 text-sm leading-relaxed text-on-navy-muted">
            Maktab ma’muriyatiga savolingizni yoki taklifingizni yuboring.
          </p>
          <Link to="/aloqa" className="btn btn-ghost-navy mt-5 text-sm">
            Murojaat yuborish <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <a
            href={ARIZA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex min-h-10 items-center gap-2 text-xs text-on-navy-muted hover:text-gold"
          >
            Qabul portali: ariza.piima.uz <ArrowRight className="h-3 w-3" aria-hidden />
          </a>
        </div>
      </div>
      <div className="border-t border-on-navy/10">
        <div className="container-site flex flex-col gap-2 py-5 text-xs text-on-navy-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {SCHOOL_NAME}
          </p>
          <Link to="/admin" className="hover:text-gold">
            Xodimlar uchun
          </Link>
        </div>
      </div>
    </footer>
  );
}
