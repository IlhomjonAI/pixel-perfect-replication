import type { ReactNode } from "react";
import { HeroBackdrop } from "@/components/site/HeroBackdrop";
import { Eyebrow } from "@/components/site/common";
import { cn } from "@/lib/utils";

export function PageHero({
  eyebrow,
  title,
  intro,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("text-on-navy relative overflow-hidden bg-forest-deep", className)}>
      <div className="hero-grid absolute inset-0 opacity-50" aria-hidden />
      <HeroBackdrop className="pointer-events-none absolute inset-0 h-full w-full" />
      <div
        className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-forest-deep"
        aria-hidden
      />
      <div className="container-site relative py-14 md:py-20">
        <div className="rise max-w-3xl">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-4 text-[clamp(2rem,5vw,3.5rem)] font-medium leading-[1.05] text-on-navy">
            {title}
          </h1>
          {intro && (
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-on-navy-muted md:text-lg">
              {intro}
            </p>
          )}
          {children && <div className="mt-7">{children}</div>}
        </div>
      </div>
    </section>
  );
}
