/**
 * Resolves the Cloudflare D1 binding for the current server request.
 *
 * The TanStack Start server entry is imported dynamically so this module stays
 * safe to import from route/component code that is bundled for the browser.
 */
export async function getRequestD1(): Promise<D1Database> {
  const [{ getRequest }, { getD1 }] = await Promise.all([
    import("@tanstack/react-start/server"),
    import("@/server/db"),
  ]);
  const request = getRequest() as Request & {
    runtime?: { cloudflare?: { env?: CloudflareBindings } };
  };
  return getD1(request.runtime?.cloudflare?.env);
}
