"use client";

import Link from "next/link";
import { ArrowRight, Inbox, Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { HeroBackdrop } from "@/components/site/HeroBackdrop";
import { cn } from "@/lib/utils";

export function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-gold bg-gold-soft px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-navy-deep",
        className,
      )}
    >
      Namuna
    </span>
  );
}

export function Pill({
  children,
  tone = "solid",
  className,
}: {
  children: ReactNode;
  tone?: "solid" | "soft" | "outline";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        tone === "solid" && "bg-primary text-primary-foreground",
        tone === "soft" && "bg-accent text-accent-foreground",
        tone === "outline" && "border border-border bg-card text-forest",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("eyebrow flex items-center gap-3", className)}>
      <span className="h-px w-7 shrink-0 bg-gold" aria-hidden />
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  action,
  align = "start",
  className,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  action?: { to: string; label: string };
  align?: "start" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-10 flex flex-col gap-5 md:mb-12 md:flex-row md:items-end md:justify-between",
        align === "center" && "items-center text-center md:flex-col md:items-center md:text-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        <Eyebrow className={align === "center" ? "justify-center" : ""}>{eyebrow}</Eyebrow>
        <h2 className="mt-3 text-[clamp(1.75rem,3.4vw,2.75rem)] font-medium leading-[1.1] text-primary">
          {title}
        </h2>
        {intro && (
          <p className={cn("mt-3 text-base leading-relaxed text-muted-foreground md:text-lg")}>
            {intro}
          </p>
        )}
      </div>
      {action && (
        <Link
          href={action.to}
          className="group inline-flex min-h-11 shrink-0 items-center gap-2 font-semibold text-primary transition-colors hover:text-gold-ink"
        >
          {action.label}
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-1"
            aria-hidden
          />
        </Link>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  children,
  framed = true,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
  framed?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center overflow-hidden px-6 py-14 text-center",
        framed && "card-surface",
      )}
    >
      <HeroBackdrop className="pointer-events-none absolute inset-0 h-full w-full text-gold opacity-40" />
      <div className="relative flex flex-col items-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold bg-gold-soft">
          <Inbox className="h-5 w-5 text-gold-ink" strokeWidth={1.5} aria-hidden />
        </span>
        <h3 className="mt-5 font-display text-xl text-primary">{title}</h3>
        {description && (
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </div>
  );
}

export function LoadingState({ label = "Yuklanmoqda…" }: { label?: string }) {
  return (
    <div
      role="status"
      className="flex items-center justify-center gap-3 py-20 text-muted-foreground"
    >
      <Loader2 className="h-5 w-5 animate-spin text-gold-ink" aria-hidden />
      <span>{label}</span>
    </div>
  );
}

export function PendingBlock({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="card-surface flex flex-col p-6">
      <span className="divider-gold" aria-hidden />
      <h3 className="mt-4 font-display text-xl text-primary">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {children ?? "Ma’lumot tez orada qo‘shiladi."}
      </p>
    </div>
  );
}
