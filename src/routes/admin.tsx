import { MessageManager } from "@/components/admin/MessageManager";
import { TeacherManager } from "@/components/admin/TeacherManager";
import { AchievementManager } from "@/components/admin/AchievementManager";
import { PostManager } from "@/components/admin/PostManager";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState, type FormEvent } from "react";
export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin | Bekobod maktabi" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminPage,
});
function AdminPage() {
  const [view, setView] = useState<"posts" | "achievements" | "teachers" | "messages">("posts");
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
    <section className="container-site py-16">
      <div
        className={`mx-auto ${authenticated ? "max-w-6xl" : "max-w-md"} rounded-2xl border bg-card p-8 shadow-sm`}
      >
        <p className="eyebrow">Maktab boshqaruvi</p>
        <h1 className="mt-3 text-3xl font-semibold text-primary">Admin panel</h1>
        {loading ? (
          <p className="mt-6" role="status">
            Tekshirilmoqda…
          </p>
        ) : authenticated ? (
          <div className="mt-6">
            <div className="flex flex-wrap gap-3" role="group" aria-label="Boshqaruv bo‘limi">
              <button
                className={`btn ${view === "posts" ? "btn-primary" : "btn-outline"}`}
                aria-pressed={view === "posts"}
                onClick={() => setView("posts")}
              >
                Yangiliklar
              </button>
              <button
                className={`btn ${view === "achievements" ? "btn-primary" : "btn-outline"}`}
                aria-pressed={view === "achievements"}
                onClick={() => setView("achievements")}
              >
                Yutuqlar
              </button>
              <button
                className={`btn ${view === "teachers" ? "btn-primary" : "btn-outline"}`}
                aria-pressed={view === "teachers"}
                onClick={() => setView("teachers")}
              >
                Ustozlar
              </button>
              <button
                className={`btn ${view === "messages" ? "btn-primary" : "btn-outline"}`}
                aria-pressed={view === "messages"}
                onClick={() => setView("messages")}
              >
                Murojaatlar
              </button>
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
            <button className="btn btn-outline mt-6" onClick={logout} disabled={busy}>
              {busy ? "Kutilmoqda…" : "Tizimdan chiqish"}
            </button>
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={submit}>
            <label className="block" htmlFor="admin-password">
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
              className="w-full rounded-lg border bg-background p-3"
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
      </div>
    </section>
  );
}
