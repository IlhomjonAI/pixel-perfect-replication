"use client";

import { useRef, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function AdminDeleteButton({
  name,
  disabled,
  onDelete,
}: {
  name: string;
  disabled?: boolean;
  onDelete: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const cancelRef = useRef<HTMLButtonElement>(null);
  async function remove() {
    if (deleting) return;
    setDeleting(true);
    setError("");
    try {
      await onDelete();
      setOpen(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "O‘chirilmadi. Qayta urinib ko‘ring.");
    } finally {
      setDeleting(false);
    }
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!deleting) {
          setOpen(next);
          setError("");
        }
      }}
    >
      <DialogTrigger asChild>
        <button
          type="button"
          className="btn btn-outline mt-5 border-destructive/30 text-destructive hover:bg-destructive/5"
          disabled={disabled}
        >
          <Trash2 size={16} aria-hidden />
          O‘chirish
        </button>
      </DialogTrigger>
      <DialogContent
        className="w-[calc(100%_-_2rem)] rounded-2xl"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          cancelRef.current?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle>Yozuvni o‘chirasizmi?</DialogTitle>
          <DialogDescription className="break-words leading-relaxed">
            “{name}” savatga ko‘chiriladi va saytda ko‘rinmaydi. Keyin Savat bo‘limidan tiklashingiz
            mumkin.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <p role="alert" className="rounded-xl bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </p>
        )}
        <DialogFooter className="gap-3">
          <button
            ref={cancelRef}
            type="button"
            className="btn btn-outline"
            disabled={deleting}
            onClick={() => setOpen(false)}
          >
            Bekor qilish
          </button>
          <button
            type="button"
            className="btn bg-destructive text-white hover:opacity-90"
            disabled={deleting}
            onClick={() => void remove()}
          >
            {deleting ? (
              <Loader2 size={16} className="animate-spin" aria-hidden />
            ) : (
              <Trash2 size={16} aria-hidden />
            )}
            {deleting ? "O‘chirilmoqda…" : "Ha, o‘chirish"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
