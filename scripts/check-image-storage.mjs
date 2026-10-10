import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export async function checkImageStorage(configText, uploadFetch = fetch, log = console.log) {
  const values = {};
  for (const line of configText.split(/\r?\n/)) {
    const match = line.match(
      /^\s*(SUPABASE_URL|SUPABASE_SECRET_KEY|SUPABASE_STORAGE_BUCKET)\s*=\s*(.*?)\s*$/,
    );
    if (!match) continue;
    try {
      values[match[1]] = match[2].startsWith('"') ? JSON.parse(match[2]) : match[2];
    } catch {
      log("ERROR: Mahalliy sozlama formati noto‘g‘ri. npm run images:setup ni qayta bajaring.");
      return false;
    }
  }
  const bucket = values.SUPABASE_STORAGE_BUCKET || "school-images";
  let url;
  try {
    url = new URL(values.SUPABASE_URL);
  } catch {
    /* handled below */
  }
  if (
    !url ||
    url.protocol !== "https:" ||
    !/^[a-z0-9-]+\.supabase\.co$/.test(url.hostname) ||
    url.port ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    !/^[a-z0-9][a-z0-9_-]{0,62}$/.test(bucket) ||
    !/^sb_secret_[A-Za-z0-9_-]{20,200}$/.test(values.SUPABASE_SECRET_KEY || "")
  ) {
    log(
      "ERROR: Project URL, bucket yoki sb_secret_ kaliti formati noto‘g‘ri. npm run images:setup ni qayta bajaring.",
    );
    return false;
  }
  log("Bucket: " + bucket);
  try {
    const response = await uploadFetch(`${url.origin}/storage/v1/bucket/${bucket}`, {
      headers: { apikey: values.SUPABASE_SECRET_KEY, "User-Agent": "BekobodSchoolCheck/1.0" },
      redirect: "manual",
      signal: AbortSignal.timeout(20000),
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      const description = [body?.error, body?.message, body?.code]
        .filter((v) => typeof v === "string")
        .join(" ")
        .toLowerCase();
      const explanation =
        /bucket.*not.*found|nosuchbucket|not_found/.test(description) || response.status === 404
          ? "Bucket topilmadi. Shu loyihada yuqoridagi nom bilan bucket yarating."
          : /invalid.*key|invalid.*jwt|unauthor|invalid.*token/.test(description) ||
              response.status === 401 ||
              response.status === 403
            ? "Kalit qabul qilinmadi. Project URL va Secret key aynan bir loyihadan ekanini tekshiring."
            : response.status >= 500
              ? "Supabase vaqtincha ishlamayapti yoki loyiha to‘xtatilgan. Dashboard holatini tekshiring."
              : "Supabase bucketni tekshirishga ruxsat bermadi. Loyiha va kalitni tekshiring.";
      log(`ERROR: HTTP ${response.status}. ${explanation}`);
      return false;
    }
    if (!body || body.id !== bucket) {
      log("ERROR: Bucket javobi kutilgan formatda emas.");
      return false;
    }
    log("OK: Secret key va bucket ulanishi ishladi.");
    let valid = true;
    if (body.public !== true) {
      log("ERROR: Bucket private. Storage sozlamasida Public bucket ni yoqing.");
      valid = false;
    } else log("OK: Bucket public.");
    const allowed = body.allowed_mime_types;
    if (Array.isArray(allowed)) {
      const missing = ["image/jpeg", "image/png", "image/webp"].filter(
        (mime) =>
          !allowed.includes(mime) && !allowed.includes("image/*") && !allowed.includes("*/*"),
      );
      if (missing.length) {
        log("ERROR: Bucket quyidagi turlarni qabul qilmaydi: " + missing.join(", "));
        valid = false;
      } else log("OK: JPG, PNG va WebP ruxsat etilgan.");
    } else log("INFO: Bucketda MIME cheklovi belgilanmagan.");
    const limit = Number(body.file_size_limit);
    if (limit > 0) {
      log("Bucket fayl limiti: " + (limit / 1024 / 1024).toFixed(2) + " MB.");
      if (limit < 5 * 1024 * 1024) {
        log("ERROR: Bucket limiti 5 MB dan kichik. Uni 5 MB qilib sozlang.");
        valid = false;
      }
    }
    if (valid)
      log(
        "NEXT: Worker ni qayta ishga tushiring va kichik JPG yoki PNG bilan qayta sinang. Bu tekshiruv fayl yuklamaydi va foydalanish kvotasini tekshirmaydi.",
      );
    return valid;
  } catch {
    log("ERROR: Supabase bilan bog‘lanib bo‘lmadi. Internet va loyiha holatini tekshiring.");
    return false;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const ok = await checkImageStorage(readFileSync(".dev.vars", "utf8"));
    if (!ok) process.exitCode = 1;
  } catch {
    console.error(
      "ERROR: .dev.vars topilmadi. Buyruqni package.json turgan loyiha papkasida bajaring.",
    );
    process.exitCode = 1;
  }
}
