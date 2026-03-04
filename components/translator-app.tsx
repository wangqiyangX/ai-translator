"use client";

import { useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  FileText,
  ImageIcon,
  TextIcon,
  Globe,
  GithubIcon,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModeToggle } from "./mode-toggle";
import Link from "next/link";
import { LANGUAGES, MODELS } from "./translator/constants";
import { SettingsDialog } from "./translator/settings-dialog";
import { LanguageControls } from "./translator/language-controls";
import { TextTab } from "./translator/text-tab";
import { DocumentTab } from "./translator/document-tab";
import { ImageTab } from "./translator/image-tab";
import { ApiStatusCard } from "./translator/api-status-card";
import type { ApiConfig, OutputMode, TokenStats } from "./translator/types";
import { useTranslatorRuntimeStore, useTranslatorSettingsStore } from "./translator/store";

const STORAGE_KEY = "ai-translator-config";
const TOKEN_STATS_STORAGE_KEY = "ai-translator-token-stats";
const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_SOURCE_LANG = "en";
const NO_API_CONFIG_MESSAGE =
  "No custom API configured. Enter an API key to test API availability.";
const TEXT_DETECT_DEBOUNCE_MS = 800;
const LANG_CHANGE_TRANSLATE_DEBOUNCE_MS = 300;

function isPresetModel(model: string) {
  return MODELS.some((m) => m.value === model && m.value !== "custom");
}

function normalizeApiConfig(parsed: Partial<ApiConfig>): ApiConfig {
  return {
    apiKey: parsed.apiKey ?? "",
    baseUrl: parsed.baseUrl ?? "",
    model: parsed.model ?? DEFAULT_MODEL,
    customPrompt: parsed.customPrompt ?? "",
    outputMode: parsed.outputMode === "bilingual" ? "bilingual" : "translation-only",
    autoDetectSourceLanguage: parsed.autoDetectSourceLanguage ?? true,
  };
}

function toDialogModelState(config: ApiConfig) {
  if (!isPresetModel(config.model) && config.model) {
    return {
      tempConfig: { ...config, model: "custom" },
      customModelName: config.model,
    };
  }

  return {
    tempConfig: config,
    customModelName: "",
  };
}

function createTranslationFormData(params: {
  file: File;
  sourceLang: string;
  targetLang: string;
  model: string;
  customPrompt: string;
  outputMode: OutputMode;
  apiKey: string;
  baseUrl: string;
  textContent?: string;
}) {
  const formData = new FormData();
  formData.append("file", params.file);
  if (typeof params.textContent === "string") {
    formData.append("textContent", params.textContent);
  }
  formData.append("sourceLang", params.sourceLang);
  formData.append("targetLang", params.targetLang);
  formData.append("model", params.model);
  formData.append("customPrompt", params.customPrompt);
  formData.append("outputMode", params.outputMode);

  if (params.apiKey) formData.append("apiKey", params.apiKey);
  if (params.baseUrl) formData.append("baseUrl", params.baseUrl);

  return formData;
}

