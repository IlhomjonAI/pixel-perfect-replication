/** Shared response and bounded-body handling for every admin resource. */
export const json = (status: number, body: unknown, extra: Record<string, string> = {}) =>
  Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", ...extra },
  });

export const fail = (status: number, message: string) => json(status, { error: { message } });

export async function readJson(
  request: Request,
  limit: number,
): Promise<{ data?: unknown; error?: Response }> {
  const reader = request.body?.getReader();
  if (!reader) return { error: fail(400, "Ma’lumot kiriting.") };
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      return { error: fail(413, "So‘rov hajmi juda katta.") };
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  try {
    return { data: JSON.parse(new TextDecoder().decode(bytes)) as unknown };
  } catch {
    return { error: fail(400, "So‘rov noto‘g‘ri.") };
  }
}
