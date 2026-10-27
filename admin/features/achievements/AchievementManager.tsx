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
  achievementInput,
  achievementTypes,
  achievementStages,
  isCertificate,
  type AchievementInput,
  type AdminAchievement,
} from "@backend/contracts/achievement";
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
const placeholders = {
  studentName: "Masalan: Ali Valiyev",
  title: "Masalan: Respublika fan olimpiadasi",
  subject: "Masalan: Matematika yoki Ingliz tili",
  result: "Masalan: 1-o‘rin, IELTS 7.5 yoki 95 ball",
};
const textFields = [
  ["studentName", "O‘quvchi ismi", 150],
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
  const sequence = useRef(0);
  const load = useCallback(
    async (page: number) => {
      const current = ++sequence.current;
      setLoading(true);
      setError("");
      try {
        const result = await api<AdminAchievement[]>("/api/admin/achievements?offset=" + page);
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
        "/api/admin/achievements/" + encodeURIComponent(editing) + "?version=" + form.version,
        { method: "DELETE" },
      );
      setEditing(null);
      setForm(blank());
      setDirty(false);
      setNotice("Yozuv o‘chirildi.");
      await load(offset > 0 && items.length === 1 ? Math.max(0, offset - 20) : offset);
      router.refresh();
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
                  placeholder={placeholders[key]}
                  value={form[key]}
                  onChange={(e) => change(key, e.target.value)}
                />
              </label>
            ))}
            <label className="block">
              Yutuq paytidagi sinfi *
              <select
                className="field mt-2"
                required
                value={form.classAtAchievement}
                onChange={(e) => change("classAtAchievement", e.target.value)}
              >
                <option value="">Sinfni tanlang</option>
                {Array.from({ length: 11 }, (_, i) => `${i + 1}-sinf`).map((grade) => (
                  <option key={grade}>{grade}</option>
                ))}
                {form.classAtAchievement &&
                  !/^([1-9]|10|11)-sinf$/.test(form.classAtAchievement) && (
                    <option value={form.classAtAchievement}>{form.classAtAchievement}</option>
                  )}
              </select>
            </label>
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
                placeholder="Masalan: Dilnoza Karimova"
                value={form.teacherName ?? ""}
                onChange={(e) => change("teacherName", e.target.value || null)}
              />
            </label>
            <p className="rounded-xl bg-secondary p-4 text-sm text-primary">
              Sertifikat qo‘shish uchun yutuq turidan IELTS, SAT yoki Milliy sertifikatni tanlang.
              Ballni «Natija» maydoniga yozing, rasmni yuklang va saytda ko‘rsatish uchun «E’lon
              qilingan» holatida saqlang.
            </p>
            {form.certificateImage && (
              <figure className="rounded-xl border bg-secondary p-3">
                <img
                  src={form.certificateImage}
                  alt="Yuklangan sertifikat"
                  className="max-h-64 w-full rounded-lg object-contain"
                />
                <button
                  type="button"
                  className="mt-3 text-sm font-semibold text-destructive"
                  onClick={() => change("certificateImage", null)}
                >
                  Rasmni olib tashlash
                </button>
              </figure>
            )}
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
        {editing && (
          <AdminDeleteButton
            name={form.studentName + " — " + form.title}
            disabled={busy || uploading || loading}
            onDelete={remove}
          />
        )}
        <AdminNotice notice={notice} error={error} />
      </section>
    </div>
  );
}
