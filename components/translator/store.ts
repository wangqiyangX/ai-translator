"use client";

import { create } from "zustand";
import type { SetStateAction } from "react";
import type { ApiConfig, ApiStatus, TokenStats, TokenUsage } from "./types";

const DEFAULT_MODEL = "gpt-4o-mini";

const DEFAULT_API_CONFIG: ApiConfig = {
  apiKey: "",
  baseUrl: "",
  model: DEFAULT_MODEL,
  customPrompt: "",
  outputMode: "translation-only",
  autoDetectSourceLanguage: true,
};

const EMPTY_TOKEN_STATS: TokenStats = {
  requests: 0,
  inputTokens: 0,
  outputTokens: 0,
  totalTokens: 0,
};

interface TranslatorSettingsState {
  sourceLang: string;
  targetLang: string;
  apiConfig: ApiConfig;
  tempApiConfig: ApiConfig;
  customModelName: string;
  dialogOpen: boolean;
  setSourceLang: (value: string) => void;
  setTargetLang: (value: string) => void;
  setApiConfig: (updater: SetStateAction<ApiConfig>) => void;
  setTempApiConfig: (updater: SetStateAction<ApiConfig>) => void;
  setCustomModelName: (updater: SetStateAction<string>) => void;
  setDialogOpen: (open: boolean) => void;
}

export const useTranslatorSettingsStore = create<TranslatorSettingsState>((set) => ({
  sourceLang: "en",
  targetLang: "zh",
  apiConfig: DEFAULT_API_CONFIG,
  tempApiConfig: DEFAULT_API_CONFIG,
  customModelName: "",
  dialogOpen: false,
  setSourceLang: (value) => set({ sourceLang: value }),
  setTargetLang: (value) => set({ targetLang: value }),
  setApiConfig: (updater) =>
    set((state) => ({
      apiConfig: typeof updater === "function" ? updater(state.apiConfig) : updater,
    })),
  setTempApiConfig: (updater) =>
    set((state) => ({
      tempApiConfig:
        typeof updater === "function" ? updater(state.tempApiConfig) : updater,
    })),
  setCustomModelName: (updater) =>
    set((state) => ({
      customModelName:
        typeof updater === "function"
          ? updater(state.customModelName)
          : updater,
    })),
  setDialogOpen: (open) => set({ dialogOpen: open }),
}));

interface TranslatorRuntimeState {
  sourceText: string;
  translatedText: string;
  isTranslating: boolean;
  isCopied: boolean;
  selectedDocuments: File[] | undefined;
  selectedImages: File[] | undefined;
  preview: string | null;
  translatedFileContent: string;
  isTranslatingFile: boolean;
  translatedImageContent: string;
  isTranslatingImage: boolean;
  selectedDocumentContent: string;
  apiStatus: ApiStatus;
  apiStatusMessage: string;
  apiDetailsExpanded: boolean;
  tokenStats: TokenStats;
  setSourceText: (updater: SetStateAction<string>) => void;
  setTranslatedText: (updater: SetStateAction<string>) => void;
  setIsTranslating: (updater: SetStateAction<boolean>) => void;
  setIsCopied: (updater: SetStateAction<boolean>) => void;
  setSelectedDocuments: (updater: SetStateAction<File[] | undefined>) => void;
  setSelectedImages: (updater: SetStateAction<File[] | undefined>) => void;
  setPreview: (updater: SetStateAction<string | null>) => void;
  setTranslatedFileContent: (updater: SetStateAction<string>) => void;
  setIsTranslatingFile: (updater: SetStateAction<boolean>) => void;
  setTranslatedImageContent: (updater: SetStateAction<string>) => void;
  setIsTranslatingImage: (updater: SetStateAction<boolean>) => void;
  setSelectedDocumentContent: (updater: SetStateAction<string>) => void;
  setApiStatus: (status: ApiStatus) => void;
  setApiStatusMessage: (message: string) => void;
  setApiDetailsExpanded: (updater: SetStateAction<boolean>) => void;
  setTokenStats: (updater: SetStateAction<TokenStats>) => void;
  addTokenUsage: (usage?: Partial<TokenUsage>) => void;
}

