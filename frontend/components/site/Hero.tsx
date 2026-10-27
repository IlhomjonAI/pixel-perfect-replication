"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { HERO_SLIDES } from "@/config/brand";
import { SCHOOL_NAME } from "@/config/site";
import { Logo } from "./Logo";

export function Hero() {
  const [failed, setFailed] = useState<string[]>([]);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [ready, setReady] = useState<string[]>([]);
  const slides = useMemo(
    () => HERO_SLIDES.filter((item) => !failed.includes(item.photo.src)),
    [failed],
  );
  const current = active % Math.max(1, slides.length);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    const visibility = () => setVisible(!document.hidden);
    visibility();
    document.addEventListener("visibilitychange", visibility);
    return () => document.removeEventListener("visibilitychange", visibility);
  }, []);
  useEffect(() => {
    setProgress(0);
    if (!visible || reducedMotion || slides.length < 2) return;
    let started = performance.now();
    let index = current;
    const timer = setInterval(() => {
      const elapsed = performance.now() - started;
      setProgress(Math.min(1, elapsed / 6000));
      if (elapsed < 6000) return;
      for (let step = 1; step < slides.length; step++) {
        const next = (index + step) % slides.length;
        if (ready.includes(slides[next]!.photo.src)) {
          index = next;
          setActive(next);
          setProgress(0);
          started = performance.now();
          break;
        }
      }
    }, 50);
    return () => clearInterval(timer);
  }, [visible, reducedMotion, slides, ready, current]);

  return (
    <section className="hero-stage" aria-label="Maktab bilan tanishing">
      <div className="hero-slides" aria-hidden="true">
        {slides.map((item, index) => (
          <div key={item.photo.src} className="hero-slide" data-active={index === current}>
            <Image
              src={item.photo.src}
              alt=""
              fill
              sizes="100vw"
              unoptimized={!item.photo.src.startsWith("/")}
              fetchPriority={index === 0 ? "high" : "low"}
              loading="eager"
              decoding="async"
              style={{ objectPosition: `${item.photo.focal.x}% ${item.photo.focal.y}%` }}
              onLoad={() =>
                setReady((current) =>
                  current.includes(item.photo.src) ? current : [...current, item.photo.src],
                )
              }
              onError={() => setFailed((current) => [...current, item.photo.src])}
            />
          </div>
        ))}
      </div>
      <div className="hero-shade" aria-hidden="true" />
      <div className="container-site hero-layout">
        <div className="hero-copy rise">
          <div className="hero-brand">
            <Logo tone="onDark" className="h-11 w-11 md:h-14 md:w-14" />
            <p className="hero-kicker">
              <span />
              Ixtisoslashtirilgan ta’lim · Bekobod
            </p>
          </div>
          <h1>
            Bugungi bilim.
            <br />
            <span>Ertangi imkoniyat.</span>
          </h1>
          <p className="hero-school">{SCHOOL_NAME}</p>
          <p className="hero-description">
            Katta orzular bilimdan boshlanadi. O‘rganish, izlanish va o‘z yo‘lingizni topish sari
            biz bilan qadam qo‘ying.
          </p>
          <div className="hero-actions">
            <Link href="/maktab" className="btn hero-primary">
              Maktab bilan tanishing <ArrowRight size={18} aria-hidden />
            </Link>
            <Link href="/aloqa" className="btn hero-secondary">
              Murojaat yuborish
            </Link>
          </div>
        </div>
        <div className="hero-progress" aria-hidden="true">
          {slides.map((item, index) => (
            <span className="hero-progress-track" key={item.photo.src}>
              <span style={{ transform: `scaleX(${index === current ? progress : 0})` }} />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
