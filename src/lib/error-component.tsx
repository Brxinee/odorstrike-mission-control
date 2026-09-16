import type { ErrorComponentProps } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";

const FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return FALLBACK_MESSAGE;
}

export function AppErrorComponent({ error }: ErrorComponentProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-bg px-6 text-center text-fg">
      <span className="text-danger" aria-hidden="true">
        <TriangleAlert className="size-10" strokeWidth={2} />
      </span>
      <h1 className="text-lg font-semibold tracking-tight">Something went wrong</h1>
      <p className="max-w-md text-sm leading-6 break-words text-muted">{errorMessage(error)}</p>
      <button
        type="button"
        className="mt-2 inline-flex h-11 items-center rounded-sm bg-acid px-4 text-sm font-medium text-acid-fg"
        onClick={() => window.location.reload()}
      >
        Reload
      </button>
    </main>
  );
}
