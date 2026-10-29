import { postgresConfig } from "../database/postgres";
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
    if (!validPublicOrigin(env))
      errors.push(
        "PUBLIC_ORIGIN: HTTPS origin kerak. Localhost sinovi uchun http://localhost:3000 va ALLOW_LOCAL_FRONTEND=true kiriting.",
      );
    try {
      postgresConfig(env);
    } catch {
      errors.push(
        "DATABASE_URL: Supabase PostgreSQL ulanish manzili kerak; DATABASE_POOL_MAX 1–20 bo‘lsin.",
      );
    }
    if (!/^pbkdf2:100000:[a-f0-9]{32}:[a-f0-9]{64}$/.test(env["ADMIN_PASSWORD_HASH"] ?? ""))
      errors.push("ADMIN_PASSWORD_HASH: admin parolining yaroqli xeshi kerak.");
    if (
      !storageConfig({
        SUPABASE_URL: env["SUPABASE_URL"] ?? "",
        SUPABASE_SECRET_KEY: env["SUPABASE_SECRET_KEY"] ?? "",
        SUPABASE_STORAGE_BUCKET: env["SUPABASE_STORAGE_BUCKET"] ?? "school-images",
      })
    ) {
      const baseline = {
        SUPABASE_URL: "https://example.supabase.co",
        SUPABASE_SECRET_KEY: "sb_secret_" + "a".repeat(25),
        SUPABASE_STORAGE_BUCKET: "school-images",
      };
      if (!storageConfig({ ...baseline, SUPABASE_URL: env["SUPABASE_URL"] ?? "" }))
        errors.push(
          "SUPABASE_URL: https://PROJECT_ID.supabase.co kerak; Dashboard yoki PostgreSQL URL emas.",
        );
      if (!storageConfig({ ...baseline, SUPABASE_SECRET_KEY: env["SUPABASE_SECRET_KEY"] ?? "" }))
        errors.push("SUPABASE_SECRET_KEY: sb_secret_ bilan boshlanadigan to‘liq secret key kerak.");
      if (
        !storageConfig({
          ...baseline,
          SUPABASE_STORAGE_BUCKET: env["SUPABASE_STORAGE_BUCKET"] ?? "school-images",
        })
      )
        errors.push(
          "SUPABASE_STORAGE_BUCKET: bucket nomini kiriting, masalan school-images; URL emas.",
        );
    }
    if (
      env["TELEGRAM_ENABLED"] !== "false" &&
      (!/^\d{5,}:[A-Za-z0-9_-]{20,}$/.test(env["TELEGRAM_BOT_TOKEN"] ?? "") ||
        !Number.isSafeInteger(Number(env["TELEGRAM_ADMIN_ID"])) ||
        Number(env["TELEGRAM_ADMIN_ID"]) < 1)
    )
      errors.push("TELEGRAM: token va raqamli admin ID kerak yoki TELEGRAM_ENABLED=false qiling.");
    if (env["BACKUP_ENABLED"] === "true")
      errors.push(
        "BACKUP_ENABLED: PostgreSQL rejimida SQLite zaxiralashini o‘chiring (false); Supabase backup yoki pg_dump ishlating.",
      );
  }
  return errors;
}

export function validPublicOrigin(env: Record<string, string | undefined>) {
  if (validHttpsOrigin(env["PUBLIC_ORIGIN"])) return true;
  return (
    env["ALLOW_LOCAL_FRONTEND"] === "true" &&
    [
      "http://localhost:3000",
      "http://localhost:3000/",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3000/",
    ].includes(env["PUBLIC_ORIGIN"] ?? "")
  );
}
