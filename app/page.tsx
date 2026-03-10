import TranslatorApp from "@/components/translator-app";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8">
        <div className="max-w-3xl space-y-3">
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              AI translation for text, Markdown, and images.
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Bring your own API key, switch models, and translate content
              through server-side route handlers without exposing provider
              credentials in the browser.
            </p>
          </div>
        </div>

        <TranslatorApp />
      </section>
    </main>
  );
}
