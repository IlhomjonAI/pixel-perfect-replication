"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { Logo } from "./Logo";
import { HeroBackdrop } from "@/components/site/HeroBackdrop";
import { Eyebrow } from "@/components/site/common";
import type { SamplePhoto } from "@/config/brand";
import { cn } from "@/lib/utils";

export function PageHero({
  eyebrow,
  title,
  intro,
  children,
  className,
  image,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  children?: ReactNode;
  className?: string;
  /**
   * Optional photograph shown behind the heading. Stock slots come from
   * `MEDIA` and carry their "Namunaviy tasvir" caption; real post photographs
   * can be passed without a caption.
   */
  image?: SamplePhoto | null;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showPhoto = Boolean(image?.src) && image?.src !== failedSrc;
  const focal = image?.focal ? `${image.focal.x}% ${image.focal.y}%` : "50% 50%";

  return (
    <section
      className={cn("page-hero text-on-navy relative overflow-hidden bg-forest-deep", className)}
    >
      {showPhoto && image && (
        <Image
          fill
          sizes="100vw"
          unoptimized={!image.src.startsWith("/")}
          src={image.src}
          alt=""
          aria-hidden
          loading="eager"
          fetchPriority="high"
          decoding="async"
          onError={() => setFailedSrc(image.src)}
          style={{ objectPosition: focal }}
          className="absolute inset-0 h-full w-full object-cover"
          key={image.src}
        />
      )}

      {showPhoto ? (
        <div className="photo-veil-page absolute inset-0" aria-hidden />
      ) : (
        <>
          <div className="hero-grid absolute inset-0 opacity-50" aria-hidden />
          <HeroBackdrop className="pointer-events-none absolute inset-0 h-full w-full" />
          <div
            className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-forest-deep"
            aria-hidden
          />
        </>
      )}

      <div className="container-site page-hero-content relative">
        <Logo
          tone="onDark"
          className="pointer-events-none absolute right-10 hidden h-48 w-48 opacity-[0.08] lg:inline-flex"
        />
        <div className="rise max-w-3xl">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-4 text-[clamp(2rem,4.6vw,3.25rem)] font-medium leading-[1.06] text-on-navy">
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

      {showPhoto && image?.caption && (
        <p className="absolute bottom-3 right-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-on-navy/65">
          {image.caption}
        </p>
      )}
    </section>
  );
}
