export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-24 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-danger/10 text-danger">
        !
      </div>
      <h2 className="text-lg font-medium text-ink">{title}</h2>
      <p className="text-sm text-ink-muted">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 rounded-md border border-line bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-paper"
        >
          Try again
        </button>
      )}
    </div>
  );
}
