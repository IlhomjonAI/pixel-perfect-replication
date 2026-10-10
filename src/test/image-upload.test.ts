// @vitest-environment node
import { readFile } from "node:fs/promises";
import { Miniflare } from "miniflare";
import { beforeAll, afterAll, it, expect, vi } from "vitest";
import {
  handleImageUpload,
  imageDimensions,
  imageType,
  storageConfig,
} from "@/server/image-upload";
import { digest } from "@/server/admin-auth";
let runtime: Miniflare;
let db: D1Database;
const token = "f".repeat(64),
  credential = "upload-test-credential";
const env = () => ({
  DB: db,
  ADMIN_PASSWORD_HASH: credential,
  SUPABASE_URL: "https://test-project.supabase.co",
  SUPABASE_SECRET_KEY: "sb_secret_test_only_12345678901234567890",
  SUPABASE_STORAGE_BUCKET: "school-images",
});
const png = Uint8Array.from(
  Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jK1sAAAAASUVORK5CYII=",
    "base64",
  ),
);
const req = (
  bytes: Uint8Array = png,
  mime = "image/png",
  authenticated = true,
  origin = "https://school.test",
) => {
  const form = new FormData();
  form.set("file", new Blob([bytes as Uint8Array<ArrayBuffer>], { type: mime }), "original.png");
  return new Request("https://school.test/api/admin/uploads", {
    method: "POST",
    headers: { origin, ...(authenticated ? { cookie: "bekobod_admin=" + token } : {}) },
    body: form,
  });
};
const provider = () =>
  vi.fn<typeof fetch>(async (url) =>
    Response.json({
      Key: new URL(String(url)).pathname.replace("/storage/v1/object/", ""),
      Id: "test-id",
    }),
  );
