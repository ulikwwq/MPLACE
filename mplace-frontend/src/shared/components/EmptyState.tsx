import type { ReactNode } from "react";

export function EmptyState({
  title,
  message,
  action,
}: {
  title: string;
  message?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-24 text-center">
      <h2 className="text-lg font-medium text-ink">{title}</h2>
      {message && <p className="text-sm text-ink-muted">{message}</p>}
      {action}
    </div>
  );
}
