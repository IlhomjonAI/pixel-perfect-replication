import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { DemoBadge, PageHeader } from "@/components/site/common";
import { validateContact, type ContactErrors, type ContactForm } from "@/lib/contact";
import { PENDING, TELEGRAM_URL, pageHead } from "@/lib/site";

export const Route = createFileRoute("/aloqa")({
  head: () => pageHead("Aloqa va murojaat", "Maktabga savol, taklif yoki hamkorlik bo‘yicha murojaat yuborish."),
  component: Contact,
});

const empty: ContactForm = { name: "", contact: "", type: "", message: "", consent: false };

function Contact() {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [notice, setNotice] = useState(false);

  const upd = <K extends keyof ContactForm>(k: K, v: ContactForm[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const errs = validateContact(form);
    setErrors(errs);
    setNotice(Object.keys(errs).length === 0);
  };

  const err = (k: keyof ContactForm) => errors[k] && <p id={`${k}-err`} className="mt-1 text-sm text-destructive">{errors[k]}</p>;
  const a11y = (k: keyof ContactForm) => ({ "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `${k}-err` : undefined });

  return (
    <>
      <PageHeader eyebrow="Aloqa" title="Aloqa va murojaat" intro="Savol, taklif yoki hamkorlik bo‘yicha murojaat qoldiring." />
      <div className="container-site grid gap-10 py-12 lg:grid-cols-[1fr_340px]">
        <form noValidate onSubmit={submit} className="card-surface space-y-5 p-6 md:p-8">
          <div className="flex items-center gap-3"><DemoBadge /><p className="text-sm text-muted-foreground">Bu namuna forma — yuborish funksiyasi hali ulanmagan.</p></div>
          <div>
            <label htmlFor="name" className="text-sm font-semibold text-primary">Ism *</label>
            <input id="name" className="field mt-1.5" value={form.name} onChange={(e) => upd("name", e.target.value)} autoComplete="name" {...a11y("name")} />
            {err("name")}
          </div>
          <div>
            <label htmlFor="contact" className="text-sm font-semibold text-primary">Elektron pochta yoki telefon *</label>
            <input id="contact" className="field mt-1.5" value={form.contact} onChange={(e) => upd("contact", e.target.value)} {...a11y("contact")} />
            {err("contact")}
          </div>
          <div>
            <label htmlFor="type" className="text-sm font-semibold text-primary">Murojaat turi *</label>
            <select id="type" className="field mt-1.5" value={form.type} onChange={(e) => upd("type", e.target.value)} {...a11y("type")}>
              <option value="">Tanlang</option>
              {["Savol", "Taklif", "Hamkorlik", "Boshqa"].map((t) => <option key={t}>{t}</option>)}
            </select>
            {err("type")}
          </div>
          <div>
            <label htmlFor="message" className="text-sm font-semibold text-primary">Xabar *</label>
            <textarea id="message" rows={5} className="field mt-1.5" value={form.message} onChange={(e) => upd("message", e.target.value)} {...a11y("message")} />
            {err("message")}
          </div>
          <div>
            <label className="flex items-start gap-3 text-sm">
              <input type="checkbox" className="mt-1 h-4 w-4 accent-primary" checked={form.consent} onChange={(e) => upd("consent", e.target.checked)} {...a11y("consent")} />
              Shaxsiy ma’lumotlarimni murojaatni ko‘rib chiqish uchun ishlatilishiga roziman. *
            </label>
            {err("consent")}
          </div>
          {notice && (
            <div role="alert" className="flex gap-3 rounded-xl border border-gold bg-gold-soft p-4 text-navy-deep">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
              <p>Bu namuna forma. Murojaatingiz yuborilmadi; yuborish funksiyasi keyingi bosqichda ulanadi.</p>
            </div>
          )}
          <button type="submit" className="btn btn-primary"><Send className="h-4 w-4" aria-hidden /> Yuborish</button>
        </form>
        <aside className="space-y-4">
          {[["Manzil", PENDING], ["Telefon", PENDING], ["Elektron pochta", PENDING]].map(([k, v]) => (
            <div key={k} className="card-surface p-5"><p className="eyebrow">{k}</p><p className="mt-1">{v}</p></div>
          ))}
          <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary w-full"><Send className="h-4 w-4" aria-hidden /> Telegram kanal</a>
        </aside>
      </div>
    </>
  );
}
