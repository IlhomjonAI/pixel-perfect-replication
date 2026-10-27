import { isIP } from "node:net";
import { apiOrigin } from "@/api/origin";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function proxy(request: Request) {
  const secret = process.env["API_PROXY_SECRET"];
  if (process.env["VERCEL"] && !secret)
    return Response.json(
      { error: { message: "Server sozlamalari yetishmayapti." } },
      { status: 503 },
    );
  const incoming = new URL(request.url);
  let target: URL;
  try {
    target = new URL(apiOrigin());
  } catch {
    return Response.json(
      { error: { message: "Server sozlamalari yetishmayapti." } },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
  target.pathname = incoming.pathname;
  target.search = incoming.search;
  const headers = new Headers();
  for (const key of ["content-type", "cookie", "origin", "accept"]) {
    const value = request.headers.get(key);
    if (value) headers.set(key, value);
  }
  // Vercel replaces this header at its edge. Never trust it on arbitrary local hosts.
  const forwarded = process.env["VERCEL"]
    ? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    : undefined;
  headers.set("x-school-client-ip", forwarded && isIP(forwarded) ? forwarded : "local");
  if (secret) headers.set("x-school-proxy-secret", secret);
  try {
    const response = await fetch(target, {
      method: request.method,
      headers,
      redirect: "manual",
      cache: "no-store",
      ...(request.method !== "GET" && request.method !== "HEAD"
        ? { body: request.body, duplex: "half" }
        : {}),
      signal: AbortSignal.any([
        request.signal,
        AbortSignal.timeout(
          incoming.pathname.replace(/\/$/, "") === "/api/admin/uploads" ? 40000 : 25000,
        ),
      ]),
    } as RequestInit);
    const resultHeaders = new Headers();
    for (const key of [
      "content-type",
      "cache-control",
      "retry-after",
      "allow",
      "x-content-type-options",
    ]) {
      const value = response.headers.get(key);
      if (value) resultHeaders.set(key, value);
    }
    for (const value of response.headers.getSetCookie()) resultHeaders.append("set-cookie", value);
    return new Response(response.body, { status: response.status, headers: resultHeaders });
  } catch {
    return Response.json(
      { error: { message: "Serverga ulanib bo‘lmadi. Qayta urinib ko‘ring." } },
      { status: 503 },
    );
  }
}
export {
  proxy as GET,
  proxy as POST,
  proxy as PATCH,
  proxy as DELETE,
  proxy as PUT,
  proxy as HEAD,
  proxy as OPTIONS,
};
