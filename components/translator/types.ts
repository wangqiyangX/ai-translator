export interface ApiConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  customPrompt: string;
  outputMode: "translation-only" | "bilingual";
  autoDetectSourceLanguage: boolean;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface TokenStats extends TokenUsage {
  requests: number;
}

export type ApiStatus = "idle" | "checking" | "available" | "unavailable";
export type OutputMode = ApiConfig["outputMode"];

export interface LanguageOption {
  code: string;
  name: string;
}

export interface ModelOption {
  value: string;
  label: string;
  provider: string;
}
