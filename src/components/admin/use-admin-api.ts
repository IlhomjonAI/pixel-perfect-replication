import { useCallback } from "react";

export interface AdminResponse<T> {
  data: T;
  pagination?: { hasMore: boolean };
  counts?: Record<string, number>;
  error?: { message?: string };
}

/**
 * Shared JSON client for the admin panel. Centralises cookie-based requests,
 * session-expiry handling and server error messages so every manager behaves
 * the same way.
 */
export function useAdminApi(onExpired: () => void) {
  return useCallback(
    async <T>(path: string, init?: RequestInit): Promise<AdminResponse<T>> => {
      const response = await fetch(path, { cache: "no-store", ...init });
      const body = (await response.json()) as AdminResponse<T>;
      if (response.status === 401) {
        onExpired();
        throw new Error("Sessiya tugagan. Qayta kiring.");
      }
      if (!response.ok) throw new Error(body.error?.message ?? "So‘rov bajarilmadi.");
      return body;
    },
    [onExpired],
  );
}
