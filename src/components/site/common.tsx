import { Link } from "@tanstack/react-router";
import { ArrowRight, Inbox, Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function DemoBadge({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border border-gold bg-gold-soft px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-navy-deep", className)}>
      Namuna
    </span>
  );
}

export function SectionHeading({ eyebrow, title, intro, action }: { eyebrow: string; title: string; intro?: string; action?: { to: string; label: string } }) {
  return (
    <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-2 text-3xl font-semibold text-primary md:text-4xl">{title}</h2>
        {intro && <p className="mt-3 text-muted-foreground">{intro}</p>}
      </div>
      {action && (
        <Link to={action.to} className="group inline-flex items-center gap-2 font-semibold text-primary hover:text-gold">
          {action.label}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
        </Link>
      )}
    </div>
  );
}

export function PageHeader({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <section className="border-b bg-primary text-on-navy">
      <div className="container-site py-14 md:py-20">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold md:text-5xl">{title}</h1>
        {intro && <p className="mt-4 max-w-2xl text-on-navy-muted">{intro}</p>}
      </div>
    </section>
  );
}

export function EmptyState({ title, description, children }: { title: string; description?: string; children?: ReactNode }) {
  return (
    <div className="card-surface flex flex-col items-center px-6 py-14 text-center">
      <Inbox className="h-10 w-10 text-gold" strokeWidth={1.5} aria-hidden />
      <h3 className="mt-4 text-xl font-semibold text-primary">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>}
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}

export function LoadingState({ label = "Yuklanmoqda…" }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-16 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
      <span>{label}</span>
    </div>
  );
}

export function PendingBlock({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="card-surface p-6">
      <h3 className="text-xl font-semibold text-primary">{title}</h3>
      <p className="mt-2 text-muted-foreground">{children ?? "Ma’lumot tez orada qo‘shiladi."}</p>
    </div>
  );
}
