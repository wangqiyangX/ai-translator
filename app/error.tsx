"use client";

import { useEffect } from "react";
import { AlertTriangleIcon, RotateCcwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App router boundary error:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto flex max-w-3xl px-4 py-16">
        <div className="w-full rounded-3xl border border-border/70 bg-card p-8 shadow-sm">
          <div className="flex flex-col gap-6">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-destructive/10 p-3 text-destructive">
                <AlertTriangleIcon className="size-6" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Route Error
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-balance">
                  The translator page failed to render.
                </h1>
                <p className="text-sm leading-6 text-muted-foreground">
                  This boundary only covers the page shell. Existing API request
                  errors inside the translator remain handled by the app UI.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border bg-muted/40 p-4 text-sm text-muted-foreground">
              {error.message || "Unexpected rendering error."}
            </div>

            <div className="flex gap-3">
              <Button onClick={reset}>
                <RotateCcwIcon className="size-4" />
                Try again
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
