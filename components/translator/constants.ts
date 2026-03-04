import type { LanguageOption, ModelOption } from "./types";

export const LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
];

export const MODELS: ModelOption[] = [
  { value: "gpt-5.2", label: "GPT-5.2", provider: "OpenAI" },
  { value: "gpt-5.1", label: "GPT-5.1", provider: "OpenAI" },
  {
    value: "claude-opus-4-5-20251101",
    label: "Claude Opus 4.5",
    provider: "Anthropic",
  },
  {
    value: "claude-sonnet-4-5-20250929",
    label: "Claude Sonnet 4.5",
    provider: "Anthropic",
  },
  {
    value: "claude-haiku-4-5-20251001",
    label: "Claude Haiku 4.5",
    provider: "Anthropic",
  },
  {
    value: "gemini-3-pro-preview",
    label: "Gemini 3 Pro Preview",
    provider: "Google",
  },
  {
    value: "gemini-2.5-pro",
    label: "Gemini 2.5 Pro",
    provider: "Google",
  },
  { value: "custom", label: "Custom", provider: "Custom" },
];
