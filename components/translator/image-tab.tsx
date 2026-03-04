"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useTranslatorRuntimeStore } from "./store";

interface ImageTabProps {
  onTranslate: () => void;
}

export function ImageTab({ onTranslate }: ImageTabProps) {
  const selectedImages = useTranslatorRuntimeStore((state) => state.selectedImages);
  const preview = useTranslatorRuntimeStore((state) => state.preview);
  const translatedImageContent = useTranslatorRuntimeStore(
    (state) => state.translatedImageContent
  );
  const isTranslatingImage = useTranslatorRuntimeStore((state) => state.isTranslatingImage);
  const setSelectedImages = useTranslatorRuntimeStore((state) => state.setSelectedImages);
  const setTranslatedImageContent = useTranslatorRuntimeStore(
    (state) => state.setTranslatedImageContent
  );
  const setPreview = useTranslatorRuntimeStore((state) => state.setPreview);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleDropImages = (files: File[]) => {
    setSelectedImages(files);
    setTranslatedImageContent("");
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    const imageUrl = URL.createObjectURL(files[0]);
    setPreview(imageUrl);
  };

  return (
    <>
      <Dropzone
        accept={{ "image/*": [] }}
        maxFiles={1}
        onDrop={handleDropImages}
        onError={console.error}
        src={selectedImages}
        className="min-h-[140px]"
      >
        <DropzoneEmptyState />
        <DropzoneContent />
      </Dropzone>
      <div className="space-y-2">
        {preview && (
          <>
            <Separator className="my-4" />
            <div className="flex gap-2 items-center">
              <div className="border border-border rounded-md w-full h-[200px] overflow-hidden flex items-center justify-center p-4">
                <Image
                  src={preview || "/placeholder.svg"}
                  width={400}
                  height={300}
                  alt="Selected image"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <Button
                size="icon-sm"
                onClick={onTranslate}
                disabled={isTranslatingImage || !selectedImages?.[0]}
              >
                {isTranslatingImage ? <Spinner className="size-4" /> : <ArrowRight className="min-w-8" />}
              </Button>
              <div className="border border-border rounded-md w-full h-[200px] p-3">
                <Textarea
                  value={translatedImageContent}
                  readOnly
                  placeholder="Translated text will appear here..."
                  className="h-full resize-none bg-muted/50 text-sm"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
