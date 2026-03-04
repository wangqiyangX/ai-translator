import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { NextResponse } from "next/server"
import { guardApiRoute } from "@/lib/api-security"

export const maxDuration = 15

const SUPPORTED_LANGUAGES = new Set(["en", "es", "fr", "de", "it", "pt", "ru", "ja", "ko", "zh", "ar", "hi"])

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

function normalizeLanguageCode(raw: string) {
  const normalized = raw.trim().toLowerCase().replace(/[^a-z]/g, "")
  return SUPPORTED_LANGUAGES.has(normalized) ? normalized : "en"
}

export async function POST(req: Request) {
  try {
    const { text, apiKey, baseUrl, model = "gpt-4o-mini" } = await req.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    const guard = guardApiRoute({
      headers: req.headers,
      apiKey,
      routeKey: "detect-language",
      ipLimitPerMinute: 120,
      userLimitPerMinute: 240,
    })
    if (!guard.ok) return guard.response

    const prompt = `Identify the primary language of the following text.
Return ONLY one language code from this list:
en, es, fr, de, it, pt, ru, ja, ko, zh, ar, hi

Text:
${text}`

    const { text: detectedRaw, usage } = await generateText({
      model: apiKey
        ? createOpenAI({
            apiKey,
            baseURL: baseUrl || undefined,
          })(model)
        : `openai/${model}`,
      prompt,
      temperature: 0,
      // Some providers enforce a minimum max_output_tokens >= 16.
      maxOutputTokens: 16,
    })

    return NextResponse.json({
      language: normalizeLanguageCode(detectedRaw),
      tokenUsage: normalizeTokenUsage(usage),
    })
  } catch (error) {
    console.error("Language detection error:", error)
    return NextResponse.json(
      { error: "Language detection failed. Please check your API settings and try again." },
      { status: 500 },
    )
  }
}
