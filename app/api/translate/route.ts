import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { NextResponse } from "next/server"
import { guardApiRoute } from "@/lib/api-security"

export const maxDuration = 30

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  ru: "Russian",
  ja: "Japanese",
  ko: "Korean",
  zh: "Chinese",
  ar: "Arabic",
  hi: "Hindi",
}

interface TokenUsage {
  inputTokens: number
  outputTokens: number
  totalTokens: number
}

function normalizeTokenUsage(usage: Partial<TokenUsage> | undefined): TokenUsage {
  return {
    inputTokens: usage?.inputTokens ?? 0,
    outputTokens: usage?.outputTokens ?? 0,
    totalTokens: usage?.totalTokens ?? 0,
  }
}

export async function POST(req: Request) {
  try {
    const { text, sourceLang, targetLang, apiKey, baseUrl, model = "gpt-4o-mini" } = await req.json()

    if (!text || !sourceLang || !targetLang) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const guard = guardApiRoute({
      headers: req.headers,
      apiKey,
      routeKey: "translate",
      ipLimitPerMinute: 100,
      userLimitPerMinute: 200,
    })
    if (!guard.ok) return guard.response

    const sourceLangName = LANGUAGE_NAMES[sourceLang] || sourceLang
    const targetLangName = LANGUAGE_NAMES[targetLang] || targetLang

    const prompt = `Translate the following text from ${sourceLangName} to ${targetLangName}. Only provide the translation, no explanations or additional text.

Text to translate:
${text}`

    const { text: translatedText, usage } = await generateText({
      model: apiKey
        ? createOpenAI({
            apiKey,
            baseURL: baseUrl || undefined,
          })(model)
        : `openai/${model}`,
      prompt,
      maxOutputTokens: 2000,
      temperature: 0.3,
    })

    return NextResponse.json({
      translatedText,
      tokenUsage: normalizeTokenUsage(usage),
    })
  } catch (error) {
    console.error("Translation error:", error)
    return NextResponse.json(
      { error: "Translation failed. Please check your API settings and try again." },
      { status: 500 },
    )
  }
}
