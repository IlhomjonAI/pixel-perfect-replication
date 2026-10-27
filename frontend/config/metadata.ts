import type { Metadata } from "next";
import { SCHOOL_NAME } from "./site";
export function pageMetadata(title: string, description: string): Metadata {
  const fullTitle = title + " — " + SCHOOL_NAME;
  return {
    title: fullTitle,
    description,
    openGraph: { title: fullTitle, description, type: "website" },
    twitter: { card: "summary", title: fullTitle, description },
  };
}
