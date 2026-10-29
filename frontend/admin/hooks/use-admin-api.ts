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
 *
 * The response body is read as text first so a 401 (or any error) with an empty
 * or non-JSON body still triggers session expiry and surfaces a clear Uzbek
 * message instead of leaking raw HTML or a parse error to the user.
 */
export function useAdminApi(onExpired: () => void) {
  return useCallback(
    async <T>(path: string, init?: RequestInit): Promise<AdminResponse<T>> => {
      let response: Response;
      try {
        response = await fetch(path, {
          cache: "no-store",
          ...init,
          signal: AbortSignal.any([
            AbortSignal.timeout(30000),
            ...(init?.signal ? [init.signal] : []),
          ]),
        });
      } catch {
        throw new Error("Serverga ulanib bo‘lmadi. Qayta urinib ko‘ring.");
      }

      if (response.status === 401) {
        onExpired();
        throw new Error("Sessiya tugagan. Qayta kiring.");
      }

      const text = await response.text();
      let body: AdminResponse<T> | null = null;
      if (text) {
        try {
          body = JSON.parse(text) as AdminResponse<T>;
        } catch {
          body = null;
        }
      }

      if (!response.ok) throw new Error(body?.error?.message ?? "So‘rov bajarilmadi.");
      if (!body) throw new Error("Serverdan kutilmagan javob keldi. Qayta urinib ko‘ring.");
      return body;
    },
    [onExpired],
  );
}
