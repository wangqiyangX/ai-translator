"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";
import { Separator } from "@/components/ui/separator";
import { Check, Clipboard, Download, Languages } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useTranslatorRuntimeStore, useTranslatorSettingsStore } from "./store";

interface DocumentTabProps {
  onTranslate: () => void;
}

export function DocumentTab({ onTranslate }: DocumentTabProps) {
  const selectedDocuments = useTranslatorRuntimeStore((state) => state.selectedDocuments);
  const translatedFileContent = useTranslatorRuntimeStore(
    (state) => state.translatedFileContent
  );
  const selectedDocumentContent = useTranslatorRuntimeStore(
    (state) => state.selectedDocumentContent
  );
  const isTranslatingFile = useTranslatorRuntimeStore((state) => state.isTranslatingFile);
  const isCopied = useTranslatorRuntimeStore((state) => state.isCopied);
  const setIsCopied = useTranslatorRuntimeStore((state) => state.setIsCopied);
  const setSelectedDocuments = useTranslatorRuntimeStore(
    (state) => state.setSelectedDocuments
  );
  const setSelectedDocumentContent = useTranslatorRuntimeStore(
    (state) => state.setSelectedDocumentContent
  );
  const targetLang = useTranslatorSettingsStore((state) => state.targetLang);

  const handleCopy = () => {
    if (!translatedFileContent) return;
    void navigator.clipboard.writeText(translatedFileContent);
    setIsCopied(true);
  };

  const handleDownload = () => {
    if (!translatedFileContent || !selectedDocuments) return;

    const blob = new Blob([translatedFileContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const originalName = selectedDocuments[0].name;
    const extension = originalName.substring(originalName.lastIndexOf("."));
    a.download = `${originalName.replace(extension, "")}-${targetLang}${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Dropzone
        accept={{
          "text/mdx": [".mdx"],
          "text/markdown": [".md", ".markdown"],
          "text/plain": [".txt"],
        }}
        maxFiles={1}
        onDrop={setSelectedDocuments}
        onError={console.error}
        src={selectedDocuments}
        className="min-h-[140px]"
      >
        <DropzoneEmptyState />
        <DropzoneContent />
      </Dropzone>

      {selectedDocuments && (
        <>
          <Separator className="my-4" />
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="file-translation">Translated Content</Label>
              <div className="flex gap-2 items-center">
                {translatedFileContent ? (
                  <>
                    <Button
                      onClick={handleCopy}
                      size="sm"
                      disabled={translatedFileContent.length === 0}
                    >
                      {isCopied ? (
                        <>
                          <Check className="h-4 w-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Clipboard className="h-4 w-4" />
                          Copy
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleDownload}
                      variant="outline"
                      size="sm"
                      disabled={translatedFileContent.length === 0}
                    >
                      <Download />
                    </Button>
                    <Button
                      onClick={onTranslate}
                      variant="outline"
                      size="sm"
                      disabled={isTranslatingFile || !selectedDocuments}
                    >
                      {isTranslatingFile ? <Spinner /> : <Languages />}
                    </Button>
                  </>
                ) : (
                  <Button onClick={onTranslate} disabled={isTranslatingFile || !selectedDocuments} size="sm">
                    {isTranslatingFile ? (
                      <>
                        <Spinner className="size-4" />
                        Translating...
                      </>
                    ) : (
                      <>
                        <Languages />
                        Translate
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-2 min-h-[140px]">
              <Textarea
                id="file-raw-content"
                value={selectedDocumentContent}
                onChange={(e) => setSelectedDocumentContent(e.target.value)}
                className="h-full min-h-[400px] resize-none font-mono text-sm"
              />
              <Textarea
                id="file-translated-content"
                value={translatedFileContent}
                readOnly
                className="h-full min-h-[400px] resize-none bg-muted/50 font-mono text-sm"
              />
            </div>
            <p className="text-sm text-muted-foreground">{translatedFileContent.length} characters</p>
          </div>
        </>
      )}
    </>
  );
}
