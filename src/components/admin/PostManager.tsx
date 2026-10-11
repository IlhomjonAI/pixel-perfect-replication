import { ImageUploader } from "@/components/admin/ImageUploader";
import {
  AdminFormHeading,
  AdminListItem,
  AdminLoading,
  AdminNotice,
  AdminPager,
  AdminRefresh,
  AdminSectionHeader,
} from "@/components/admin/admin-ui";
import { useAdminApi } from "@/components/admin/use-admin-api";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "@tanstack/react-router";
import { type AdminPost, type PostInput, postInput } from "@/lib/post-editor";
const labels = { draft: "Qoralama", published: "E’lon qilingan", archived: "Arxiv" };
const blank = (): PostInput => ({
  title: "",
  category: "Yangilik",
  date: new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Tashkent" }),
  excerpt: "",
  body: [],
  coverImage: null,
  gallery: [],
  status: "draft",
  version: 0,
});
export function PostManager({ onExpired }: { onExpired: () => void }) {
  const router = useRouter();
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [offset, setOffset] = useState(0);
  const [more, setMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<PostInput>(blank);
  const [body, setBody] = useState("");
  const [gallery, setGallery] = useState("");
  const [dirty, setDirty] = useState(false);
  const api = useAdminApi(onExpired);
  const load = useCallback(
    async (page: number) => {
      setLoading(true);
      try {
        const result = await api<AdminPost[]>("/api/admin/posts?offset=" + page);
        setPosts(result.data);
        setMore(result.pagination?.hasMore ?? false);
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
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  function change<K extends keyof PostInput>(key: K, value: PostInput[K]) {
    setForm((p) => ({ ...p, [key]: value }));
    setDirty(true);
    setNotice("");
  }
  function open(post: AdminPost | null) {
    if (dirty && !window.confirm("Saqlanmagan o‘zgarishlardan voz kechasizmi?")) return;
    setEditing(post?.slug ?? null);
    setForm(
      post
        ? {
            title: post.title,
            category: post.category,
            date: post.date,
            excerpt: post.excerpt,
            body: post.body,
            coverImage: post.coverImage,
            gallery: post.gallery.filter((v): v is string => v !== null),
            status: post.status,
            version: post.version,
          }
        : blank(),
    );
    setBody(post?.body.join("\n\n") ?? "");
    setGallery(post?.gallery.filter(Boolean).join("\n") ?? "");
    setDirty(false);
    setError("");
    setNotice("");
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");
    const parsed = postInput.safeParse({
      ...form,
      body: body
        .split(/\n\s*\n/)
        .map((v) => v.trim())
        .filter(Boolean),
      gallery: gallery
        .split("\n")
        .map((v) => v.trim())
        .filter(Boolean),
    });
    if (!parsed.success) {
      setError(
        "Sarlavha va izoh kamida 3 belgi bo‘lsin. Matn, sana va HTTPS rasm havolalarini tekshiring.",
      );
      return;
    }
    setBusy(true);
    try {
      const result = await api<AdminPost>(
        "/api/admin/posts" + (editing ? "/" + encodeURIComponent(editing) : ""),
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        },
      );
      const saved = result.data;
      setEditing(saved.slug);
      setForm({ ...parsed.data, version: saved.version });
      setDirty(false);
      setNotice("Saqlandi: " + labels[saved.status] + ".");
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
      <section aria-label="Yangiliklar ro‘yxati">
        <AdminSectionHeader
          title="Yangiliklar"
          action={
            <button
              className="btn btn-outline"
              disabled={busy || uploading}
              onClick={() => open(null)}
            >
              Yangi post
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
        ) : posts.length ? (
          <ul className="mt-5 space-y-3">
            {posts.map((p) => (
              <li key={p.slug}>
                <AdminListItem
                  active={editing === p.slug}
                  disabled={busy || uploading}
                  onClick={() => open(p)}
                >
                  <strong className="block">{p.title}</strong>
                  <span className="mt-2 block text-sm text-muted-foreground">
                    {p.date} · {labels[p.status]}
                  </span>
                </AdminListItem>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-5 text-muted-foreground">
            Hozircha post yo‘q. Birinchi yangilikni yarating.
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
        <AdminFormHeading>{editing ? "Postni tahrirlash" : "Yangi post"}</AdminFormHeading>
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
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                Turkum
                <select
                  className="field mt-2"
                  value={form.category}
                  onChange={(e) => change("category", e.target.value as PostInput["category"])}
                >
                  {["Yangilik", "Tadbir", "E’lon"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                Sana
                <input
                  className="field mt-2"
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => change("date", e.target.value)}
                />
              </label>
            </div>
            <label className="block">
              Qisqa izoh
              <textarea
                className="field mt-2"
                required
                minLength={3}
                maxLength={600}
                rows={3}
                value={form.excerpt}
                onChange={(e) => change("excerpt", e.target.value)}
              />
            </label>
            <label className="block">
              Asosiy matn
              <textarea
                className="field mt-2"
                required
                rows={10}
                value={body}
                onChange={(e) => {
                  setBody(e.target.value);
                  setDirty(true);
                }}
              />
              <span className="mt-1 block text-sm text-muted-foreground">
                Abzaslar orasida bo‘sh qator qoldiring.
              </span>
            </label>
            <ImageUploader
              label="Muqova rasmini kompyuterdan yuklash"
              onExpired={onExpired}
              onBusyChange={setUploading}
              onUploaded={(urls) => change("coverImage", urls[0] ?? null)}
            />
            <label className="block">
              Muqova rasmi havolasi
              <input
                className="field mt-2"
                type="url"
                placeholder="https://…"
                value={form.coverImage ?? ""}
                onChange={(e) => change("coverImage", e.target.value || null)}
              />
            </label>
            <ImageUploader
              label="Galereya rasmlarini yuklash"
              maxFiles={Math.max(0, 10 - gallery.split("\n").filter((v) => v.trim()).length)}
              onExpired={onExpired}
              onBusyChange={setUploading}
              onUploaded={(urls) => {
                setGallery((current) => [current.trim(), ...urls].filter(Boolean).join("\n"));
                setDirty(true);
                setNotice("");
              }}
            />
            <label className="block">
              Galereya rasmlari
              <textarea
                className="field mt-2"
                rows={3}
                placeholder="Har qatorda bittadan HTTPS havola"
                value={gallery}
                onChange={(e) => {
                  setGallery(e.target.value);
                  setDirty(true);
                }}
              />
            </label>
            <label className="block">
              Holat
              <select
                className="field mt-2"
                value={form.status}
                onChange={(e) => change("status", e.target.value as PostInput["status"])}
              >
                {Object.entries(labels).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <p className="text-sm text-muted-foreground">
              Qoralama va arxiv ommaga ko‘rinmaydi. E’lon qilingan post saytda chiqadi.
            </p>
            <button className="btn btn-primary" type="submit">
              {busy ? "Saqlanmoqda…" : "Saqlash"}
            </button>
          </fieldset>
        </form>
        <AdminNotice notice={notice} error={error} />
      </section>
    </div>
  );
}
