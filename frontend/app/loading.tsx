/** Streamed immediately while the destination page fetches its initial data. */
export default function Loading() {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <div className="page-hero bg-navy-deep text-white">
        <div className="container-site page-hero-content">
          <div className="w-full max-w-2xl space-y-5">
            <p className="flex items-center gap-3 text-sm text-white/80">
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/25 border-t-white motion-reduce:animate-none"
                aria-hidden
              />
              Sahifa yuklanmoqda…
            </p>
            <div
              className="h-12 w-3/4 animate-pulse rounded-lg bg-white/15 motion-reduce:animate-none"
              aria-hidden
            />
            <div
              className="h-5 w-full animate-pulse rounded bg-white/10 motion-reduce:animate-none"
              aria-hidden
            />
          </div>
        </div>
      </div>
      <div className="container-site grid gap-6 py-12 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
        {[0, 1, 2].map((key) => (
          <div
            key={key}
            className="h-64 animate-pulse rounded-2xl border bg-secondary motion-reduce:animate-none"
          />
        ))}
      </div>
    </div>
  );
}
