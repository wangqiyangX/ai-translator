"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRightLeft } from "lucide-react";
import { LANGUAGES } from "./constants";
import { useTranslatorRuntimeStore, useTranslatorSettingsStore } from "./store";

export function LanguageControls() {
  const sourceLang = useTranslatorSettingsStore((state) => state.sourceLang);
  const targetLang = useTranslatorSettingsStore((state) => state.targetLang);
  const setSourceLang = useTranslatorSettingsStore((state) => state.setSourceLang);
  const setTargetLang = useTranslatorSettingsStore((state) => state.setTargetLang);
  const sourceText = useTranslatorRuntimeStore((state) => state.sourceText);
  const translatedText = useTranslatorRuntimeStore((state) => state.translatedText);
  const setSourceText = useTranslatorRuntimeStore((state) => state.setSourceText);
  const setTranslatedText = useTranslatorRuntimeStore((state) => state.setTranslatedText);
  const isTranslating = useTranslatorRuntimeStore((state) => state.isTranslating);

  const languages = useMemo(() => LANGUAGES, []);

  const handleSwap = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  return (
    <div className="flex gap-1 my-2">
      <Select value={sourceLang} onValueChange={setSourceLang}>
        <SelectTrigger id="source-lang" className="w-full" size="sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <span className="flex items-center gap-2">
                <span>{lang.name}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button onClick={handleSwap} variant="ghost" size="sm" disabled={isTranslating}>
        <ArrowRightLeft className="h-4 w-4" />
      </Button>

      <Select value={targetLang} onValueChange={setTargetLang}>
        <SelectTrigger id="target-lang" className="w-full" size="sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <span className="flex items-center gap-2">
                <span>{lang.name}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
