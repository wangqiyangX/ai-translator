"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, Clipboard } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useTranslatorRuntimeStore } from "./store";

export function TextTab() {
  const sourceText = useTranslatorRuntimeStore((state) => state.sourceText);
  const translatedText = useTranslatorRuntimeStore((state) => state.translatedText);
  const isTranslating = useTranslatorRuntimeStore((state) => state.isTranslating);
  const isCopied = useTranslatorRuntimeStore((state) => state.isCopied);
  const setSourceText = useTranslatorRuntimeStore((state) => state.setSourceText);
  const setIsCopied = useTranslatorRuntimeStore((state) => state.setIsCopied);

  const handleCopy = () => {
    if (!translatedText) return;
    void navigator.clipboard.writeText(translatedText);
    setIsCopied(true);
  };

  return (
    <div className="grid md:grid-cols-2 gap-2 min-h-[140px]">
      <Textarea
        id="source-text"
        placeholder="Enter text to translate..."
        value={sourceText}
        onChange={(e) => setSourceText(e.target.value)}
        className="resize-none rounded-lg h-[240px]"
      />

      <div className="relative h-[240px]">
        <Button
          variant="outline"
          onClick={handleCopy}
          size="sm"
          disabled={translatedText.length === 0 || isTranslating}
          className="absolute top-2 right-2 z-10"
        >
          {isCopied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
        </Button>
        <Textarea
          id="translated-text"
          placeholder="Translation will appear here..."
          value={translatedText}
          readOnly
          className="resize-none bg-muted/50 rounded-lg h-full"
        />
        {isTranslating && (
          <div className="absolute inset-0 rounded-lg bg-background/65 backdrop-blur-[1px] flex items-center justify-center">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Spinner className="size-4" />
              <span>Thinking...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