export const useTranslatorRuntimeStore = create<TranslatorRuntimeState>((set) => ({
  sourceText: "",
  translatedText: "",
  isTranslating: false,
  isCopied: false,
  selectedDocuments: undefined,
  selectedImages: undefined,
  preview: null,
  translatedFileContent: "",
  isTranslatingFile: false,
  translatedImageContent: "",
  isTranslatingImage: false,
  selectedDocumentContent: "",
  apiStatus: "idle",
  apiStatusMessage: "",
  apiDetailsExpanded: false,
  tokenStats: EMPTY_TOKEN_STATS,
  setSourceText: (updater) =>
    set((state) => ({
      sourceText:
        typeof updater === "function" ? updater(state.sourceText) : updater,
    })),
  setTranslatedText: (updater) =>
    set((state) => ({
      translatedText:
        typeof updater === "function" ? updater(state.translatedText) : updater,
    })),
  setIsTranslating: (updater) =>
    set((state) => ({
      isTranslating:
        typeof updater === "function" ? updater(state.isTranslating) : updater,
    })),
  setIsCopied: (updater) =>
    set((state) => ({
      isCopied: typeof updater === "function" ? updater(state.isCopied) : updater,
    })),
  setSelectedDocuments: (updater) =>
    set((state) => ({
      selectedDocuments:
        typeof updater === "function"
          ? updater(state.selectedDocuments)
          : updater,
    })),
  setSelectedImages: (updater) =>
    set((state) => ({
      selectedImages:
        typeof updater === "function" ? updater(state.selectedImages) : updater,
    })),
  setPreview: (updater) =>
    set((state) => ({
      preview: typeof updater === "function" ? updater(state.preview) : updater,
    })),
  setTranslatedFileContent: (updater) =>
    set((state) => ({
      translatedFileContent:
        typeof updater === "function"
          ? updater(state.translatedFileContent)
          : updater,
    })),
  setIsTranslatingFile: (updater) =>
    set((state) => ({
      isTranslatingFile:
        typeof updater === "function"
          ? updater(state.isTranslatingFile)
          : updater,
    })),
  setTranslatedImageContent: (updater) =>
    set((state) => ({
      translatedImageContent:
        typeof updater === "function"
          ? updater(state.translatedImageContent)
          : updater,
    })),
  setIsTranslatingImage: (updater) =>
    set((state) => ({
      isTranslatingImage:
        typeof updater === "function"
          ? updater(state.isTranslatingImage)
          : updater,
    })),
  setSelectedDocumentContent: (updater) =>
    set((state) => ({
      selectedDocumentContent:
        typeof updater === "function"
          ? updater(state.selectedDocumentContent)
          : updater,
    })),
  setApiStatus: (status) => set({ apiStatus: status }),
  setApiStatusMessage: (message) => set({ apiStatusMessage: message }),
  setApiDetailsExpanded: (updater) =>
    set((state) => ({
      apiDetailsExpanded:
        typeof updater === "function"
          ? updater(state.apiDetailsExpanded)
          : updater,
    })),
  setTokenStats: (updater) =>
    set((state) => ({
      tokenStats:
        typeof updater === "function" ? updater(state.tokenStats) : updater,
    })),
  addTokenUsage: (usage) =>
    set((state) => {
      if (!usage) return state;

      const inputTokens = usage.inputTokens ?? 0;
      const outputTokens = usage.outputTokens ?? 0;
      const totalTokens = usage.totalTokens ?? inputTokens + outputTokens;

      if (inputTokens === 0 && outputTokens === 0 && totalTokens === 0) {
        return state;
      }

      return {
        tokenStats: {
          requests: state.tokenStats.requests + 1,
          inputTokens: state.tokenStats.inputTokens + inputTokens,
          outputTokens: state.tokenStats.outputTokens + outputTokens,
          totalTokens: state.tokenStats.totalTokens + totalTokens,
        },
      };
    }),
}));
