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
import {
  achievementInput,
  achievementTypes,
  achievementStages,
  isCertificate,
  type AchievementInput,
  type AdminAchievement,
} from "@/lib/achievement-editor";
const statuses = { draft: "Qoralama", published: "E’lon qilingan", archived: "Arxiv" };
const blank = (): AchievementInput => ({
  studentName: "",
  classAtAchievement: "",
  type: "Fan olimpiadasi",
  title: "",
  subject: "",
  stage: "Tuman",
  result: "",
  achievementDate: new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Tashkent" }),
  teacherName: null,
  certificateImage: null,
  status: "draft",
  version: 0,
});
const textFields = [
  ["studentName", "O‘quvchi ismi", 150],
  ["classAtAchievement", "Yutuq paytidagi sinfi", 30],
  ["title", "Yutuq nomi", 200],
  ["subject", "Fan", 100],
  ["result", "Natija yoki ball", 200],
] as const;
export function AchievementManager({ onExpired }: { onExpired: () => void }) {
  const router = useRouter();
  const [items, setItems] = useState<AdminAchievement[]>([]);
  const [offset, setOffset] = useState(0);
  const [more, setMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<AchievementInput>(blank);
  const [dirty, setDirty] = useState(false);
  const api = useAdminApi(onExpired);
  const load = useCallback(
    async (page: number) => {
      setLoading(true);
      try {
        const result = await api<AdminAchievement[]>("/api/admin/achievements?offset=" + page);
        setItems(result.data);
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
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  function change<K extends keyof AchievementInput>(key: K, value: AchievementInput[K]) {
    setForm((p) => ({ ...p, [key]: value }));
    setDirty(true);
    setNotice("");
  }
  function open(item: AdminAchievement | null) {
    if (dirty && !window.confirm("Saqlanmagan o‘zgarishlardan voz kechasizmi?")) return;
    setEditing(item?.id ?? null);
    setForm(
      item
        ? {
            studentName: item.studentName,
            classAtAchievement: item.classAtAchievement,
            type: item.type,
            title: item.title,
            subject: item.subject,
            stage: item.stage,
            result: item.result,
            achievementDate: item.achievementDate,
            teacherName: item.teacherName ?? null,
            certificateImage: item.certificateImage,
            status: item.status,
            version: item.version,
          }
        : blank(),
    );
    setDirty(false);
    setError("");
    setNotice("");
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");
    const parsed = achievementInput.safeParse(form);
    if (!parsed.success) {
      setError(
        "O‘quvchi, sinf, fan, sana, natija va bosqichni tekshiring. Rasm uchun HTTPS havola kiriting.",
      );
      return;
    }
    setBusy(true);
    try {
      const result = await api<AdminAchievement>(
        "/api/admin/achievements" + (editing ? "/" + encodeURIComponent(editing) : ""),
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
      await router.invalidate();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Saqlanmadi.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.4fr]">
      <section aria-label="Yutuqlar ro‘yxati">
        <AdminSectionHeader
          title="Yutuqlar"
          action={
            <button
              className="btn btn-outline"
              disabled={busy || uploading}
              onClick={() => open(null)}
            >
              Yangi yutuq
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
                  <strong className="block">{item.studentName}</strong>
                  <span className="mt-1 block text-sm">
                    {item.title} · {item.result}
                  </span>
                  <span className="mt-2 block text-sm text-muted-foreground">
                    {item.achievementDate} · {statuses[item.status]}
                  </span>
                </AdminListItem>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-5 text-muted-foreground">
            Hozircha yutuq yo‘q. Birinchi natijani qo‘shing.
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
        <AdminFormHeading>{editing ? "Yutuqni tahrirlash" : "Yangi yutuq"}</AdminFormHeading>
        <form onSubmit={save} className="mt-5 space-y-4">
          <fieldset disabled={busy || uploading} className="space-y-4">
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
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                Yutuq turi
                <select
                  className="field mt-2"
                  value={form.type}
                  onChange={(e) => {
                    const type = e.target.value as AchievementInput["type"];
                    setForm((p) => ({
                      ...p,
                      type,
                      stage: isCertificate(type)
                        ? "Sertifikat"
                        : p.stage === "Sertifikat"
                          ? "Tuman"
                          : p.stage,
                    }));
                    setDirty(true);
                    setNotice("");
                  }}
                >
                  {achievementTypes.map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                Bosqich
                <select
                  className="field mt-2"
                  value={form.stage}
                  onChange={(e) => change("stage", e.target.value as AchievementInput["stage"])}
                >
                  {achievementStages
                    .filter((s) =>
                      isCertificate(form.type) ? s === "Sertifikat" : s !== "Sertifikat",
                    )
                    .map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                </select>
              </label>
            </div>
            <label className="block">
              Yutuq sanasi
              <input
                className="field mt-2"
                type="date"
                required
                value={form.achievementDate}
                onChange={(e) => change("achievementDate", e.target.value)}
              />
            </label>
            <label className="block">
              Tayyorlagan ustoz (ixtiyoriy)
              <input
                className="field mt-2"
                maxLength={150}
                value={form.teacherName ?? ""}
                onChange={(e) => change("teacherName", e.target.value || null)}
              />
            </label>
            <ImageUploader
              label="Sertifikat rasmini kompyuterdan yuklash"
              onExpired={onExpired}
              onBusyChange={setUploading}
              onUploaded={(urls) => change("certificateImage", urls[0] ?? null)}
            />
            <label className="block">
              Sertifikat rasmi havolasi (ixtiyoriy)
              <input
                className="field mt-2"
                type="url"
                placeholder="https://…"
                value={form.certificateImage ?? ""}
                onChange={(e) => change("certificateImage", e.target.value || null)}
              />
            </label>
            <label className="block">
              Holat
              <select
                className="field mt-2"
                value={form.status}
                onChange={(e) => change("status", e.target.value as AchievementInput["status"])}
              >
                {Object.entries(statuses).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <p className="text-sm text-muted-foreground">
              E’lon qilingan yutuqlar ommaga ko‘rinadi. Qoralama va arxiv faqat adminda qoladi.
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
