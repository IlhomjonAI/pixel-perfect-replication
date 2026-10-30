import type { Teacher } from "@school/contracts/models";
import { ArrowDown, Quote } from "lucide-react";
import { PhotoPlaceholder } from "./PhotoPlaceholder";

export function TeachersIntro({ teachers }: { teachers: Teacher[] }) {
  const portraits = teachers.filter((teacher) => teacher.photo).slice(0, 6);
  return (
    <section className="teachers-intro">
      <div className="container-site teachers-intro-copy">
        <div>
          <p className="editorial-eyebrow">
            <span />
            Bilim ortidagi insonlar
          </p>
          <h1>
            Ustozdan boshlanar <em>katta kelajak.</em>
          </h1>
          <p>
            Bilimini ulashadigan, izlanishga undaydigan, har bir qadamda yo‘l ko‘rsatadigan jamoamiz
            bilan tanishing.
          </p>
          <a href="#ustozlar" className="editorial-text-link">
            O‘qituvchilar bilan tanishish <ArrowDown size={18} aria-hidden />
          </a>
        </div>
        <div className="teachers-quote">
          <Quote size={36} strokeWidth={1} aria-hidden />
          <p>
            Bilim berish —<br />
            kelajakka ishonch
            <br />
            bag‘ishlash.
          </p>
          <span>BEKOBOD IM · USTOZLAR JAMOASI</span>
        </div>
      </div>
      {portraits.length > 0 && (
        <div className="portrait-ribbon" aria-label="Ustozlar jamoasi suratlari">
          <div className="portrait-ribbon-track">
            {[0, 1].map((copy) => (
              <div
                className="portrait-ribbon-group"
                key={copy}
                aria-hidden={copy === 1 ? true : undefined}
              >
                {portraits.map((teacher) => (
                  <figure className="ribbon-portrait" key={teacher.slug}>
                    <PhotoPlaceholder
                      src={teacher.photo}
                      alt={copy === 0 ? teacher.name : ""}
                      lazy={false}
                      className="object-top"
                    />
                    <figcaption>
                      <span>{teacher.subject}</span>
                      <strong>{teacher.name}</strong>
                    </figcaption>
                  </figure>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
