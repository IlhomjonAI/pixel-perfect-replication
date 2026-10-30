import type { ReactNode } from "react";
import {
  ArrowUpRight,
  Award,
  BookOpen,
  GraduationCap,
  MessageCircle,
  Newspaper,
  Sparkles,
} from "lucide-react";
import { ARIZA_URL, TELEGRAM_URL } from "@/config/site";

type Theme = "admissions" | "achievements" | "news" | "contact";
const motifs = {
  admissions: {
    icon: GraduationCap,
    word: "KELAJAK",
    note: "Katta maqsadlar. Birinchi qadam.",
    tag: "Qabul yo‘riqnomasi",
  },
  achievements: {
    icon: Award,
    word: "YUKSALISH",
    note: "Har bir natija ortida — izlanish.",
    tag: "Maktabimiz faxri",
  },
  news: {
    icon: Newspaper,
    word: "KUNDALIK",
    note: "Maktab hayotining yangi sahifalari.",
    tag: "Yangiliklar · Tadbirlar · E’lonlar",
  },
  contact: {
    icon: MessageCircle,
    word: "MULOQOT",
    note: "Yaxshi hamkorlik suhbatdan boshlanadi.",
    tag: "Savol · Taklif · Hamkorlik",
  },
};

export function EditorialHero({
  theme,
  eyebrow,
  title,
  accent,
  intro,
  children,
}: {
  theme: Theme;
  eyebrow: string;
  title: string;
  accent: string;
  intro: string;
  children?: ReactNode;
}) {
  const motif = motifs[theme];
  const Icon = motif.icon;
  return (
    <section className={`editorial-hero editorial-${theme}`}>
      <div className="container-site editorial-layout">
        <div className="editorial-copy">
          <p className="editorial-eyebrow">
            <span />
            {eyebrow}
          </p>
          <h1>
            {title}
            <em>{accent}</em>
          </h1>
          <p className="editorial-intro">{intro}</p>
          {children && <div className="editorial-actions">{children}</div>}
        </div>
        <div className="editorial-art" aria-hidden="true">
          <span className="art-orbit art-orbit-one" />
          <span className="art-orbit art-orbit-two" />
          <span className="art-spark">
            <Sparkles size={26} strokeWidth={1} />
          </span>
          <div className="art-card">
            <span className="art-card-tag">{motif.tag}</span>
            <div className="art-emblem">
              <Icon size={76} strokeWidth={1} />
            </div>
            <strong>{motif.word}</strong>
            <p>{motif.note}</p>
            <div className="art-card-line">
              <span />
              <BookOpen size={18} strokeWidth={1} />
              <span />
            </div>
          </div>
          <span className="art-coordinate">BEKOBOD / IM</span>
        </div>
      </div>
      <div className="editorial-foot container-site">
        <span>Bilimga intilish</span>
        <span>
          Izlanishdan yutuqqa <ArrowUpRight size={15} aria-hidden />
        </span>
      </div>
    </section>
  );
}

export function AdmissionsLink() {
  return (
    <a className="btn btn-gold" href={ARIZA_URL} target="_blank" rel="noopener noreferrer">
      Rasmiy qabul portali <ArrowUpRight size={18} aria-hidden />
    </a>
  );
}
export function NewsChannelLink() {
  return (
    <a
      className="editorial-text-link"
      href={TELEGRAM_URL}
      target="_blank"
      rel="noopener noreferrer"
    >
      Telegramda kuzating <ArrowUpRight size={18} aria-hidden />
    </a>
  );
}
