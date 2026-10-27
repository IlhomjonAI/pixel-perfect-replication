import { timingSafeEqual } from "node:crypto";
import { isIP } from "node:net";
export function authorizedProxy(headers: Headers, secret: string | undefined) {
  if (!secret) return true;
  const received = Buffer.from(headers.get("x-school-proxy-secret") ?? "");
  const expected = Buffer.from(secret);
  return received.length === expected.length && timingSafeEqual(received, expected);
}
export function clientIp(headers: Headers, peer: string, secret: string | undefined) {
  const ip = headers.get("x-school-client-ip") ?? "";
  return secret && authorizedProxy(headers, secret) && (isIP(ip) || ip === "local") ? ip : peer;
}
