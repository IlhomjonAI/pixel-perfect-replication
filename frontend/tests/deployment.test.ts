// @vitest-environment node
import path from "node:path";
import { expect, it } from "vitest";
import { deploymentErrors } from "@backend/lib/deployment";
import { apiOrigin } from "@/api/origin";

it("rejects missing or unsafe Vercel API configuration instead of using localhost", () => {
  for (const value of [
    undefined,
    "http://api.test",
    "https://user:pass@api.test",
    "https://api.test/path",
  ]) {
    const env = { VERCEL: "1", ...(value ? { API_INTERNAL_URL: value } : {}) };
    expect(() => apiOrigin(env)).toThrow();
  }
  expect(apiOrigin({ VERCEL: "1", API_INTERNAL_URL: "https://api.test/" })).toBe(
    "https://api.test",
  );
  expect(apiOrigin({})).toBe("http://127.0.0.1:4000");
});

it("checks deployment variables without returning credentials in diagnostics", () => {
  const env = {
    API_PROXY_SECRET: "s".repeat(32),
    PUBLIC_ORIGIN: "https://school.test",
    API_INTERNAL_URL: "https://backend.test",
    DATABASE_PATH: path.resolve("test.sqlite"),
    ADMIN_PASSWORD_HASH: `pbkdf2:100000:${"a".repeat(32)}:${"b".repeat(64)}`,
    SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_SECRET_KEY: "sb_secret_" + "c".repeat(25),
    TELEGRAM_ENABLED: "false",
    BACKUP_ENABLED: "true",
    BACKUP_DIR: path.resolve("backups"),
  };
  expect(deploymentErrors("frontend", env)).toEqual([]);
  expect(deploymentErrors("backend", env)).toEqual([]);
  const errors = deploymentErrors("backend", {
    ...env,
    PUBLIC_ORIGIN: "https://user:private@school.test/path",
    DATABASE_PATH: "relative.sqlite",
  });
  expect(errors).toHaveLength(2);
  expect(errors.join()).not.toContain("private");
  expect(deploymentErrors("frontend", {})).toHaveLength(2);
});
