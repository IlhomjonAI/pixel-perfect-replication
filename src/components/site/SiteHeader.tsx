import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { NAV, SCHOOL_NAME } from "@/lib/site";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Emblem } from "./Emblem";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1280px)");
    const close = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener("change", close);
    return () => desktop.removeEventListener("change", close);
  }, []);
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="container-site flex min-h-18 items-center justify-between gap-4 py-3">
        <Link
          to="/"
          className="flex min-w-0 max-w-xs items-center gap-3"
          aria-label={SCHOOL_NAME + " — bosh sahifa"}
        >
          <Emblem className="h-10 w-10 shrink-0" />
          <span className="line-clamp-2 min-w-0 text-sm font-semibold leading-snug text-primary sm:text-base">
            {SCHOOL_NAME}
          </span>
        </Link>
        <nav aria-label="Asosiy menyu" className="hidden shrink-0 items-center xl:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="rounded-full px-2 py-3 text-[13px] font-semibold text-muted-foreground transition-colors hover:text-primary data-[status=active]:bg-secondary data-[status=active]:text-primary"
            >
              {n.label}
            </Link>
          ))}
          <Link to="/aloqa" className="btn btn-primary ml-3 px-4 py-2.5 text-sm">
            <Send className="h-4 w-4" aria-hidden />
            Aloqa
          </Link>
        </nav>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label="Menyuni ochish"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-primary xl:hidden"
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
                      className="block rounded-xl px-3 py-3 font-semibold hover:bg-muted data-[status=active]:bg-secondary data-[status=active]:text-primary"
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
