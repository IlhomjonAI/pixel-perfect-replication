export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="container-site flex min-h-[50vh] items-center justify-center gap-3 py-20"
    >
      <span
        className="h-5 w-5 animate-spin rounded-full border-2 border-primary/20 border-t-primary motion-reduce:animate-none"
        aria-hidden
      />
      Admin panel yuklanmoqda…
    </div>
  );
}
