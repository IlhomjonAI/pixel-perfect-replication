import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, Pause, Play } from "lucide-react";
import { HeroBackdrop } from "@/components/site/HeroBackdrop";
import { Logo } from "@/components/site/Logo";
import { Eyebrow } from "@/components/site/common";
import { BRAND } from "@/lib/brand";
import { HERO_PRIMARY, HERO_SECONDARY, SCHOOL_NAME, SCHOOL_TAGLINE } from "@/lib/site";

const media = BRAND.hero;
const focalPosition = `${media.focal?.x ?? 50}% ${media.focal?.y ?? 50}%`;
const stillSrc = media.image ?? media.poster ?? null;
const videoSrc = media.video ?? null;

interface NetworkInformation {
  saveData?: boolean;
  effectiveType?: string;
}

/**
 * Homepage hero with a deliberate media system.
 *
 * Renders, from back to front: a graphic backdrop, an optional still image and
 * an optional short background video, then dark-green overlays for legible
 * text. Video is only mounted when a clip exists, the viewport is wide enough,
 * the user has not requested reduced motion and the connection is not in
 * data-saving mode. Autoplay rejection and media errors fall back gracefully.
 */
export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [allowVideo, setAllowVideo] = useState(false);
  const [stillFailed, setStillFailed] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktopQuery = window.matchMedia("(min-width: 768px)");
    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    const saveData =
      Boolean(connection?.saveData) ||
      connection?.effectiveType === "2g" ||
      connection?.effectiveType === "slow-2g";
    const update = () =>
      setAllowVideo(Boolean(videoSrc) && desktopQuery.matches && !motionQuery.matches && !saveData);
    update();
    motionQuery.addEventListener("change", update);
    desktopQuery.addEventListener("change", update);
    return () => {
      motionQuery.removeEventListener("change", update);
      desktopQuery.removeEventListener("change", update);
    };
  }, []);

  const showVideo = allowVideo && !videoFailed;
  const showStill = Boolean(stillSrc) && !stillFailed;

  useEffect(() => {
    if (!showVideo) return;
    const video = videoRef.current;
    if (!video) return;
    const attempt = video.play();
    if (attempt) attempt.catch(() => setPlaying(false));
  }, [showVideo]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      const attempt = video.play();
      if (attempt) attempt.catch(() => setPlaying(false));
    } else {
      video.pause();
    }
  };

  const split = SCHOOL_NAME.split(" ixtisoslashtirilgan");
  const lineOne = split[0] ?? SCHOOL_NAME;
  const lineTwo = split.length > 1 ? `ixtisoslashtirilgan${split.slice(1).join("")}` : "";

  return (
    <section
      className="relative isolate flex items-center overflow-hidden bg-forest-deep text-on-navy"
      style={{
        marginTop: "calc(-1 * var(--site-header-h))",
        paddingTop: "calc(var(--site-header-h) + 1.75rem)",
      }}
    >
      <HeroBackdrop className="absolute inset-0 -z-10 h-full w-full" />

      {showStill && (
        <img
          src={stillSrc ?? undefined}
          alt=""
          aria-hidden
          loading="eager"
          fetchPriority="high"
          decoding="async"
          onError={() => setStillFailed(true)}
          style={{ objectPosition: focalPosition }}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
      )}

      {showVideo && (
        <video
          ref={videoRef}
          src={videoSrc ?? undefined}
          poster={media.poster ?? media.image}
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          aria-hidden
          tabIndex={-1}
          onPlaying={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={() => setVideoFailed(true)}
          style={{ objectPosition: focalPosition }}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
      )}

      <div className="hero-grid absolute inset-0 -z-10 opacity-40" aria-hidden />
      <div className="hero-vignette absolute inset-0 -z-10" aria-hidden />

      <div className="container-site relative w-full pb-14 md:pb-16 xl:pb-20">
        <div className="rise mx-auto flex max-w-3xl flex-col items-center text-center">
          <Logo className="h-16 w-16 md:h-20 md:w-20" backing />
          <Eyebrow className="mt-5 justify-center">Bekobod tumani</Eyebrow>
          <h1 className="mt-3 text-[clamp(2rem,5.2vw,3.75rem)] font-medium leading-[1.04] text-on-navy">
            <span className="block">{lineOne}</span>
            {lineTwo && <span className="block">{lineTwo}</span>}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-on-navy-muted md:text-lg">
            {SCHOOL_TAGLINE}
          </p>
          <div className="mt-7 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Link to="/maktab" className="btn btn-gold w-full sm:w-auto">
              {HERO_PRIMARY}
            </Link>
            <Link to="/yutuqlar" className="btn btn-ghost-navy w-full sm:w-auto">
              {HERO_SECONDARY}
            </Link>
          </div>
          <a
            href="#yangiliklar"
            className="group mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-on-navy-muted transition-colors hover:text-gold"
          >
            So‘nggi yangiliklar
            <ChevronDown
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5"
              aria-hidden
            />
          </a>
        </div>
      </div>

      {showVideo && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? "Fon videosini to‘xtatish" : "Fon videosini ijro etish"}
          className="absolute bottom-5 right-5 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-on-navy/40 bg-forest-deep/50 text-on-navy backdrop-blur transition-colors hover:border-gold hover:text-gold"
        >
          {playing ? (
            <Pause className="h-4 w-4" aria-hidden />
          ) : (
            <Play className="h-4 w-4" aria-hidden />
          )}
        </button>
      )}
    </section>
  );
}
