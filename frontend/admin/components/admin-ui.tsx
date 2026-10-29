"use client";

import { type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminCard({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("card-surface p-5 md:p-6", className)}>{children}</div>;
}

export function AdminSectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="font-display text-2xl text-primary">{title}</h2>
      {action}
    </div>
  );
}

export function AdminFormHeading({ children }: { children: ReactNode }) {
  return <h2 className="font-display text-2xl text-primary">{children}</h2>;
}

export function AdminListItem({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border p-4 text-left text-foreground transition-colors",
        active
          ? "border-primary bg-secondary"
          : "border-border bg-card hover:border-input hover:bg-secondary",
      )}
    >
      {children}
    </button>
  );
}

export function AdminRefresh({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="mt-3 text-sm font-semibold text-primary underline underline-offset-4 hover:text-gold-ink"
    >
      Ro‘yxatni yangilash
    </button>
  );
}

export function AdminPager({
  offset,
  hasMore,
  disabled,
  onPage,
}: {
  offset: number;
  hasMore: boolean;
  disabled?: boolean;
  onPage: (offset: number) => void;
}) {
  if (offset === 0 && !hasMore) return null;
  return (
    <div className="mt-4 flex gap-3">
      <button
        type="button"
        className="btn btn-outline"
        disabled={disabled || offset === 0}
        onClick={() => onPage(Math.max(0, offset - 20))}
      >
        Oldingi
      </button>
      <button
        type="button"
        className="btn btn-outline"
        disabled={disabled || !hasMore}
        onClick={() => onPage(offset + 20)}
      >
        Keyingi
      </button>
    </div>
  );
}

export function AdminLoading({ label = "Yuklanmoqda…" }: { label?: string }) {
  return (
    <p role="status" className="mt-5 flex items-center gap-2 text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      {label}
    </p>
  );
}

export function AdminNotice({ notice, error }: { notice?: string; error?: string }) {
  return (
    <>
      {notice && (
        <p role="status" className="mt-4 text-sm font-medium text-gold-ink">
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {error}
        </p>
      )}
    </>
  );
}
