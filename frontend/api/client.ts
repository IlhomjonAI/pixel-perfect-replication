import { apiOrigin } from "./origin";
export async function apiGet<T>(path: string, allowMissing = false): Promise<T> {
  const origin = typeof window === "undefined" ? apiOrigin() : "";
  const response = await fetch(`${origin}/api/${path}`, {
    headers:
      typeof window === "undefined" && process.env["API_PROXY_SECRET"]
        ? { "x-school-proxy-secret": process.env["API_PROXY_SECRET"] }
        : {},
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (allowMissing && response.status === 404) return null as T;
  const body = await response.json().catch(() => null);
  if (!response.ok)
    throw new Error(body?.error?.message ?? "Ma’lumotlarni yuklab bo‘lmadi. Qayta urinib ko‘ring.");
  if (!body || !("data" in body))
    throw new Error("Serverdan kutilmagan javob keldi. Qayta urinib ko‘ring.");
  return body.data as T;
}
