"use client";
import { useCallback, useEffect, useState } from "react";
import { useAdminApi } from "@admin/hooks/use-admin-api";
type Entry = { id: number; resource: string; label: string; deleted_at: string };
const labels: Record<string, string> = {
  posts: "Yangilik",
  achievements: "Yutuq",
  teachers: "Ustoz",
  messages: "Murojaat",
  "school-life": "Maktab hayoti",
};
export function TrashManager({ onExpired }: { onExpired: () => void }) {
  const api = useAdminApi(onExpired);
  const [items, setItems] = useState<Entry[]>([]);
  const [offset, setOffset] = useState(0);
  const [more, setMore] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const load = useCallback(async () => {
    const result = await api<Entry[]>(`/api/admin/trash?offset=${offset}`);
    setItems(result.data);
    setMore(!!result.pagination?.hasMore);
  }, [api, offset]);
  useEffect(() => {
    let active = true;
    setBusy(true);
    load()
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
    };
  }, [load]);
  async function restore(id: number) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await api(`/api/admin/trash/${id}/restore`, { method: "POST" });
      setNotice("Yozuv tiklandi. Tegishli bo‘limdagi ro‘yxatni yangilang.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Tiklab bo‘lmadi.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="mt-6 space-y-4">
      <button
        className="btn btn-outline"
        disabled={busy}
        onClick={() => {
          setBusy(true);
          load()
            .catch((e) => setError(e.message))
            .finally(() => setBusy(false));
        }}
      >
        Yangilash
      </button>
      {error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
      {notice && <p role="status">{notice}</p>}
      {!items.length && <p>{busy ? "Yuklanmoqda…" : "Savat bo‘sh."}</p>}
      {items.map((item) => (
        <div
          key={item.id}
          className="flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4"
        >
          <div className="min-w-0">
            <p className="break-words font-semibold">{item.label}</p>
            <p className="text-sm text-muted-foreground">
              {labels[item.resource]} · {item.deleted_at}
            </p>
          </div>
          <button className="btn btn-outline" disabled={busy} onClick={() => void restore(item.id)}>
            Tiklash
          </button>
        </div>
      ))}
      <div className="flex gap-3">
        <button
          className="btn btn-outline"
          disabled={busy || offset === 0}
          onClick={() => setOffset(Math.max(0, offset - 20))}
        >
          Oldingi
        </button>
        <button
          className="btn btn-outline"
          disabled={busy || !more}
          onClick={() => setOffset(offset + 20)}
        >
          Keyingi
        </button>
      </div>
    </div>
  );
}
