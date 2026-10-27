import path from "node:path";
import { storageConfig } from "../api/image-upload";

export function validHttpsOrigin(value: string | undefined) {
  try {
    const url = new URL(value ?? "");
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      url.pathname === "/" &&
      !url.search &&
      !url.hash
    );
  } catch {
    return false;
  }
}

export function deploymentErrors(
  target: "frontend" | "backend",
  env: Record<string, string | undefined>,
) {
  const errors: string[] = [];
  if (!env["API_PROXY_SECRET"] || env["API_PROXY_SECRET"].length < 32)
    errors.push(
      "API_PROXY_SECRET: ikkala hostingda bir xil, kamida 32 belgili maxfiy qiymat kerak.",
    );
  if (target === "frontend") {
    if (!validHttpsOrigin(env["API_INTERNAL_URL"]))
      errors.push("API_INTERNAL_URL: Render backendining to‘liq HTTPS origin manzili kerak.");
  } else {
    if (!validHttpsOrigin(env["PUBLIC_ORIGIN"]))
      errors.push("PUBLIC_ORIGIN: Vercel saytining to‘liq HTTPS origin manzili kerak.");
    if (!env["DATABASE_PATH"] || !path.isAbsolute(env["DATABASE_PATH"]))
      errors.push("DATABASE_PATH: Render doimiy diskidagi mutlaq fayl yo‘li kerak.");
    if (!/^pbkdf2:100000:[a-f0-9]{32}:[a-f0-9]{64}$/.test(env["ADMIN_PASSWORD_HASH"] ?? ""))
      errors.push("ADMIN_PASSWORD_HASH: admin parolining yaroqli xeshi kerak.");
    if (
      !storageConfig({
        SUPABASE_URL: env["SUPABASE_URL"] ?? "",
        SUPABASE_SECRET_KEY: env["SUPABASE_SECRET_KEY"] ?? "",
        SUPABASE_STORAGE_BUCKET: env["SUPABASE_STORAGE_BUCKET"] ?? "school-images",
      })
    )
      errors.push("SUPABASE: rasm saqlash URL, secret key va bucket sozlamalarini tekshiring.");
    if (
      env["TELEGRAM_ENABLED"] !== "false" &&
      (!/^\d{5,}:[A-Za-z0-9_-]{20,}$/.test(env["TELEGRAM_BOT_TOKEN"] ?? "") ||
        !Number.isSafeInteger(Number(env["TELEGRAM_ADMIN_ID"])) ||
        Number(env["TELEGRAM_ADMIN_ID"]) < 1)
    )
      errors.push("TELEGRAM: token va raqamli admin ID kerak yoki TELEGRAM_ENABLED=false qiling.");
    if (env["BACKUP_ENABLED"] !== "true")
      errors.push("BACKUP_ENABLED: avtomatik zaxira uchun true bo‘lishi kerak.");
    if (!env["BACKUP_DIR"] || !path.isAbsolute(env["BACKUP_DIR"]))
      errors.push("BACKUP_DIR: doimiy diskdagi mutlaq papka yo‘li kerak.");
  }
  return errors;
}
