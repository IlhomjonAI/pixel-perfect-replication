import { Link } from "@tanstack/react-router";
import { Send } from "lucide-react";
import { ARIZA_URL, NAV, PENDING, SCHOOL_NAME, TELEGRAM_URL } from "@/lib/site";
import { Emblem } from "./Emblem";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-navy-deep text-on-navy">
      <div className="container-site grid gap-10 py-14 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <Emblem className="h-11 w-11" />
            <p className="font-display text-lg font-semibold">{SCHOOL_NAME}</p>
          </div>
          <p className="mt-4 text-sm text-on-navy-muted">Bilim, izlanish va yutuqlar maskani.</p>
        </div>
        <nav aria-label="Pastki menyu">
          <p className="eyebrow">Bo‘limlar</p>
          <ul className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {[...NAV, { to: "/aloqa", label: "Aloqa" } as const].map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="text-on-navy-muted hover:text-gold">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="eyebrow">Aloqa</p>
          <dl className="mt-4 space-y-2 text-sm">
            <div>
              <dt className="inline text-on-navy-muted">Manzil: </dt>
              <dd className="inline">{PENDING}</dd>
            </div>
            <div>
              <dt className="inline text-on-navy-muted">Telefon: </dt>
              <dd className="inline">{PENDING}</dd>
            </div>
            <div>
              <dt className="inline text-on-navy-muted">Elektron pochta: </dt>
              <dd className="inline">{PENDING}</dd>
            </div>
          </dl>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-gold py-2 text-sm"
            >
              <Send className="h-4 w-4" aria-hidden /> Telegram kanal
            </a>
            <a
              href={ARIZA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost-navy py-2 text-sm"
            >
              ariza.piima.uz
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-on-navy/10">
        <p className="container-site py-5 text-xs text-on-navy-muted">
          © {SCHOOL_NAME}. Maktab yangiliklari va rasmiy e’lonlarini Telegram kanalimizda kuzatib
          boring.
        </p>
      </div>
    </footer>
  );
}
