"use client";

import { useRef, useState, type ChangeEvent } from "react";
interface Props {
  label: string;
  maxFiles?: number;
  onUploaded: (urls: string[]) => void;
  onBusyChange: (busy: boolean) => void;
  onExpired: () => void;
}
export function ImageUploader({ label, maxFiles = 1, onUploaded, onBusyChange, onExpired }: Props) {
  const [busy, setBusy] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");
  const active = useRef(false);
  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";
    if (active.current || !files.length) return;
    setError("");
    setProgress("");
    if (files.length > maxFiles) {
      setError(`Ko‘pi bilan ${maxFiles} ta rasm tanlang.`);
      return;
    }
    if (
      files.some(
        (file) =>
          !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
          file.size === 0 ||
          file.size > 4 * 1024 * 1024,
      )
    ) {
      setError("JPG, PNG yoki WebP tanlang. Har bir rasm 4 MB dan oshmasin.");
      return;
    }
    active.current = true;
    setBusy(true);
    onBusyChange(true);
    const urls: string[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        setProgress(`${i + 1}/${files.length} rasm yuklanmoqda…`);
        const form = new FormData();
        form.set("file", files[i]!);
        const response = await fetch("/api/admin/uploads", {
          method: "POST",
          body: form,
          signal: AbortSignal.timeout(45000),
        });
        const result = await response.json().catch(() => null);
        if (response.status === 401) onExpired();
        if (!response.ok || typeof result?.data?.url !== "string")
          throw new Error(result?.error?.message ?? "Rasm yuklanmadi. Qayta urinib ko‘ring.");
        urls.push(result.data.url);
      }
      setProgress(`${urls.length} ta rasm yuklandi. O‘zgarishlarni saqlash tugmasini bosing.`);
    } catch (e) {
      setError(
        e instanceof DOMException && e.name === "TimeoutError"
          ? "Rasm yuklash vaqti tugadi. Qayta urinib ko‘ring."
          : e instanceof TypeError
            ? "Serverga ulanib bo‘lmadi."
            : e instanceof Error
              ? e.message
              : "Rasm yuklanmadi.",
      );
      setProgress(
        urls.length ? `${urls.length} ta rasm yuklandi. Qolganlarini qayta tanlang.` : "",
      );
    } finally {
      if (urls.length) {
        setPreviews(urls);
        onUploaded(urls);
      }
      active.current = false;
      setBusy(false);
      onBusyChange(false);
    }
  }
  return (
    <div className="rounded-xl border border-dashed border-primary/25 bg-secondary/40 p-5">
      <label className="block text-sm font-semibold text-primary">
        {label}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple={maxFiles > 1}
          disabled={busy || maxFiles < 1}
          onChange={upload}
          className="mt-3 block w-full text-sm file:mr-3 file:rounded-lg file:border file:bg-background file:px-3 file:py-2"
        />
      </label>
      <p className="mt-2 text-xs text-muted-foreground">
        JPG, PNG yoki WebP · har bir rasm 4 MB gacha
      </p>
      {previews.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {previews.map((url) => (
            <img
              key={url}
              src={url}
              alt="Yuklangan rasm"
              className="h-20 w-20 rounded-lg border bg-white object-contain"
            />
          ))}
        </div>
      )}
      {progress && (
        <p role="status" className="mt-2 text-sm">
          {progress}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
