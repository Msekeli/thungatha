export function CvDraftFeedback({
  message,
  error,
}: {
  message: string | null;
  error: string | null;
}) {
  if (!message && !error) return null;

  return (
    <div
      className="shrink-0 border-t border-line px-3 py-2 sm:px-6"
      aria-live="polite"
    >
      {message && <p className="text-xs text-fg-muted">{message}</p>}
      {error && (
        <p className="mt-1 text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
