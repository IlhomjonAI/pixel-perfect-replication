/** Server-only API target. Never silently use localhost on Vercel. */
export function apiOrigin(environment: Record<string, string | undefined> = process.env) {
  const raw = environment["API_INTERNAL_URL"];
  if (environment["VERCEL"] && !raw) throw new Error("API_INTERNAL_URL sozlanmagan.");
  const url = new URL(raw ?? "http://127.0.0.1:4000");
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    (environment["VERCEL"] && url.protocol !== "https:")
  )
    throw new Error("API_INTERNAL_URL noto‘g‘ri.");
  return url.origin;
}
