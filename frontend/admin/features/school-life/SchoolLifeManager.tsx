"use client";

import { useUnsavedChanges } from "@admin/hooks/use-unsaved-changes";
import { AdminDeleteButton } from "@admin/components/AdminDeleteButton";
import { ImageUploader } from "@admin/components/ImageUploader";
import {
  AdminFormHeading,
  AdminListItem,
  AdminLoading,
  AdminNotice,
  AdminPager,
  AdminRefresh,
  AdminSectionHeader,
} from "@admin/components/admin-ui";
import { useAdminApi } from "@admin/hooks/use-admin-api";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  schoolLifeInput,
  lifeCategories,
  type SchoolLifeInput,
  type AdminSchoolLife,
} from "@school/contracts/school-life";
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
  const api = useAdminApi(onExpired);
  const sequence = useRef(0);
  const load = useCallback(
    async (page: number) => {
      const current = ++sequence.current;
      setLoading(true);
      setError("");
      try {
        const result = await api<AdminSchoolLife[]>("/api/admin/school-life?offset=" + page);
        if (current !== sequence.current) return;
        setItems(result.data);
        setMore(result.pagination?.hasMore ?? false);
        setOffset(page);
      } catch (e) {
        if (current === sequence.current)
          setError(e instanceof Error ? e.message : "Serverga ulanib bo‘lmadi.");
      } finally {
        if (current === sequence.current) setLoading(false);
      }
    },
    [api],
  );
  useEffect(() => {
    void load(0);
    return () => {
      sequence.current += 1;
    };
  }, [load]);
  useUnsavedChanges(dirty);
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
      const result = await api<AdminSchoolLife>(
        "/api/admin/school-life" + (editing ? "/" + encodeURIComponent(editing) : ""),
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        },
      );
      const saved = result.data;
      setEditing(saved.id);
      setForm({ ...parsed.data, version: saved.version });
      setDirty(false);
      setNotice("Saqlandi: " + statuses[saved.status] + ".");
      await load(offset);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Saqlanmadi.");
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    if (!editing || busy || uploading) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await api(
        "/api/admin/school-life/" + encodeURIComponent(editing) + "?version=" + form.version,
        { method: "DELETE" },
      );
      setEditing(null);
      setForm(blank());
      setDirty(false);
      setGalleryText("");
      setNotice("Yozuv o‘chirildi.");
      await load(offset > 0 && items.length === 1 ? Math.max(0, offset - 20) : offset);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.4fr]">
      <section aria-label="Maktab hayoti ro‘yxati">
        <AdminSectionHeader
          title="Maktab hayoti"
          action={
            <button
              className="btn btn-outline"
              disabled={busy || uploading}
              onClick={() => open(null)}
            >
              Yangi faoliyat
            </button>
          }
        />
        <AdminRefresh
          disabled={busy || uploading || loading}
          onClick={() => {
            setError("");
            void load(offset);
          }}
        />
        {loading ? (
          <AdminLoading />
        ) : items.length ? (
          <ul className="mt-5 space-y-3">
            {items.map((item) => (
              <li key={item.id}>
                <AdminListItem
                  active={editing === item.id}
                  disabled={busy || uploading}
                  onClick={() => open(item)}
                >
                  <strong className="block">{item.title}</strong>
                  <span className="mt-2 block text-sm text-muted-foreground">
                    {item.category} · {statuses[item.status]}
                  </span>
                </AdminListItem>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-5 text-muted-foreground">
            Hozircha faoliyat yo‘q. Birinchi yozuvni qo‘shing.
          </p>
        )}
        <AdminPager
          offset={offset}
          hasMore={more}
          disabled={loading || busy || uploading}
          onPage={(page) => void load(page)}
        />
      </section>
      <section>
        <AdminFormHeading>{editing ? "Faoliyatni tahrirlash" : "Yangi faoliyat"}</AdminFormHeading>
        <form onSubmit={save} className="mt-5 space-y-4">
          <fieldset disabled={busy || uploading} className="space-y-4">
            <label className="block">
              Sarlavha
              <input
                className="field mt-2"
                required
                minLength={3}
                maxLength={200}
                placeholder="Masalan: Maktabimizda ilm-fan haftaligi"
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
                placeholder="Tadbir qayerda, qachon va qanday o‘tganini yozing…"
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
        {editing && (
          <AdminDeleteButton
            name={form.title}
            disabled={busy || uploading || loading}
            onDelete={remove}
          />
        )}
        <AdminNotice notice={notice} error={error} />
      </section>
    </div>
  );
}
