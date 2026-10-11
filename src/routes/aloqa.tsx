import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Send } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { Eyebrow } from "@/components/site/common";
import { PageHero } from "@/components/site/PageHero";
import { validateContact, type ContactErrors, type ContactForm } from "@/lib/contact";
import { PENDING, TELEGRAM_URL, pageHead } from "@/lib/site";

export const Route = createFileRoute("/aloqa")({
  head: () =>
    pageHead(
      "Aloqa va murojaat",
      "Maktabga savol, taklif yoki hamkorlik bo‘yicha murojaat yuborish.",
    ),
  component: Contact,
});

const empty: ContactForm = { name: "", contact: "", type: "", message: "", consent: false };

function Contact() {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [notice, setNotice] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const requestId = useRef<string | null>(null);
  const sending = useRef(false);

  const upd = <K extends keyof ContactForm>(k: K, v: ContactForm[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    requestId.current = null;
    setNotice(false);
    setError("");
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (sending.current) return;
    const errs = validateContact(form);
    setErrors(errs);
    setNotice(false);
    setError("");
    if (Object.keys(errs).length) return;
    sending.current = true;
    setBusy(true);
    try {
      requestId.current ??= crypto.randomUUID();
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, requestId: requestId.current }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.data?.received !== true)
        throw new Error(result?.error?.message ?? "Yuborish amalga oshmadi.");
      setNotice(true);
      setForm(empty);
      setErrors({});
      requestId.current = null;
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Serverga ulanib bo‘lmadi. Qayta urinib ko‘ring.",
      );
    } finally {
      sending.current = false;
      setBusy(false);
    }
  };

  const err = (k: keyof ContactForm) =>
    errors[k] && (
      <p id={`${k}-err`} className="mt-1.5 text-sm text-destructive">
        {errors[k]}
      </p>
    );
  const a11y = (k: keyof ContactForm) => ({
    "aria-invalid": !!errors[k],
    "aria-describedby": errors[k] ? `${k}-err` : undefined,
  });

  return (
    <>
      <PageHero
        eyebrow="Aloqa"
        title="Aloqa va murojaat"
        intro="Savol, taklif yoki hamkorlik bo‘yicha murojaat qoldiring."
      />
      <div className="container-site grid gap-10 py-12 lg:grid-cols-[1fr_340px] lg:gap-14">
        <form noValidate onSubmit={submit} className="card-surface space-y-5 p-6 md:p-8">
          <p className="text-sm text-muted-foreground">
            Murojaatingiz maktab administratoriga yuboriladi.
          </p>
          <fieldset disabled={busy} className="space-y-5">
            <div>
              <label htmlFor="name" className="text-sm font-semibold text-primary">
                Ism *
              </label>
              <input
                maxLength={150}
                id="name"
                className="field mt-1.5"
                value={form.name}
                onChange={(e) => upd("name", e.target.value)}
                autoComplete="name"
                {...a11y("name")}
              />
              {err("name")}
            </div>
            <div>
              <label htmlFor="contact" className="text-sm font-semibold text-primary">
                Elektron pochta yoki telefon *
              </label>
              <input
                maxLength={254}
                id="contact"
                className="field mt-1.5"
                value={form.contact}
                onChange={(e) => upd("contact", e.target.value)}
                {...a11y("contact")}
              />
              {err("contact")}
            </div>
            <div>
              <label htmlFor="type" className="text-sm font-semibold text-primary">
                Murojaat turi *
              </label>
              <select
                id="type"
                className="field mt-1.5"
                value={form.type}
                onChange={(e) => upd("type", e.target.value)}
                {...a11y("type")}
              >
                <option value="">Tanlang</option>
                {["Savol", "Taklif", "Hamkorlik", "Boshqa"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              {err("type")}
            </div>
            <div>
              <label htmlFor="message" className="text-sm font-semibold text-primary">
                Xabar *
              </label>
              <textarea
                maxLength={5000}
                id="message"
                rows={5}
                className="field mt-1.5"
                value={form.message}
                onChange={(e) => upd("message", e.target.value)}
                {...a11y("message")}
              />
              {err("message")}
            </div>
            <div>
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-primary"
                  checked={form.consent}
                  onChange={(e) => upd("consent", e.target.checked)}
                  {...a11y("consent")}
                />
                Shaxsiy ma’lumotlarimni murojaatni ko‘rib chiqish uchun ishlatilishiga roziman. *
              </label>
              {err("consent")}
            </div>
          </fieldset>
          {notice && (
            <div
              role="alert"
              className="flex gap-3 rounded-xl border border-gold bg-gold-soft p-4 text-navy-deep"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
              <p>Murojaatingiz qabul qilindi. Administrator uni ko‘rib chiqadi.</p>
            </div>
          )}
          {error && (
            <p role="alert" className="text-destructive">
              {error}
            </p>
          )}
          <button disabled={busy} type="submit" className="btn btn-primary w-full sm:w-auto">
            <Send className="h-4 w-4" aria-hidden /> {busy ? "Yuborilmoqda…" : "Yuborish"}
          </button>
        </form>
        <aside className="space-y-4">
          {[
            ["Manzil", PENDING],
            ["Telefon", PENDING],
            ["Elektron pochta", PENDING],
          ].map(([k, v]) => (
            <div key={k} className="card-surface p-5">
              <Eyebrow>{k}</Eyebrow>
              <p className="mt-2 text-muted-foreground">{v}</p>
            </div>
          ))}
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline w-full"
          >
            <Send className="h-4 w-4" aria-hidden /> Telegram kanal
          </a>
        </aside>
      </div>
    </>
  );
}