function toErrorText(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function TranslatorApp() {
  const sourceText = useTranslatorRuntimeStore((state) => state.sourceText);
  const isCopied = useTranslatorRuntimeStore((state) => state.isCopied);
  const selectedDocuments = useTranslatorRuntimeStore((state) => state.selectedDocuments);
  const selectedImages = useTranslatorRuntimeStore((state) => state.selectedImages);
  const selectedDocumentContent = useTranslatorRuntimeStore(
    (state) => state.selectedDocumentContent
  );
  const setTranslatedText = useTranslatorRuntimeStore((state) => state.setTranslatedText);
  const setIsTranslating = useTranslatorRuntimeStore((state) => state.setIsTranslating);
  const setIsCopied = useTranslatorRuntimeStore((state) => state.setIsCopied);
  const setTranslatedFileContent = useTranslatorRuntimeStore(
    (state) => state.setTranslatedFileContent
  );
  const setIsTranslatingFile = useTranslatorRuntimeStore(
    (state) => state.setIsTranslatingFile
  );
  const setTranslatedImageContent = useTranslatorRuntimeStore(
    (state) => state.setTranslatedImageContent
  );
  const setIsTranslatingImage = useTranslatorRuntimeStore(
    (state) => state.setIsTranslatingImage
  );
  const setSelectedDocumentContent = useTranslatorRuntimeStore(
    (state) => state.setSelectedDocumentContent
  );
  const sourceLang = useTranslatorSettingsStore((state) => state.sourceLang);
  const targetLang = useTranslatorSettingsStore((state) => state.targetLang);
  const setSourceLang = useTranslatorSettingsStore((state) => state.setSourceLang);
  const setTargetLang = useTranslatorSettingsStore((state) => state.setTargetLang);

  const textTranslateAbortRef = useRef<AbortController | null>(null);
  const textRequestIdRef = useRef(0);
  const languageDetectAbortRef = useRef<AbortController | null>(null);
  const detectRequestIdRef = useRef(0);
  const sourceLangRef = useRef(sourceLang);
  const skipNextLangChangeTranslateRef = useRef(false);

  const apiConfig = useTranslatorSettingsStore((state) => state.apiConfig);
  const dialogOpen = useTranslatorSettingsStore((state) => state.dialogOpen);
  const setApiConfig = useTranslatorSettingsStore((state) => state.setApiConfig);
  const setTempApiConfig = useTranslatorSettingsStore((state) => state.setTempApiConfig);
  const setCustomModelName = useTranslatorSettingsStore((state) => state.setCustomModelName);
  const tokenStats = useTranslatorRuntimeStore((state) => state.tokenStats);
  const setApiStatus = useTranslatorRuntimeStore((state) => state.setApiStatus);
  const setApiStatusMessage = useTranslatorRuntimeStore((state) => state.setApiStatusMessage);
  const setTokenStats = useTranslatorRuntimeStore((state) => state.setTokenStats);
  const addTokenUsage = useTranslatorRuntimeStore((state) => state.addTokenUsage);

  useEffect(() => {
    const savedConfig = localStorage.getItem(STORAGE_KEY);
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig) as Partial<ApiConfig>;
        const normalizedConfig = normalizeApiConfig(parsed);
        setApiConfig(normalizedConfig);
        const dialogState = toDialogModelState(normalizedConfig);
        setCustomModelName(dialogState.customModelName);
        setTempApiConfig(dialogState.tempConfig);
      } catch (error) {
        console.error("Failed to parse saved config:", error);
      }
    }
  }, [setApiConfig, setCustomModelName, setTempApiConfig]);

  useEffect(() => {
    if (
      apiConfig.apiKey ||
      apiConfig.baseUrl ||
      apiConfig.model !== DEFAULT_MODEL ||
      apiConfig.customPrompt ||
      apiConfig.outputMode !== "translation-only" ||
      !apiConfig.autoDetectSourceLanguage
    ) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(apiConfig));
    }
  }, [apiConfig]);

  useEffect(() => {
    const savedTokenStats = localStorage.getItem(TOKEN_STATS_STORAGE_KEY);
    if (!savedTokenStats) return;

    try {
      const parsed = JSON.parse(savedTokenStats) as Partial<TokenStats>;
      setTokenStats({
        requests: parsed.requests ?? 0,
        inputTokens: parsed.inputTokens ?? 0,
        outputTokens: parsed.outputTokens ?? 0,
        totalTokens: parsed.totalTokens ?? 0,
      });
    } catch (error) {
      console.error("Failed to parse saved token stats:", error);
    }
  }, [setTokenStats]);

  useEffect(() => {
    localStorage.setItem(TOKEN_STATS_STORAGE_KEY, JSON.stringify(tokenStats));
  }, [tokenStats]);

  // Sync tempApiConfig when dialog opens
  useEffect(() => {
    if (dialogOpen) {
      const dialogState = toDialogModelState(apiConfig);
      setTempApiConfig(dialogState.tempConfig);
      setCustomModelName(dialogState.customModelName);
    }
  }, [dialogOpen, apiConfig, setCustomModelName, setTempApiConfig]);

  useEffect(() => {
    sourceLangRef.current = sourceLang;
  }, [sourceLang]);

  const abortInFlightTextRequests = useCallback(() => {
    textTranslateAbortRef.current?.abort();
    languageDetectAbortRef.current?.abort();
  }, []);

  const handleTranslate = useCallback(
    async (sourceLangOverride?: string, targetLangOverride?: string) => {
      const requestSourceLang = sourceLangOverride || sourceLang;
      const requestTargetLang = targetLangOverride || targetLang;

      if (!sourceText.trim()) {
        textTranslateAbortRef.current?.abort();
        setTranslatedText("");
        setIsTranslating(false);
        return;
      }

      if (!apiConfig.apiKey.trim()) {
        setTranslatedText("Error: Please configure your API key in Settings.");
        setIsTranslating(false);
        return;
      }

      textTranslateAbortRef.current?.abort();
      const controller = new AbortController();
      textTranslateAbortRef.current = controller;
      const requestId = ++textRequestIdRef.current;

      setIsTranslating(true);

      try {
        const response = await fetch("/api/translate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
          body: JSON.stringify({
            text: sourceText,
            sourceLang: requestSourceLang,
            targetLang: requestTargetLang,
            apiKey: apiConfig.apiKey || undefined,
            baseUrl: apiConfig.baseUrl || undefined,
            model: apiConfig.model,
            customPrompt: apiConfig.customPrompt || undefined,
            outputMode: apiConfig.outputMode,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Translation failed");
        }

        const data = await response.json();
        if (requestId === textRequestIdRef.current) {
          setTranslatedText(data.translatedText);
          addTokenUsage(data.tokenUsage);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        console.error("Translation error:", error);
        if (requestId === textRequestIdRef.current) {
          setTranslatedText(
            `Error: ${toErrorText(error, "Translation failed. Please try again.")}`
          );
        }
      } finally {
        if (requestId === textRequestIdRef.current) {
          setIsTranslating(false);
        }
      }
    }, [
    addTokenUsage,
    sourceText,
    sourceLang,
    targetLang,
    apiConfig.apiKey,
    apiConfig.baseUrl,
    apiConfig.model,
    apiConfig.customPrompt,
    apiConfig.outputMode,
    setTranslatedText,
    setIsTranslating,
  ]);

  const detectSourceLanguage = useCallback(
    async (text: string) => {
      const trimmedText = text.trim();
      if (!trimmedText) return null;
      if (!apiConfig.apiKey.trim()) return null;

      languageDetectAbortRef.current?.abort();
      const controller = new AbortController();
      languageDetectAbortRef.current = controller;
      const requestId = ++detectRequestIdRef.current;

      try {
        const response = await fetch("/api/detect-language", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
          body: JSON.stringify({
            text: trimmedText,
            apiKey: apiConfig.apiKey || undefined,
            baseUrl: apiConfig.baseUrl || undefined,
            model: apiConfig.model,
            customPrompt: apiConfig.customPrompt || undefined,
          }),
        });

        if (!response.ok) {
          return null;
        }

        const data = await response.json();
        addTokenUsage(data.tokenUsage);
        if (requestId !== detectRequestIdRef.current) return null;
        return typeof data.language === "string" ? data.language : null;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return null;
        }
        return null;
      }
    },
    [
      addTokenUsage,
      apiConfig.apiKey,
      apiConfig.baseUrl,
      apiConfig.model,
      apiConfig.customPrompt,
    ]
  );

  useEffect(() => {
    if (!sourceText.trim()) {
      abortInFlightTextRequests();
      setTranslatedText("");
      setIsTranslating(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      void (async () => {
        if (!apiConfig.autoDetectSourceLanguage) {
          await handleTranslate();
          return;
        }

        const detectedLanguage = await detectSourceLanguage(sourceText);

        if (detectedLanguage && detectedLanguage !== sourceLangRef.current) {
          const previousSourceLang = sourceLangRef.current;
          const nextTargetLang =
            detectedLanguage === targetLang
              ? previousSourceLang !== detectedLanguage
                ? previousSourceLang
                : LANGUAGES.find((lang) => lang.code !== detectedLanguage)?.code ||
                DEFAULT_SOURCE_LANG
              : targetLang;

          skipNextLangChangeTranslateRef.current = true;
          setSourceLang(detectedLanguage);
          if (nextTargetLang !== targetLang) {
            setTargetLang(nextTargetLang);
          }
          await handleTranslate(detectedLanguage, nextTargetLang);
          return;
        }

        await handleTranslate();
      })();
    }, TEXT_DETECT_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [
    sourceText,
    targetLang,
    apiConfig.autoDetectSourceLanguage,
    detectSourceLanguage,
    handleTranslate,
    abortInFlightTextRequests,
    setSourceLang,
    setTargetLang,
    setTranslatedText,
    setIsTranslating,
  ]);

  useEffect(() => {
    if (!sourceText.trim()) return;

    if (skipNextLangChangeTranslateRef.current) {
      skipNextLangChangeTranslateRef.current = false;
      return;
    }

    const timeoutId = setTimeout(() => {
      void handleTranslate();
    }, LANG_CHANGE_TRANSLATE_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [sourceLang, targetLang, sourceText, handleTranslate]);

  useEffect(() => {
    return () => {
      abortInFlightTextRequests();
    };
  }, [abortInFlightTextRequests]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      abortInFlightTextRequests();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [abortInFlightTextRequests]);

  const handleFileTranslate = async () => {
    if (!selectedDocuments?.[0]) return;
    if (!apiConfig.apiKey.trim()) {
      setTranslatedFileContent("Error: Please configure your API key in Settings.");
      return;
    }

    setIsTranslatingFile(true);
    setTranslatedFileContent("");

    try {
      const formData = createTranslationFormData({
        file: selectedDocuments[0],
        textContent: selectedDocumentContent,
        sourceLang,
        targetLang,
        model: apiConfig.model,
        customPrompt: apiConfig.customPrompt,
        outputMode: apiConfig.outputMode,
        apiKey: apiConfig.apiKey,
        baseUrl: apiConfig.baseUrl,
      });

      const response = await fetch("/api/translate-file", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "File translation failed");
      }

      const data = await response.json();
      setTranslatedFileContent(data.translatedContent);
      addTokenUsage(data.tokenUsage);
    } catch (error) {
      console.error("File translation error:", error);
      setTranslatedFileContent(
        `Error: ${toErrorText(error, "File translation failed. Please try again.")}`
      );
    } finally {
      setIsTranslatingFile(false);
    }
  };

  const handleImageTranslate = async () => {
    if (!selectedImages?.[0]) return;
    if (!apiConfig.apiKey.trim()) {
      setTranslatedImageContent("Error: Please configure your API key in Settings.");
      return;
    }

    setIsTranslatingImage(true);
    setTranslatedImageContent("");

    try {
      const formData = createTranslationFormData({
        file: selectedImages[0],
        sourceLang,
        targetLang,
        model: apiConfig.model,
        customPrompt: apiConfig.customPrompt,
        outputMode: apiConfig.outputMode,
        apiKey: apiConfig.apiKey,
        baseUrl: apiConfig.baseUrl,
      });

      const response = await fetch("/api/translate-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Image translation failed");
      }

      const data = await response.json();
      setTranslatedImageContent(data.translatedText || "");
      addTokenUsage(data.tokenUsage);
    } catch (error) {
      console.error("Image translation error:", error);
      setTranslatedImageContent(
        `Error: ${toErrorText(error, "Image translation failed. Please try again.")}`
      );
    } finally {
      setIsTranslatingImage(false);
    }
  };

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [isCopied, setIsCopied]);

  useEffect(() => {
    setTranslatedFileContent("");
    const loadDocumentContent = async () => {
      const content = (await selectedDocuments?.[0].text()) ?? "";
      setSelectedDocumentContent(content);
    };
    loadDocumentContent();
  }, [selectedDocuments, setSelectedDocumentContent, setTranslatedFileContent]);

  const checkApiAvailability = useCallback(async () => {
    if (!apiConfig.apiKey) {
      setApiStatus("idle");
      setApiStatusMessage(NO_API_CONFIG_MESSAGE);
      return;
    }

    setApiStatus("checking");
    setApiStatusMessage("Checking API availability...");

    try {
      // Use /api/models endpoint to check availability without consuming tokens
      const response = await fetch("/api/models", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: apiConfig.apiKey || undefined,
          baseUrl: apiConfig.baseUrl || undefined,
          model: apiConfig.model,
        }),
      });

      const data = await response.json();

      if (response.ok && data.available) {
        setApiStatus("available");
        setApiStatusMessage(
          data.message || "API is available and working correctly"
        );
      } else {
        setApiStatus("unavailable");
        setApiStatusMessage(data.error || "API request failed");
      }
    } catch (error) {
      setApiStatus("unavailable");
      setApiStatusMessage(
        error instanceof Error
          ? error.message
          : "Failed to connect to API. Please check your settings."
      );
    }
  }, [
    apiConfig.apiKey,
    apiConfig.baseUrl,
    apiConfig.model,
    setApiStatus,
    setApiStatusMessage,
  ]);

  // Check API availability when config changes
  useEffect(() => {
    if (!apiConfig.apiKey) {
      setApiStatus("idle");
      setApiStatusMessage(NO_API_CONFIG_MESSAGE);
      return;
    }

    if (apiConfig.model) {
      // Debounce the check
      const timeoutId = setTimeout(() => {
        checkApiAvailability();
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [
    apiConfig.model,
    apiConfig.apiKey,
    apiConfig.baseUrl,
    checkApiAvailability,
    setApiStatus,
    setApiStatusMessage,
  ]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Globe className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-balance">AI Translator</h1>
            <p className="text-muted-foreground text-pretty">
              Powered by Vercel AI SDK
            </p>
          </div>
        </div>

        <div className="flex gap-1">
          <ModeToggle />
          <Button variant="ghost" size="icon">
            <Link
              href={"https://github.com/wangqiyangX/ai-translator"}
              target="_blank"
            >
              <GithubIcon className="size-4" />
            </Link>
          </Button>
          <SettingsDialog />
        </div>
      </div>

      <Tabs defaultValue="text">
        <div className="md:flex justify-between items-center">
          <TabsList className="my-2">
            <TabsTrigger value="text" className="gap-2">
              <TextIcon className="h-4 w-4" />
              Text
            </TabsTrigger>
            <TabsTrigger value="document" className="gap-2">
              <FileText className="h-4 w-4" />
              Document
            </TabsTrigger>
            <TabsTrigger value="image" className="gap-2">
              <ImageIcon className="h-4 w-4" />
              Image
            </TabsTrigger>
          </TabsList>

          <LanguageControls />
        </div>

        <TabsContent value="text">
          <TextTab />
        </TabsContent>

        <TabsContent value="document">
          <DocumentTab onTranslate={handleFileTranslate} />
        </TabsContent>

        <TabsContent value="image">
          <ImageTab onTranslate={handleImageTranslate} />
        </TabsContent>
      </Tabs>

      <ApiStatusCard />

      <footer className="mt-8 border-t pt-4 pb-2 text-xs text-muted-foreground space-y-1">
        <p>
          Privacy Notice: API keys are stored only in your browser local storage.
          Translation requests are sent through this app&apos;s server API routes
          to your configured model provider.
        </p>
        <p>
          Copyright (c) {new Date().getFullYear()} AI Translator. All rights
          reserved.
        </p>
        <p>
          Built with Next.js, React, Tailwind CSS, shadcn/ui, and Vercel AI SDK.
        </p>
        <p>
          Acknowledgements: OpenAI, Anthropic, Google model ecosystems, Radix UI,
          Lucide Icons, and open-source contributors.
        </p>
      </footer>
    </div>
  );
}
