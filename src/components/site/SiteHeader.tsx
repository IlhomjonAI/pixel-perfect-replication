import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { NAV, SCHOOL_NAME, TELEGRAM_URL } from "@/lib/site";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHome = pathname === "/";
  const overlay = isHome && !scrolled;

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1280px)");
    const close = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener("change", close);
    return () => desktop.removeEventListener("change", close);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-colors duration-300",
        overlay
          ? "border-b border-transparent bg-transparent"
          : "border-b border-border bg-ivory/92 backdrop-blur-md",
      )}
    >
      <div
        className={cn(
          "hidden border-b transition-colors duration-300 md:flex md:h-8 md:items-center",
          overlay
            ? "border-on-navy/20 bg-transparent text-on-navy"
            : "border-border bg-forest text-on-navy",
        )}
      >
        <div className="container-site flex w-full items-center justify-between gap-4 text-[11px] sm:text-xs">
          <p className="truncate">Bilim. Izlanish. Kelajak.</p>
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 py-1 text-on-navy-muted transition-colors hover:text-gold"
          >
            <Send className="h-3 w-3" aria-hidden /> Telegram kanal
          </a>
        </div>
      </div>

      <div className="container-site flex h-16 items-center justify-between gap-4 md:h-[4.5rem] xl:h-20">
        <Link
          to="/"
          className="flex min-w-0 items-center gap-3"
          aria-label={SCHOOL_NAME + " — bosh sahifa"}
        >
          <Logo className="h-11 w-11 md:h-12 md:w-12" backing={overlay} />
          <span
            className={cn(
              "line-clamp-2 min-w-0 max-w-[16rem] text-sm font-semibold leading-snug transition-colors sm:text-base",
              overlay ? "text-on-navy" : "text-primary",
            )}
          >
            {SCHOOL_NAME}
          </span>
        </Link>

        <nav aria-label="Asosiy menyu" className="hidden shrink-0 items-center xl:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className={cn(
                "relative rounded-lg px-3 py-2.5 text-[13px] font-semibold transition-colors",
                overlay
                  ? "text-on-navy/85 hover:text-gold data-[status=active]:text-gold"
                  : "text-muted-foreground hover:text-primary data-[status=active]:bg-secondary data-[status=active]:text-primary",
              )}
            >
              {n.label}
            </Link>
          ))}
          <Link
            to="/aloqa"
            className={cn("btn ml-3 px-4 py-2.5 text-sm", overlay ? "btn-gold" : "btn-primary")}
          >
            <Send className="h-4 w-4" aria-hidden />
            Murojaat
          </Link>
        </nav>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label="Menyuni ochish"
              className={cn(
                "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors xl:hidden",
                overlay
                  ? "border-on-navy/40 text-on-navy hover:border-gold hover:text-gold"
                  : "border-input text-primary hover:bg-secondary",
              )}
            >
              <Menu className="h-5 w-5" aria-hidden />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[min(22rem,90vw)] overflow-y-auto">
            <SheetHeader className="pr-6 text-left">
              <SheetTitle>Menyu</SheetTitle>
              <SheetDescription>{SCHOOL_NAME}</SheetDescription>
            </SheetHeader>
            <nav aria-label="Mobil menyu" className="mt-6">
              <ul className="space-y-1">
                {NAV.map((n) => (
                  <li key={n.to}>
                    <Link
                      to={n.to}
                      activeOptions={{ exact: n.to === "/" }}
                      onClick={() => setOpen(false)}
                      className="block rounded-xl px-3 py-3 font-semibold text-foreground hover:bg-muted data-[status=active]:bg-secondary data-[status=active]:text-primary"
                    >
                      {n.label}
                    </Link>
                  </li>
                ))}
                <li className="pt-4">
                  <Link
                    to="/aloqa"
                    onClick={() => setOpen(false)}
                    className="btn btn-primary w-full"
                  >
                    <Send className="h-4 w-4" aria-hidden />
                    Murojaat yuborish
                  </Link>
                </li>
              </ul>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
