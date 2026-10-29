"use client";

import {
  createElement,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

/** Layout effect on the client; the plain effect keeps SSR warning-free. */
const useArmEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type From = "left" | "right" | "up";

interface RevealProps {
  children: ReactNode;
  /** Direction the content travels in from while animating. */
  from?: From | undefined;
  /** Stagger delay in milliseconds (used for card groups). */
  delay?: number | undefined;
  /** Extra classes for the wrapper. */
  className?: string | undefined;
  /** Wrapper element, defaults to a div. */
  as?: ElementType | undefined;
}

/**
 * One-shot viewport reveal driven by IntersectionObserver.
 *
 * Progressive by design: server HTML and the no-JS experience render the
 * content fully visible, and the pre-animation state is only armed in JS after
 * confirming (a) the browser supports observers, (b) the user has not asked
 * for reduced motion and (c) the block is not already on screen — so
 * above-the-fold content is never hidden while awaiting animation. Focus
 * landing inside the block and a safety timeout both force the final visible
 * state, so keyboard users can never reach invisible content even if the
 * observer never fires. Observers and listeners are cleaned up on unmount.
 */
export function Reveal({ children, from = "up", delay = 0, className, as }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [state, setState] = useState<"visible" | "armed">("visible");

  useArmEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) return; // already visible

    let revealed = false;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      setState("visible");
    };

    setState("armed");
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          reveal();
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -6% 0px" },
    );
    observer.observe(el);
    el.addEventListener("focusin", reveal, { once: true });
    const failsafe = window.setTimeout(reveal, 4000);

    return () => {
      observer.disconnect();
      el.removeEventListener("focusin", reveal);
      window.clearTimeout(failsafe);
    };
  }, []);

  return createElement(
    as ?? "div",
    {
      ref,
      "data-reveal": state,
      "data-from": from,
      style: delay ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties) : undefined,
      className: cn(className),
    },
    children,
  );
}
