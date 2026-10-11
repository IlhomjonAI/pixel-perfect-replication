import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { Emblem } from "@/components/site/Emblem";
import { HeroBackdrop } from "@/components/site/HeroBackdrop";
import { Eyebrow } from "@/components/site/common";
import { HERO_PRIMARY, HERO_SECONDARY, SCHOOL_NAME, SCHOOL_TAGLINE } from "@/lib/site";

interface HeroProps {
  image?: string | null;
  sourcePost?: { slug: string; title: string } | null;
}

export function Hero({ image, sourcePost }: HeroProps) {
  const [failed, setFailed] = useState<string | null>(null);
  const showImage = Boolean(image) && failed !== image;

  const split = SCHOOL_NAME.split(" ixtisoslashtirilgan");
  const lineOne = split[0] ?? SCHOOL_NAME;
  const lineTwo = split.length > 1 ? `ixtisoslashtirilgan${split.slice(1).join("")}` : "";

  return (
    <section
      className="relative isolate overflow-hidden bg-forest-deep text-on-navy"
      style={{
        marginTop: "calc(-1 * var(--site-header-h))",
        paddingTop: "calc(var(--site-header-h) + 2.5rem)",
      }}
    >
      {showImage ? (
        <img
          src={image ?? undefined}
          alt=""
          aria-hidden
          loading="eager"
          decoding="async"
          onError={() => setFailed(image ?? null)}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
      ) : (
        <HeroBackdrop className="absolute inset-0 -z-10 h-full w-full" />
      )}
      <div className="hero-grid absolute inset-0 -z-10 opacity-40" aria-hidden />
      <div className="hero-vignette absolute inset-0 -z-10" aria-hidden />

      <div className="container-site relative pb-16 md:pb-24 xl:pb-28">
        <div className="rise mx-auto flex max-w-3xl flex-col items-center text-center">
          <Emblem className="h-14 w-14 drop-shadow md:h-16 md:w-16" />
          <Eyebrow className="mt-6 justify-center">Bekobod tumani</Eyebrow>
          <h1 className="mt-3 text-[clamp(2rem,5.4vw,4rem)] font-medium leading-[1.04] text-on-navy">
            <span className="block">{lineOne}</span>
            {lineTwo && <span className="block">{lineTwo}</span>}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-on-navy-muted md:text-lg">
            {SCHOOL_TAGLINE}
          </p>
          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Link to="/maktab" className="btn btn-gold w-full sm:w-auto">
              {HERO_PRIMARY}
            </Link>
            <Link to="/yutuqlar" className="btn btn-ghost-navy w-full sm:w-auto">
              {HERO_SECONDARY}
            </Link>
          </div>
          <a
            href="#yangiliklar"
            className="mt-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-on-navy-muted transition-colors hover:text-gold"
          >
            So‘nggi yangiliklar
            <ChevronDown className="h-4 w-4 animate-bounce" aria-hidden />
          </a>
          {showImage && sourcePost && (
            <p className="mt-6 text-xs text-on-navy-muted/80">
              Fon rasmi:{" "}
              <Link
                to="/yangiliklar/$slug"
                params={{ slug: sourcePost.slug }}
                className="underline underline-offset-4 hover:text-gold"
              >
                {sourcePost.title}
              </Link>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
