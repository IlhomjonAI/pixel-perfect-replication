import { useCallback, useEffect, useRef, useState } from "react";

interface UseLoadMoreOptions<T> {
  /** First page, already loaded by the route loader. */
  initial: T[];
  /** Number of records the server returns per request. */
  pageSize: number;
  /** Stable identity for de-duplication. */
  keyOf: (item: T) => string;
  /** Loads the next page for the given offset. */
  load: (offset: number) => Promise<T[]>;
  errorLabel?: string;
}

/**
 * Shared "load more" pagination for public listing pages.
 * Keeps server order, de-duplicates by key and never overwrites a newer page
 * with a stale one while the initial loader data is still the source of truth.
 */
export function useLoadMore<T>({
  initial,
  pageSize,
  keyOf,
  load,
  errorLabel = "Ma’lumotlar yuklanmadi. Qayta urinib ko‘ring.",
}: UseLoadMoreOptions<T>) {
  const [items, setItems] = useState<T[]>(initial);
  const [offset, setOffset] = useState(initial.length);
  const [hasMore, setHasMore] = useState(initial.length === pageSize);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const busy = useRef(false);

  useEffect(() => {
    setItems(initial);
    setOffset(initial.length);
    setHasMore(initial.length === pageSize);
  }, [initial, pageSize]);

  const loadMore = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    setLoading(true);
    setError("");
    try {
      const next = await load(offset);
      setItems((current) => {
        const seen = new Set(current.map(keyOf));
        return [...current, ...next.filter((item) => !seen.has(keyOf(item)))];
      });
      setOffset((value) => value + next.length);
      setHasMore(next.length === pageSize);
    } catch {
      setError(errorLabel);
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }, [errorLabel, keyOf, load, offset, pageSize]);

  return { items, hasMore, loading, error, loadMore };
}
