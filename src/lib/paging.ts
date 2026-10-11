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
 *
 * A generation counter guards against races: when the initial loader data or
 * page size changes, any in-flight request is invalidated so its result can no
 * longer append stale rows or move the offset of the freshly reset list.
 * Server order is preserved, pages are de-duplicated both against existing
 * items and within the returned page, and the offset advances by the raw
 * server page length.
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
  const generation = useRef(0);
  const busy = useRef(false);

  useEffect(() => {
    generation.current += 1;
    busy.current = false;
    setItems(initial);
    setOffset(initial.length);
    setHasMore(initial.length === pageSize);
    setLoading(false);
    setError("");
  }, [initial, pageSize]);

  const loadMore = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    const requestGeneration = generation.current;
    setLoading(true);
    setError("");
    try {
      const next = await load(offset);
      if (requestGeneration !== generation.current) return;
      setItems((current) => {
        const seen = new Set(current.map(keyOf));
        const merged: T[] = [];
        for (const item of next) {
          const key = keyOf(item);
          if (seen.has(key)) continue;
          seen.add(key);
          merged.push(item);
        }
        return merged.length ? [...current, ...merged] : current;
      });
      setOffset((value) => value + next.length);
      setHasMore(next.length === pageSize);
    } catch {
      if (requestGeneration !== generation.current) return;
      setError(errorLabel);
    } finally {
      if (requestGeneration === generation.current) {
        busy.current = false;
        setLoading(false);
      }
    }
  }, [errorLabel, keyOf, load, offset, pageSize]);

  return { items, hasMore, loading, error, loadMore };
}
