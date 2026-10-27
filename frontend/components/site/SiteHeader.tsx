"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { NAV, SCHOOL_NAME } from "@/config/site";
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
  const pathname = usePathname();
  // Public pages share one continuous header/hero background.
  const overlay =
    pathname !== "/admin" &&
    (pathname === "/aloqa" ||
      NAV.some((item) =>
        item.to === "/"
          ? pathname === "/"
          : pathname === item.to || pathname?.startsWith(item.to + "/"),
      ));

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
      data-scrolled={scrolled}
      data-overlay={overlay}
      className={cn(
        "site-header sticky top-0 z-40 transition-colors duration-300",
        scrolled && "shadow-[0_8px_30px_-18px_#163d8355]",
        overlay
          ? scrolled
            ? "border-b border-white/10 bg-[#0b1e48]/95 backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
          : "border-b border-border bg-white/95 backdrop-blur-md",
      )}
    >
      <div className="container-site flex h-16 items-center justify-between gap-4 md:h-[4.5rem]">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-3"
          aria-label={SCHOOL_NAME + " — bosh sahifa"}
        >
          <Logo className="h-9 w-9 md:h-10 md:w-10" tone={overlay ? "onDark" : "brand"} />
          <span
            className={cn(
              "line-clamp-2 min-w-0 max-w-[14rem] text-sm font-semibold leading-snug transition-colors sm:text-base",
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
              href={n.to}
              data-status={
                (
                  n.to === "/"
                    ? pathname === "/"
                    : pathname === n.to || pathname?.startsWith(n.to + "/")
                )
                  ? "active"
                  : undefined
              }
              className={cn(
                "relative rounded-lg px-2.5 py-2.5 text-[13px] font-semibold transition-colors",
                overlay
                  ? "text-on-navy/85 hover:text-gold data-[status=active]:text-gold"
                  : "text-muted-foreground hover:text-primary data-[status=active]:bg-secondary data-[status=active]:text-primary",
              )}
            >
              {n.label}
            </Link>
          ))}
          <Link
            href="/aloqa"
            className={cn("btn ml-3 px-4 py-2.5 text-sm", overlay ? "btn-gold" : "btn-primary")}
          >
            <Send className="h-4 w-4" aria-hidden />
            Murojaat
          </Link>
        </nav>

        <Link
          href="/aloqa"
          className={cn(
            "btn ml-auto hidden shrink-0 whitespace-nowrap px-3 text-xs sm:inline-flex xl:hidden",
            overlay ? "btn-gold" : "btn-primary",
          )}
        >
          <Send size={15} aria-hidden /> Murojaat
        </Link>

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
              <div className="flex items-center gap-3">
                <Logo className="h-10 w-10" />
                <div className="min-w-0">
                  <SheetTitle>Menyu</SheetTitle>
                  <SheetDescription>{SCHOOL_NAME}</SheetDescription>
                </div>
              </div>
            </SheetHeader>
            <nav aria-label="Mobil menyu" className="mt-6">
              <ul className="space-y-1">
                {NAV.map((n) => (
                  <li key={n.to}>
                    <Link
                      href={n.to}
                      data-status={
                        (
                          n.to === "/"
                            ? pathname === "/"
                            : pathname === n.to || pathname?.startsWith(n.to + "/")
                        )
                          ? "active"
                          : undefined
                      }
                      onClick={() => setOpen(false)}
                      className="block rounded-xl px-3 py-3 font-semibold text-foreground hover:bg-muted data-[status=active]:bg-secondary data-[status=active]:text-primary"
                    >
                      {n.label}
                    </Link>
                  </li>
                ))}
                <li className="pt-4">
                  <Link
                    href="/aloqa"
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
