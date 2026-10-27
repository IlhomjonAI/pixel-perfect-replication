import { requireAdmin } from "@backend/api/admin-auth";
const MAX_IMAGE = 4 * 1024 * 1024;
const json = (status: number, body: unknown, extra: Record<string, string> = {}) =>
  Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", ...extra },
  });
const fail = (status: number, message: string) => json(status, { error: { message } });
export function imageType(bytes: Uint8Array) {
  if (bytes.length >= 8 && [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v))
    return "image/png";
  if (bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255)
    return "image/jpeg";
  if (
    bytes.length >= 12 &&
    new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" &&
    new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP"
  )
    return "image/webp";
  return null;
}
export function imageDimensions(bytes: Uint8Array, mime: string) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let width = 0,
    height = 0;
  if (
    mime === "image/png" &&
    bytes.length >= 24 &&
    new TextDecoder().decode(bytes.slice(12, 16)) === "IHDR"
  ) {
    width = view.getUint32(16);
    height = view.getUint32(20);
  } else if (mime === "image/jpeg") {
    let offset = 2;
    while (offset + 4 <= bytes.length) {
      if (bytes[offset] !== 255) break;
      while (bytes[offset] === 255) offset++;
      if (offset + 3 > bytes.length) break;
      const marker = bytes[offset++]!;
      if (marker === 217 || marker === 218) break;
      if (marker === 1 || (marker >= 208 && marker <= 215)) continue;
      const length = view.getUint16(offset);
      if (length < 2 || offset + length > bytes.length) break;
      if (
        [192, 193, 194, 195, 197, 198, 199, 201, 202, 203, 205, 206, 207].includes(marker) &&
        length >= 8
      ) {
        height = view.getUint16(offset + 3);
        width = view.getUint16(offset + 5);
        break;
      }
      offset += length;
    }
  } else if (mime === "image/webp" && bytes.length >= 20) {
    let offset = 12;
    while (offset + 8 <= bytes.length) {
      const tag = new TextDecoder().decode(bytes.slice(offset, offset + 4));
      const length = view.getUint32(offset + 4, true),
        start = offset + 8;
      if (start + length > bytes.length) break;
      if (tag === "VP8X" && length >= 10) {
        width = 1 + bytes[start + 4]! + (bytes[start + 5]! << 8) + (bytes[start + 6]! << 16);
        height = 1 + bytes[start + 7]! + (bytes[start + 8]! << 8) + (bytes[start + 9]! << 16);
        break;
      }
      if (tag === "VP8L" && length >= 5 && bytes[start] === 47) {
        const bits = view.getUint32(start + 1, true);
        width = 1 + (bits & 16383);
        height = 1 + ((bits >>> 14) & 16383);
        break;
      }
      if (
        tag === "VP8 " &&
        length >= 10 &&
        bytes[start + 3] === 157 &&
        bytes[start + 4] === 1 &&
        bytes[start + 5] === 42
      ) {
        width = view.getUint16(start + 6, true) & 16383;
        height = view.getUint16(start + 8, true) & 16383;
        break;
      }
      offset = start + length + (length % 2);
    }
  }
  return width > 0 && height > 0 && width <= 20000 && height <= 20000 && width * height <= 100000000
    ? { width, height }
    : null;
}
export function storageConfig(env: Partial<AppBindings>) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SECRET_KEY) return null;
  try {
    const url = new URL(env.SUPABASE_URL);
    const bucket = env.SUPABASE_STORAGE_BUCKET ?? "school-images";
    if (
      url.protocol !== "https:" ||
      !/^[a-z0-9-]+\.supabase\.co$/.test(url.hostname) ||
      url.port ||
      url.username ||
      url.password ||
      url.pathname !== "/" ||
      url.search ||
      url.hash ||
      !/^[a-z0-9][a-z0-9_-]{0,62}$/.test(bucket) ||
      !/^sb_secret_[A-Za-z0-9_-]{20,200}$/.test(env.SUPABASE_SECRET_KEY)
    )
      return null;
    return { base: url.origin, bucket, secret: env.SUPABASE_SECRET_KEY };
  } catch {
    return null;
  }
}
export async function handleImageUpload(
  request: Request,
  env: Partial<AppBindings> = {},
  uploadFetch: typeof fetch = fetch,
) {
  try {
    if (!env.DB || !env.ADMIN_PASSWORD_HASH) return fail(503, "Admin tizimi sozlanmagan.");
    if (!(await requireAdmin(request, env))) return fail(401, "Sessiya tugagan. Qayta kiring.");
    if (request.method !== "POST")
      return json(405, { error: { message: "Faqat rasm yuklash mumkin." } }, { Allow: "POST" });
    if (request.headers.get("origin") !== new URL(request.url).origin)
      return fail(403, "So‘rovga ruxsat yo‘q.");
    const storage = storageConfig(env);
    if (!storage)
      return fail(503, "Supabase Storage ulanmagan. Avval rasm saqlash sozlamalarini kiriting.");
    if (!request.headers.get("content-type")?.startsWith("multipart/form-data"))
      return fail(415, "Rasm faylini tanlang.");
    const reader = request.body?.getReader();
    if (!reader) return fail(400, "Rasm faylini tanlang.");
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_IMAGE + 65536) {
        await reader.cancel();
        return fail(413, "Rasm 4 MB dan oshmasin.");
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
    let form: FormData;
    try {
      form = await new Response(bytes, {
        headers: { "Content-Type": request.headers.get("content-type")! },
      }).formData();
    } catch {
      return fail(400, "Fayl so‘rovi noto‘g‘ri.");
    }
    if (Array.from(form.keys()).some((k) => k !== "file") || form.getAll("file").length !== 1)
      return fail(400, "Bitta rasm yuboring.");
    const file = form.get("file");
    if (!file || typeof file === "string" || file.size === 0)
      return fail(400, "Rasm faylini tanlang.");
    if (file.size > MAX_IMAGE) return fail(413, "Rasm 4 MB dan oshmasin.");
    const fileBytes = new Uint8Array(await file.arrayBuffer());
    const mime = imageType(fileBytes);
    if (!mime || file.type !== mime) return fail(415, "Faqat JPG, PNG va WebP rasmlarini yuklang.");
    const dimensions = imageDimensions(fileBytes, mime);
    if (!dimensions)
      return fail(415, "Rasm o‘lchami aniqlanmadi yoki juda katta. Boshqa rasm tanlang.");
    const now = Math.floor(Date.now() / 1000);
    for (const [bucket, seconds, maximum] of [
      ["minute", 60, 30],
      ["day", 86400, 1000],
    ] as const) {
      const row = await env.DB.prepare(
        "INSERT INTO image_upload_limits (bucket,window_start,attempts) VALUES (?,?,1) ON CONFLICT(bucket) DO UPDATE SET attempts=CASE WHEN window_start<=? THEN 1 ELSE attempts+1 END, window_start=CASE WHEN window_start<=? THEN excluded.window_start ELSE window_start END RETURNING attempts",
      )
        .bind(bucket, now, now - seconds, now - seconds)
        .first<{ attempts: number }>();
      if (!row || row.attempts > maximum)
        return json(
          429,
          { error: { message: "Yuklash vaqtincha cheklangan. Keyinroq urinib ko‘ring." } },
          { "Retry-After": String(seconds) },
        );
    }
    const extension = mime === "image/jpeg" ? "jpg" : mime === "image/png" ? "png" : "webp";
    const publicId = "bekobod/" + crypto.randomUUID() + "." + extension;
    const upstream = await uploadFetch(
      `${storage.base}/storage/v1/object/${storage.bucket}/${publicId}`,
      {
        method: "POST",
        headers: {
          apikey: storage.secret,
          "Content-Type": mime,
          "x-upsert": "false",
          "Cache-Control": "max-age=31536000",
          "User-Agent": "BekobodSchoolWorker/1.0",
        },
        body: new Blob([fileBytes], { type: mime }),
        redirect: "manual",
        signal: AbortSignal.timeout(30000),
      },
    );
    if (!upstream.ok)
      return fail(
        502,
        "Supabase rasmni qabul qilmadi. Kalit, bucket yoki xotira limitini tekshiring.",
      );
    const result: unknown = await upstream.json();
    if (
      !result ||
      typeof result !== "object" ||
      !("Key" in result) ||
      result.Key !== `${storage.bucket}/${publicId}`
    )
      throw new Error("Invalid provider response");
    const url = `${storage.base}/storage/v1/object/public/${storage.bucket}/${publicId}`;
    await env.DB.prepare(
      "INSERT INTO image_assets (public_id,url,mime_type,bytes,width,height,uploaded_at) VALUES (?,?,?,?,?,?,?)",
    )
      .bind(
        publicId,
        url,
        mime,
        file.size,
        dimensions.width,
        dimensions.height,
        new Date().toISOString(),
      )
      .run();
    return json(201, {
      data: { url, publicId, width: dimensions.width, height: dimensions.height, bytes: file.size },
    });
  } catch (error) {
    console.error("Image upload failed");
    return fail(
      502,
      error instanceof DOMException && error.name === "TimeoutError"
        ? "Rasm yuklash vaqti tugadi. Qayta urinib ko‘ring."
        : "Rasm yuklanmadi. Qayta urinib ko‘ring.",
    );
  }
}
