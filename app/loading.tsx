import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8">
        <div className="max-w-3xl space-y-3">
          <div className="h-6 w-28 animate-pulse rounded-full bg-muted" />
          <div className="h-12 w-full max-w-2xl animate-pulse rounded-2xl bg-muted" />
          <div className="h-5 w-full max-w-xl animate-pulse rounded-full bg-muted" />
        </div>

        <div className="rounded-3xl border border-border/70 bg-card/80 p-8 shadow-sm">
          <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 text-center">
            <Spinner className="size-6" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Loading translator workspace</p>
              <p className="text-sm text-muted-foreground">
                Preparing the app shell and client-side controls.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
