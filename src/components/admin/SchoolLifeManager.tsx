import { ImageUploader } from "@/components/admin/ImageUploader";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "@tanstack/react-router";
import {
  schoolLifeInput,
  lifeCategories,
  type SchoolLifeInput,
  type AdminSchoolLife,
} from "@/lib/school-life-editor";
const statuses = { draft: "Qoralama", published: "E’lon qilingan", archived: "Arxiv" };
const blank = (): SchoolLifeInput => ({
  title: "",
  description: "",
  category: "Faoliyat",
  eventDate: null,
  image: null,
  gallery: [],
  status: "draft",
  version: 0,
});
export function SchoolLifeManager({ onExpired }: { onExpired: () => void }) {
  const router = useRouter();
  const [items, setItems] = useState<AdminSchoolLife[]>([]);
  const [offset, setOffset] = useState(0);
  const [more, setMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<SchoolLifeInput>(blank);
  const [dirty, setDirty] = useState(false);
  const [galleryText, setGalleryText] = useState("");
  const api = useCallback(
    async (path: string, init?: RequestInit) => {
      const r = await fetch(path, { cache: "no-store", ...init });
      const data = await r.json();
      if (r.status === 401) {
        onExpired();
        throw new Error("Sessiya tugagan. Qayta kiring.");
      }
      if (!r.ok) throw new Error(data.error?.message ?? "So‘rov bajarilmadi.");
      return data;
    },
    [onExpired],
  );
  const load = useCallback(
    async (page: number) => {
      setLoading(true);
      try {
        const result = await api("/api/admin/school-life?offset=" + page);
        setItems(result.data);
        setMore(result.pagination.hasMore);
        setOffset(page);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Serverga ulanib bo‘lmadi.");
      } finally {
        setLoading(false);
      }
    },
    [api],
  );
  useEffect(() => {
    void load(0);
  }, [load]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  function change<K extends keyof SchoolLifeInput>(key: K, value: SchoolLifeInput[K]) {
    setForm((p) => ({ ...p, [key]: value }));
    setDirty(true);
    setNotice("");
  }
  function open(item: AdminSchoolLife | null) {
    if (dirty && !window.confirm("Saqlanmagan o‘zgarishlardan voz kechasizmi?")) return;
    setEditing(item?.id ?? null);
    setForm(
      item
        ? {
            title: item.title,
            description: item.description,
            category: item.category as SchoolLifeInput["category"],
            eventDate: item.eventDate ?? null,
            image: item.image,
            gallery: item.gallery ?? [],
            status: item.status,
            version: item.version,
          }
        : blank(),
    );
    setGalleryText(item?.gallery?.join("\n") ?? "");
    setDirty(false);
    setError("");
    setNotice("");
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");
    const parsed = schoolLifeInput.safeParse({
      ...form,
      gallery: galleryText
        .split("\n")
        .map((v) => v.trim())
        .filter(Boolean),
    });
    if (!parsed.success) {
      setError("Sarlavha, tavsif, sana va turini tekshiring. Rasm uchun HTTPS havola kiriting.");
      return;
    }
    setBusy(true);
    try {
      const result = await api(
        "/api/admin/school-life" + (editing ? "/" + encodeURIComponent(editing) : ""),
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        },
      );
      const saved: AdminSchoolLife = result.data;
      setEditing(saved.id);
      setForm({ ...parsed.data, version: saved.version });
      setDirty(false);
      setNotice("Saqlandi: " + statuses[saved.status] + ".");
      await load(offset);
      await router.invalidate();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Saqlanmadi.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.4fr]">
      <section aria-label="Maktab hayoti ro‘yxati">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold text-primary">Maktab hayoti</h2>
          <button
            className="btn btn-outline"
            disabled={busy || uploading}
            onClick={() => open(null)}
          >
            Yangi faoliyat
          </button>
        </div>
        <button
          className="mt-3 text-sm underline"
          disabled={busy || uploading || loading}
          onClick={() => {
            setError("");
            void load(offset);
          }}
        >
          Ro‘yxatni yangilash
        </button>
        {loading ? (
          <p role="status" className="mt-5">
            Yuklanmoqda…
          </p>
        ) : items.length ? (
          <ul className="mt-5 space-y-3">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  disabled={busy || uploading}
                  onClick={() => open(item)}
                  className={`w-full rounded-xl border p-4 text-left ${editing === item.id ? "border-primary bg-muted" : "bg-background"}`}
                >
                  <strong className="block">{item.title}</strong>
                  <span className="mt-2 block text-sm text-muted-foreground">
                    {item.category} · {statuses[item.status]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-5 text-muted-foreground">
            Hozircha faoliyat yo‘q. Birinchi yozuvni qo‘shing.
          </p>
        )}
        <div className="mt-4 flex gap-3">
          <button
            className="btn btn-outline"
            disabled={loading || busy || uploading || offset === 0}
            onClick={() => void load(Math.max(0, offset - 20))}
          >
            Oldingi
          </button>
          <button
            className="btn btn-outline"
            disabled={loading || busy || uploading || !more}
            onClick={() => void load(offset + 20)}
          >
            Keyingi
          </button>
        </div>
      </section>
      <section>
        <h2 className="text-2xl font-semibold text-primary">
          {editing ? "Faoliyatni tahrirlash" : "Yangi faoliyat"}
        </h2>
        <form onSubmit={save} className="mt-5 space-y-4">
          <fieldset disabled={busy || uploading} className="space-y-4">
            <label className="block">
              Sarlavha
              <input
                className="field mt-2"
                required
                minLength={3}
                maxLength={200}
                value={form.title}
                onChange={(e) => change("title", e.target.value)}
              />
            </label>
            <label className="block">
              Turi
              <select
                className="field mt-2"
                value={form.category}
                onChange={(e) => change("category", e.target.value as SchoolLifeInput["category"])}
              >
                {lifeCategories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>
            <label className="block">
              Sana (ixtiyoriy)
              <input
                className="field mt-2"
                type="date"
                value={form.eventDate ?? ""}
                onChange={(e) => change("eventDate", e.target.value || null)}
              />
            </label>
            <label className="block">
              Tavsif
              <textarea
                className="field mt-2"
                required
                minLength={10}
                maxLength={5000}
                rows={6}
                value={form.description}
                onChange={(e) => change("description", e.target.value)}
              />
            </label>
            <ImageUploader
              label="Muqova rasmini kompyuterdan yuklash"
              onExpired={onExpired}
              onBusyChange={setUploading}
              onUploaded={(urls) => change("image", urls[0] ?? null)}
            />
            <label className="block">
              Muqova rasmi havolasi
              <input
                className="field mt-2"
                type="url"
                placeholder="https://…"
                value={form.image ?? ""}
                onChange={(e) => change("image", e.target.value || null)}
              />
            </label>
            <ImageUploader
              label="Galereya rasmlarini yuklash"
              maxFiles={Math.max(0, 20 - galleryText.split("\n").filter((v) => v.trim()).length)}
              onExpired={onExpired}
              onBusyChange={setUploading}
              onUploaded={(urls) => {
                setGalleryText((current) => [current.trim(), ...urls].filter(Boolean).join("\n"));
                setDirty(true);
                setNotice("");
              }}
            />
            <label className="block">
              Galereya havolalari
              <textarea
                className="field mt-2"
                rows={4}
                placeholder="Har qatorda bittadan HTTPS havola, ko‘pi bilan 20 ta"
                value={galleryText}
                onChange={(e) => {
                  setGalleryText(e.target.value);
                  setDirty(true);
                  setNotice("");
                }}
              />
            </label>
            <label className="block">
              Holat
              <select
                className="field mt-2"
                value={form.status}
                onChange={(e) => change("status", e.target.value as SchoolLifeInput["status"])}
              >
                {Object.entries(statuses).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <p className="text-sm text-muted-foreground">
              E’lon qilingan faoliyatlar ommaga ko‘rinadi. Qoralama va arxiv faqat adminda qoladi.
            </p>
            <button className="btn btn-primary" type="submit">
              {busy ? "Saqlanmoqda…" : "Saqlash"}
            </button>
          </fieldset>
        </form>
        {notice && (
          <p role="status" className="mt-4 text-primary">
            {notice}
          </p>
        )}
        {error && (
          <p role="alert" className="mt-4 text-destructive">
            {error}
          </p>
        )}
      </section>
    </div>
  );
}
