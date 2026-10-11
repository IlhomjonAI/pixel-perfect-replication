import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Send, X } from "lucide-react";
import { useEffect, useState } from "react";
import { NAV, SCHOOL_NAME } from "@/lib/site";
import { Emblem } from "./Emblem";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="container-site flex h-18 items-center justify-between gap-4 py-3">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <Emblem className="h-10 w-10 shrink-0" />
          <span className="min-w-0 font-display text-[15px] font-semibold leading-tight text-primary sm:text-base">
            {SCHOOL_NAME}
          </span>
        </Link>

        <nav aria-label="Asosiy menyu" className="hidden items-center gap-1 xl:flex">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }}
              className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary data-[status=active]:text-primary data-[status=active]:underline data-[status=active]:decoration-gold data-[status=active]:decoration-2 data-[status=active]:underline-offset-8">
              {n.label}
            </Link>
          ))}
          <Link to="/aloqa" className="btn btn-primary ml-3 py-2.5">
            <Send className="h-4 w-4" aria-hidden /> Murojaat yuborish
          </Link>
        </nav>

        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="mobile-menu"
          aria-label={open ? "Menyuni yopish" : "Menyuni ochish"}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-primary xl:hidden">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav id="mobile-menu" aria-label="Mobil menyu" className="border-t bg-background xl:hidden">
          <ul className="container-site flex flex-col py-3">
            {NAV.map((n) => (
              <li key={n.to}>
                <Link to={n.to} activeOptions={{ exact: n.to === "/" }} onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-3 font-medium text-foreground hover:bg-muted data-[status=active]:text-gold">
                  {n.label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Link to="/aloqa" onClick={() => setOpen(false)} className="btn btn-primary w-full">
                <Send className="h-4 w-4" aria-hidden /> Murojaat yuborish
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