beforeAll(async () => {
  runtime = new Miniflare({
    modules: true,
    script: 'export default {fetch(){return new Response("ok")}}',
    compatibilityDate: "2026-08-06",
    d1Databases: { DB: "image-upload-tests" },
  });
  db = await runtime.getD1Database("DB");
  for (const file of ["0003_admin_auth.sql", "0008_image_uploads.sql"]) {
    const sql = await readFile(new URL("../../migrations/" + file, import.meta.url), "utf8");
    for (const s of sql
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean))
      await db.prepare(s).run();
  }
  await db
    .prepare("INSERT INTO admin_sessions VALUES (?,?,?)")
    .bind(await digest(token), await digest(credential), Math.floor(Date.now() / 1000) + 3600)
    .run();
});
afterAll(async () => {
  await runtime?.dispose();
});
it("reads dimensions from PNG, JPEG and all three WebP headers", () => {
  expect(imageDimensions(png, "image/png")).toEqual({ width: 1, height: 1 });
  const jpeg = Uint8Array.from([255, 216, 255, 192, 0, 11, 8, 0, 20, 0, 30, 1, 1, 17, 0]);
  expect(imageDimensions(jpeg, "image/jpeg")).toEqual({ width: 30, height: 20 });
  const webp = (tag: string, data: number[]) => {
    const b = new Uint8Array(20 + data.length),
      v = new DataView(b.buffer);
    b.set(new TextEncoder().encode("RIFF"));
    v.setUint32(4, b.length - 8, true);
    b.set(new TextEncoder().encode("WEBP"), 8);
    b.set(new TextEncoder().encode(tag), 12);
    v.setUint32(16, data.length, true);
    b.set(data, 20);
    return b;
  };
  expect(imageDimensions(webp("VP8X", [0, 0, 0, 0, 29, 0, 0, 19, 0, 0]), "image/webp")).toEqual({
    width: 30,
    height: 20,
  });
  const bits = 29 | (19 << 14);
  expect(
    imageDimensions(
      webp("VP8L", [47, bits & 255, (bits >>> 8) & 255, (bits >>> 16) & 255, (bits >>> 24) & 255]),
      "image/webp",
    ),
  ).toEqual({ width: 30, height: 20 });
  expect(imageDimensions(webp("VP8 ", [0, 0, 0, 157, 1, 42, 30, 0, 20, 0]), "image/webp")).toEqual({
    width: 30,
    height: 20,
  });
  expect(imageDimensions(png.slice(0, 18), "image/png")).toBeNull();
  expect(imageDimensions(jpeg.slice(0, 8), "image/jpeg")).toBeNull();
  const huge = png.slice();
  new DataView(huge.buffer).setUint32(16, 30000);
  expect(imageDimensions(huge, "image/png")).toBeNull();
});
it("accepts only a hosted project URL, safe bucket and server secret", () => {
  expect(storageConfig(env())).toMatchObject({ bucket: "school-images" });
  for (const url of [
    "http://test.supabase.co",
    "https://evil.test",
    "https://test.supabase.co@evil.test",
    "https://test.supabase.co/path",
    "https://test.supabase.co?x=1",
    "https://test.supabase.co:8080",
  ])
    expect(storageConfig({ ...env(), SUPABASE_URL: url })).toBeNull();
  expect(storageConfig({ ...env(), SUPABASE_STORAGE_BUCKET: "../bad" })).toBeNull();
  expect(
    storageConfig({ ...env(), SUPABASE_SECRET_KEY: "sb_publishable_not_a_server_key" }),
  ).toBeNull();
});
it("detects image magic and rejects SVG", () => {
  expect(imageType(png)).toBe("image/png");
  expect(imageType(Uint8Array.from([255, 216, 255]))).toBe("image/jpeg");
  expect(imageType(new TextEncoder().encode("RIFFxxxxWEBP"))).toBe("image/webp");
  expect(imageType(new TextEncoder().encode('<svg onload="alert(1)">'))).toBeNull();
});
it("denies anonymous and cross-origin uploads before calling the provider", async () => {
  const upstream = provider();
  expect((await handleImageUpload(req(png, "image/png", false), env(), upstream)).status).toBe(401);
  expect(
    (await handleImageUpload(req(png, "image/png", true, "https://evil.test"), env(), upstream))
      .status,
  ).toBe(403);
  expect(upstream).not.toHaveBeenCalled();
});
it("fails safely when Supabase is unconfigured", async () => {
  expect(
    (await handleImageUpload(req(), { DB: db, ADMIN_PASSWORD_HASH: credential }, provider()))
      .status,
  ).toBe(503);
});
it("rejects invalid types, MIME mismatch and oversized images", async () => {
  const upstream = provider();
  expect(
    (
      await handleImageUpload(
        req(new TextEncoder().encode("<svg/>"), "image/svg+xml"),
        env(),
        upstream,
      )
    ).status,
  ).toBe(415);
  expect((await handleImageUpload(req(png, "image/jpeg"), env(), upstream)).status).toBe(415);
  expect(
    (
      await handleImageUpload(
        req(new Uint8Array(5 * 1024 * 1024 + 1), "image/png"),
        env(),
        upstream,
      )
    ).status,
  ).toBe(413);
  expect(upstream).not.toHaveBeenCalled();
});
it("uploads from the server, stores dimensions and bytes, and never returns the secret", async () => {
  const upstream = provider();
  const response = await handleImageUpload(req(), env(), upstream);
  expect(response.status).toBe(201);
  const text = await response.text();
  expect(text).not.toContain(env().SUPABASE_SECRET_KEY);
  const result = JSON.parse(text);
  const row = await db
    .prepare("SELECT bytes,mime_type,width,height FROM image_assets WHERE public_id=?")
    .bind(result.data.publicId)
    .first();
  expect(row).toEqual({ bytes: png.length, mime_type: "image/png", width: 1, height: 1 });
  const [url, init] = upstream.mock.calls[0]!;
  expect(url).toBe(
    `https://test-project.supabase.co/storage/v1/object/school-images/${result.data.publicId}`,
  );
  expect(result.data.url).toBe(
    `https://test-project.supabase.co/storage/v1/object/public/school-images/${result.data.publicId}`,
  );
  const headers = new Headers(init!.headers);
  expect(headers.get("apikey")).toBe(env().SUPABASE_SECRET_KEY);
  expect(headers.has("Authorization")).toBe(false);
  expect(headers.get("x-upsert")).toBe("false");
  expect(headers.get("content-type")).toBe("image/png");
  expect(init!.redirect).toBe("manual");
  expect(new Uint8Array(await (init!.body as Blob).arrayBuffer())).toEqual(png);
});
it("returns a safe provider error without leaking its response", async () => {
  const upstream = vi.fn<typeof fetch>(async () =>
    Response.json({ error: { message: "private-provider-details" } }, { status: 401 }),
  );
  const response = await handleImageUpload(req(), env(), upstream);
  expect(response.status).toBe(502);
  expect(await response.text()).not.toContain("private-provider-details");
});
it("rejects provider redirects without forwarding credentials", async () => {
  const upstream = vi.fn<typeof fetch>(
    async () => new Response(null, { status: 307, headers: { location: "https://evil.test" } }),
  );
  expect((await handleImageUpload(req(), env(), upstream)).status).toBe(502);
  expect(upstream).toHaveBeenCalledTimes(1);
  expect(upstream.mock.calls[0]![1]!.redirect).toBe("manual");
});
it("rejects a provider response for an unexpected object", async () => {
  const upstream = vi.fn<typeof fetch>(async () =>
    Response.json({ Key: "other-bucket/other.png" }),
  );
  expect((await handleImageUpload(req(), env(), upstream)).status).toBe(502);
});
it("rejects invalid dimensions without calling storage", async () => {
  const upstream = provider();
  expect((await handleImageUpload(req(png.slice(0, 18)), env(), upstream)).status).toBe(415);
  expect(upstream).not.toHaveBeenCalled();
});
it("limits upload attempts before making another provider request", async () => {
  await db
    .prepare(
      "INSERT INTO image_upload_limits (bucket,window_start,attempts) VALUES ('minute',?,30) ON CONFLICT(bucket) DO UPDATE SET attempts=30,window_start=excluded.window_start",
    )
    .bind(Math.floor(Date.now() / 1000))
    .run();
  const upstream = provider();
  expect((await handleImageUpload(req(), env(), upstream)).status).toBe(429);
  expect(upstream).not.toHaveBeenCalled();
});
