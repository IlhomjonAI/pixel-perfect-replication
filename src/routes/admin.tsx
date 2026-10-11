import { SchoolLifeManager } from "@/components/admin/SchoolLifeManager";
import { MessageManager } from "@/components/admin/MessageManager";
import { TeacherManager } from "@/components/admin/TeacherManager";
import { AchievementManager } from "@/components/admin/AchievementManager";
import { PostManager } from "@/components/admin/PostManager";
import { AdminCard, AdminLoading } from "@/components/admin/admin-ui";
import { Eyebrow } from "@/components/site/common";
import { Logo } from "@/components/site/Logo";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState, type FormEvent } from "react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin | Bekobod maktabi" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminPage,
});

const VIEWS = [
  { key: "posts", label: "Yangiliklar" },
  { key: "achievements", label: "Yutuqlar" },
  { key: "teachers", label: "Ustozlar" },
  { key: "messages", label: "Murojaatlar" },
  { key: "life", label: "Maktab hayoti" },
] as const;

type View = (typeof VIEWS)[number]["key"];

function AdminPage() {
  const [view, setView] = useState<View>("posts");
  const [authenticated, setAuthenticated] = useState(false);
  const onExpired = useCallback(() => setAuthenticated(false), []);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/admin/session", { cache: "no-store" })
      .then(async (r) => {
        if (!active) return;
        if (r.ok) setAuthenticated(true);
        else if (r.status !== 401)
          setError("Admin tizimi sozlanmagan yoki vaqtincha ishlamayapti.");
      })
      .catch(() => {
        if (active) setError("Serverga ulanib bo‘lmadi.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const body = await r.json();
      if (!r.ok) {
        setError(body.error?.message ?? "Kirish amalga oshmadi.");
        return;
      }
      setPassword("");
      setAuthenticated(true);
    } catch {
      setError("Serverga ulanib bo‘lmadi.");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/admin/logout", { method: "POST" });
      if (!r.ok) throw new Error();
      setAuthenticated(false);
      setPassword("");
    } catch {
      setError("Chiqish amalga oshmadi. Qayta urinib ko‘ring.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="container-site py-14 md:py-20">
      <div className="mx-auto mb-8 flex max-w-6xl items-center gap-4">
        <Logo className="h-12 w-12" />
        <div>
          <Eyebrow>Maktab boshqaruvi</Eyebrow>
          <h1 className="mt-2 text-[clamp(1.9rem,4vw,2.75rem)] font-medium text-primary">
            Admin panel
          </h1>
        </div>
      </div>

      <AdminCard className={authenticated ? "mx-auto max-w-6xl" : "mx-auto max-w-md"}>
        {loading ? (
          <AdminLoading label="Tekshirilmoqda…" />
        ) : authenticated ? (
          <div>
            <div
              role="group"
              aria-label="Boshqaruv bo‘limi"
              className="flex flex-wrap gap-2 border-b pb-5"
            >
              {VIEWS.map(({ key, label }) => (
                <button
                  key={key}
                  className={`inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-semibold transition-colors ${
                    view === key
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input bg-card text-forest hover:border-primary hover:bg-secondary"
                  }`}
                  aria-pressed={view === key}
                  onClick={() => setView(key)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div hidden={view !== "life"}>
              <SchoolLifeManager onExpired={onExpired} />
            </div>
            <div hidden={view !== "posts"}>
              <PostManager onExpired={onExpired} />
            </div>
            <div hidden={view !== "achievements"}>
              <AchievementManager onExpired={onExpired} />
            </div>
            <div hidden={view !== "teachers"}>
              <TeacherManager onExpired={onExpired} />
            </div>
            <div hidden={view !== "messages"}>
              <MessageManager onExpired={onExpired} />
            </div>
            <button className="btn btn-outline mt-8" onClick={logout} disabled={busy}>
              {busy ? "Kutilmoqda…" : "Tizimdan chiqish"}
            </button>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={submit}>
            <p className="text-sm text-muted-foreground">
              Davom etish uchun administrator parolini kiriting.
            </p>
            <label className="block text-sm font-semibold text-primary" htmlFor="admin-password">
              Admin paroli
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              maxLength={256}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field"
            />
            <button disabled={busy} className="btn btn-primary w-full" type="submit">
              {busy ? "Tekshirilmoqda…" : "Kirish"}
            </button>
          </form>
        )}
        {error && (
          <p role="alert" className="mt-4 text-sm text-destructive">
            {error}
          </p>
        )}
      </AdminCard>
    </section>
  );
}
