// @vitest-environment node
import { afterEach, expect, it, vi } from "vitest";
import { POST, GET } from "../app/api/[...path]/route";
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
it("forwards only selected headers and replaces forged credentials and IP metadata", async () => {
  vi.stubEnv("VERCEL", "1");
  vi.stubEnv("API_PROXY_SECRET", "server-only-secret");
  vi.stubEnv("API_INTERNAL_URL", "https://backend.test");
  const fetcher = vi.fn(async (_url: URL, init: RequestInit) => {
    const headers = new Headers(init.headers);
    expect(headers.get("x-school-proxy-secret")).toBe("server-only-secret");
    expect(headers.get("x-school-client-ip")).toBe("1.2.3.4");
    expect(headers.get("cf-connecting-ip")).toBeNull();
    expect(headers.get("cookie")).toBe("session=test");
    expect(headers.get("origin")).toBe("https://school.test");
    return new Response("{}", {
      headers: {
        "set-cookie": "session=new; HttpOnly; Secure",
        "content-type": "application/json",
      },
    });
  });
  vi.stubGlobal("fetch", fetcher);
  const result = await POST(
    new Request("https://school.test/api/admin/login?x=1", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: "session=test",
        origin: "https://school.test",
        "x-forwarded-for": "1.2.3.4",
        "x-school-client-ip": "fake",
        "x-school-proxy-secret": "fake",
        "cf-connecting-ip": "fake",
      },
      body: "{}",
    }),
  );
  expect(result.status).toBe(200);
  expect(result.headers.get("set-cookie")).toContain("Secure");
  expect(String(fetcher.mock.calls[0]?.[0])).toBe("https://backend.test/api/admin/login?x=1");
});
it("fails closed on Vercel without the secret and sanitizes network errors", async () => {
  vi.stubEnv("VERCEL", "1");
  vi.stubEnv("API_PROXY_SECRET", "");
  const fetcher = vi.fn();
  vi.stubGlobal("fetch", fetcher);
  expect((await GET(new Request("https://school.test/api/posts"))).status).toBe(503);
  expect(fetcher).not.toHaveBeenCalled();
  vi.stubEnv("API_PROXY_SECRET", "private-secret");
  vi.stubEnv("API_INTERNAL_URL", "https://backend.test");
  fetcher.mockRejectedValue(new Error("private-secret"));
  const response = await GET(new Request("https://school.test/api/posts"));
  expect(response.status).toBe(503);
  expect(await response.text()).not.toContain("private-secret");
});

it("does not attempt a localhost request on Vercel when the backend URL is missing", async () => {
  vi.stubEnv("VERCEL", "1");
  vi.stubEnv("API_PROXY_SECRET", "secret");
  vi.stubEnv("API_INTERNAL_URL", "");
  const fetcher = vi.fn();
  vi.stubGlobal("fetch", fetcher);
  expect((await GET(new Request("https://school.test/api/posts"))).status).toBe(503);
  expect(fetcher).not.toHaveBeenCalled();
});
