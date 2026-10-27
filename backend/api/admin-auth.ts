const COOKIE = "bekobod_admin";
const DURATION = 8 * 60 * 60;
const encoder = new TextEncoder();
const hex = (bytes: Uint8Array) =>
  Array.from(bytes, (v) => v.toString(16).padStart(2, "0")).join("");
export const digest = async (value: string) =>
  hex(new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value))));

async function verify(password: string, stored: string) {
  const parts = stored.split(":");
  if (
    parts.length !== 4 ||
    parts[0] !== "pbkdf2" ||
    parts[1] !== "100000" ||
    !/^[a-f0-9]{32}$/.test(parts[2] ?? "") ||
    !/^[a-f0-9]{64}$/.test(parts[3] ?? "")
  )
    throw new Error("Invalid credential config");
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const salt = Uint8Array.from(parts[2]!.match(/../g)!, (v) => parseInt(v, 16));
  const bytes = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: "PBKDF2", hash: "SHA-256", salt, iterations: 100000 },
      key,
      256,
    ),
  );
  const expected = Uint8Array.from(parts[3]!.match(/../g)!, (v) => parseInt(v, 16));
  let difference = 0;
  for (let i = 0; i < bytes.length; i++) difference |= bytes[i]! ^ expected[i]!;
  return difference === 0;
}

function token(request: Request) {
  const value = request.headers
    .get("cookie")
    ?.split(";")
    .map((v) => v.trim())
    .find((v) => v.startsWith(`${COOKIE}=`))
    ?.slice(COOKIE.length + 1);
  return value && /^[a-f0-9]{64}$/.test(value) ? value : null;
}

function cookie(request: Request, value: string, age: number) {
  return `${COOKIE}=${value}; Path=/api/admin; HttpOnly; SameSite=Strict; Max-Age=${age}${new URL(request.url).protocol === "https:" ? "; Secure" : ""}`;
}

function json(status: number, body: unknown, headers: Record<string, string> = {}) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", ...headers },
  });
}

export async function requireAdmin(request: Request, env: Partial<AppBindings>) {
  const value = token(request);
  if (!value || !env.DB || !env.ADMIN_PASSWORD_HASH) return false;
  const row = await env.DB.prepare(
    "SELECT credential_hash FROM admin_sessions WHERE token_hash=? AND expires_at>?",
  )
    .bind(await digest(value), Math.floor(Date.now() / 1000))
    .first<{ credential_hash: string }>();
  return row?.credential_hash === (await digest(env.ADMIN_PASSWORD_HASH));
}

export async function handleAdminAuth(request: Request, env: Partial<AppBindings> = {}) {
  const path = new URL(request.url).pathname.replace(/\/$/, "");
  const methods: Record<string, string> = {
    "/api/admin/login": "POST",
    "/api/admin/logout": "POST",
    "/api/admin/session": "GET",
  };
  const method = methods[path];
  if (!method) return json(404, { error: { code: "NOT_FOUND", message: "Sahifa topilmadi." } });
  if (request.method !== method)
    return json(
      405,
      { error: { code: "METHOD_NOT_ALLOWED", message: "Usulga ruxsat yo‘q." } },
      { Allow: method },
    );
  if (method === "POST" && request.headers.get("origin") !== new URL(request.url).origin)
    return json(403, { error: { code: "ORIGIN_REJECTED", message: "So‘rovga ruxsat yo‘q." } });
  try {
    if (!env.DB || !env.ADMIN_PASSWORD_HASH)
      return json(503, { error: { code: "UNAVAILABLE", message: "Admin tizimi sozlanmagan." } });
    if (path === "/api/admin/session")
      return (await requireAdmin(request, env))
        ? json(200, { data: { authenticated: true } })
        : json(401, { data: { authenticated: false } });
    if (path === "/api/admin/logout") {
      const value = token(request);
      if (value)
        await env.DB.prepare("DELETE FROM admin_sessions WHERE token_hash=?")
          .bind(await digest(value))
          .run();
      return json(
        200,
        { data: { authenticated: false } },
        { "Set-Cookie": cookie(request, "", 0) },
      );
    }
    if (!request.headers.get("content-type")?.startsWith("application/json"))
      return json(415, { error: { code: "JSON_REQUIRED", message: "JSON kerak." } });
    // Stream with a byte limit, including requests with no Content-Length.
    const reader = request.body?.getReader();
    if (!reader) return json(400, { error: { code: "INVALID_INPUT", message: "Parol kiriting." } });
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 2048) {
        await reader.cancel();
        return json(413, { error: { code: "TOO_LARGE", message: "So‘rov juda katta." } });
      }
      chunks.push(value);
    }
    const buffer = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      buffer.set(chunk, offset);
      offset += chunk.length;
    }
    let body: unknown;
    try {
      body = JSON.parse(new TextDecoder().decode(buffer));
    } catch {
      return json(400, { error: { code: "INVALID_INPUT", message: "So‘rov noto‘g‘ri." } });
    }
    const password = body && typeof body === "object" && "password" in body ? body.password : null;
    if (typeof password !== "string" || password.length < 1 || password.length > 256)
      return json(400, { error: { code: "INVALID_INPUT", message: "Parol noto‘g‘ri." } });
    const now = Math.floor(Date.now() / 1000);
    // Atomic counters: per IP plus a global ceiling for the single administrator.
    const ip = request.headers.get("cf-connecting-ip") ?? "local";
    for (const [bucket, maximum] of [
      ["global", 50],
      [await digest(ip), 5],
    ] as const) {
      const row = await env.DB.prepare(
        "INSERT INTO admin_login_limits (bucket,window_start,attempts) VALUES (?, ?, 1) ON CONFLICT(bucket) DO UPDATE SET attempts=CASE WHEN window_start<=? THEN 1 ELSE attempts+1 END, window_start=CASE WHEN window_start<=? THEN excluded.window_start ELSE window_start END RETURNING attempts",
      )
        .bind(bucket, now, now - 900, now - 900)
        .first<{ attempts: number }>();
      if (!row || row.attempts > maximum)
        return json(
          429,
          {
            error: {
              code: "RATE_LIMITED",
              message: "Ko‘p urinish. 15 daqiqadan keyin qayta urinib ko‘ring.",
            },
          },
          { "Retry-After": "900" },
        );
    }
    if (!(await verify(password, env.ADMIN_PASSWORD_HASH)))
      return json(401, { error: { code: "INVALID_CREDENTIALS", message: "Parol noto‘g‘ri." } });
    await env.DB.prepare("DELETE FROM admin_sessions WHERE expires_at<=?").bind(now).run();
    await env.DB.prepare("DELETE FROM admin_login_limits WHERE window_start<?")
      .bind(now - 86400)
      .run();
    const value = hex(crypto.getRandomValues(new Uint8Array(32)));
    await env.DB.prepare(
      "INSERT INTO admin_sessions (token_hash,credential_hash,expires_at) VALUES (?,?,?)",
    )
      .bind(await digest(value), await digest(env.ADMIN_PASSWORD_HASH), now + DURATION)
      .run();
    return json(
      200,
      { data: { authenticated: true } },
      { "Set-Cookie": cookie(request, value, DURATION) },
    );
  } catch (error) {
    console.error("Admin auth failed", error);
    return json(503, {
      error: { code: "UNAVAILABLE", message: "Admin tizimi vaqtincha ishlamayapti." },
    });
  }
}
