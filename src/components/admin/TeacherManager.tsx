import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "@tanstack/react-router";
import { teacherInput, type TeacherInput, type AdminTeacher } from "@/lib/teacher-editor";
const statuses = { draft: "Qoralama", published: "E’lon qilingan", archived: "Arxiv" };
const blank = (): TeacherInput => ({
  name: "",
  photo: null,
  subject: "",
  qualification: "",
  education: "",
  experience: "",
  biography: "",
  certificates: [],
  certificateImages: [],
  status: "draft",
  version: 0,
});
const textFields = [
  ["name", "Ustoz ismi", 150],
  ["subject", "Fan", 100],
  ["qualification", "Malaka toifasi", 200],
  ["education", "Ta’lim", 500],
  ["experience", "Ish tajribasi", 200],
] as const;
export function TeacherManager({ onExpired }: { onExpired: () => void }) {
  const router = useRouter();
  const [items, setItems] = useState<AdminTeacher[]>([]);
  const [offset, setOffset] = useState(0);
  const [more, setMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<TeacherInput>(blank);
  const [dirty, setDirty] = useState(false);
  const [certificatesText, setCertificatesText] = useState("");
  const [imagesText, setImagesText] = useState("");
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
        const result = await api("/api/admin/teachers?offset=" + page);
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
  function change<K extends keyof TeacherInput>(key: K, value: TeacherInput[K]) {
    setForm((p) => ({ ...p, [key]: value }));
    setDirty(true);
    setNotice("");
  }
  function open(item: AdminTeacher | null) {
    if (dirty && !window.confirm("Saqlanmagan o‘zgarishlardan voz kechasizmi?")) return;
    setEditing(item?.slug ?? null);
    setForm(
      item
        ? {
            name: item.name,
            photo: item.photo,
            subject: item.subject,
            qualification: item.qualification,
            education: item.education,
            experience: item.experience,
            biography: item.biography,
            certificates: item.certificates,
            certificateImages: item.certificateImages ?? [],
            status: item.status,
            version: item.version,
          }
        : blank(),
    );
    setCertificatesText(item?.certificates.join("\n") ?? "");
    setImagesText(item?.certificateImages?.join("\n") ?? "");
    setDirty(false);
    setError("");
    setNotice("");
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");
    const parsed = teacherInput.safeParse({
      ...form,
      certificates: certificatesText
        .split("\n")
        .map((v) => v.trim())
        .filter(Boolean),
      certificateImages: imagesText
        .split("\n")
        .map((v) => v.trim())
        .filter(Boolean),
    });
    if (!parsed.success) {
      setError(
        "Ism, fan, malaka, ta’lim, tajriba va tarjimai holni tekshiring. Rasm uchun HTTPS havola kiriting.",
      );
      return;
    }
    setBusy(true);
    try {
      const result = await api(
        "/api/admin/teachers" + (editing ? "/" + encodeURIComponent(editing) : ""),
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        },
      );
      const saved: AdminTeacher = result.data;
      setEditing(saved.slug);
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
      <section aria-label="Ustozlar ro‘yxati">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold text-primary">Ustozlar</h2>
          <button className="btn btn-outline" disabled={busy} onClick={() => open(null)}>
            Yangi ustoz
          </button>
        </div>
        <button
          className="mt-3 text-sm underline"
          disabled={busy || loading}
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
              <li key={item.slug}>
                <button
                  disabled={busy}
                  onClick={() => open(item)}
                  className={`w-full rounded-xl border p-4 text-left ${editing === item.slug ? "border-primary bg-muted" : "bg-background"}`}
                >
                  <strong className="block">{item.name}</strong>
                  <span className="mt-2 block text-sm text-muted-foreground">
                    {item.subject} · {statuses[item.status]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-5 text-muted-foreground">
            Hozircha ustoz yo‘q. Birinchi profilni qo‘shing.
          </p>
        )}
        <div className="mt-4 flex gap-3">
          <button
            className="btn btn-outline"
            disabled={loading || busy || offset === 0}
            onClick={() => void load(Math.max(0, offset - 20))}
          >
            Oldingi
          </button>
          <button
            className="btn btn-outline"
            disabled={loading || busy || !more}
            onClick={() => void load(offset + 20)}
          >
            Keyingi
          </button>
        </div>
      </section>
      <section>
        <h2 className="text-2xl font-semibold text-primary">
          {editing ? "Ustozni tahrirlash" : "Yangi ustoz"}
        </h2>
        <form onSubmit={save} className="mt-5 space-y-4">
          <fieldset disabled={busy} className="space-y-4">
            {textFields.map(([key, label, max]) => (
              <label className="block" key={key}>
                {label}
                <input
                  className="field mt-2"
                  required
                  maxLength={max}
                  value={form[key]}
                  onChange={(e) => change(key, e.target.value)}
                />
              </label>
            ))}
            <label className="block">
              Tarjimai hol
              <textarea
                className="field mt-2"
                required
                minLength={10}
                maxLength={5000}
                rows={6}
                value={form.biography}
                onChange={(e) => change("biography", e.target.value)}
              />
            </label>
            <label className="block">
              Ustoz fotosurati havolasi
              <input
                className="field mt-2"
                type="url"
                placeholder="https://…"
                value={form.photo ?? ""}
                onChange={(e) => change("photo", e.target.value || null)}
              />
            </label>
            <label className="block">
              Sertifikat nomlari
              <textarea
                className="field mt-2"
                rows={3}
                placeholder="Har qatorda bittadan sertifikat nomi"
                value={certificatesText}
                onChange={(e) => {
                  setCertificatesText(e.target.value);
                  setDirty(true);
                  setNotice("");
                }}
              />
            </label>
            <label className="block">
              Sertifikat rasmlari havolalari
              <textarea
                className="field mt-2"
                rows={3}
                placeholder="Har qatorda bittadan HTTPS havola"
                value={imagesText}
                onChange={(e) => {
                  setImagesText(e.target.value);
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
                onChange={(e) => change("status", e.target.value as TeacherInput["status"])}
              >
                {Object.entries(statuses).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <p className="text-sm text-muted-foreground">
              E’lon qilingan profillar ommaga ko‘rinadi. Qoralama va arxiv faqat adminda qoladi.
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
