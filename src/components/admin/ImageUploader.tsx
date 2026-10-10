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
          file.size > 5 * 1024 * 1024,
      )
    ) {
      setError("JPG, PNG yoki WebP tanlang. Har bir rasm 5 MB dan oshmasin.");
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
        const response = await fetch("/api/admin/uploads", { method: "POST", body: form });
        const result = await response.json().catch(() => null);
        if (response.status === 401) onExpired();
        if (!response.ok || typeof result?.data?.url !== "string")
          throw new Error(result?.error?.message ?? "Rasm yuklanmadi. Qayta urinib ko‘ring.");
        urls.push(result.data.url);
      }
      setProgress(`${urls.length} ta rasm yuklandi. Profil yoki postni saqlang.`);
    } catch (e) {
      setError(
        e instanceof TypeError
          ? "Serverga ulanib bo‘lmadi."
          : e instanceof Error
            ? e.message
            : "Rasm yuklanmadi.",
      );
      setProgress(
        urls.length ? `${urls.length} ta rasm yuklandi. Qolganlarini qayta tanlang.` : "",
      );
    } finally {
      if (urls.length) onUploaded(urls);
      active.current = false;
      setBusy(false);
      onBusyChange(false);
    }
  }
  return (
    <div className="rounded-xl border border-dashed p-4">
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
        JPG, PNG yoki WebP · har bir rasm 5 MB gacha
      </p>
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
