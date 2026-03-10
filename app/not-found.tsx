import Link from "next/link";
import { CompassIcon, HomeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto flex max-w-3xl px-4 py-16">
        <div className="w-full rounded-3xl border border-border/70 bg-card p-8 shadow-sm">
          <div className="flex flex-col gap-6">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <CompassIcon className="size-6" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  404
                </p>
                <h1 className="text-3xl font-semibold tracking-tight">
                  This page does not exist.
                </h1>
                <p className="text-sm leading-6 text-muted-foreground">
                  The route could not be resolved. Return to the translator
                  workspace to continue with text, document, or image translation.
                </p>
              </div>
            </div>

            <div>
              <Button asChild>
                <Link href="/">
                  <HomeIcon className="size-4" />
                  Back to home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
