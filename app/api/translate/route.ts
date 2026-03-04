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

function createAbortSignalWithTimeout(requestSignal: AbortSignal, timeoutMs: number) {
  const controller = new AbortController()
  const timer = setTimeout(() => {
    controller.abort(new Error("Request timeout"))
  }, timeoutMs)

  const handleAbort = () => controller.abort(requestSignal.reason)
  requestSignal.addEventListener("abort", handleAbort, { once: true })

  return {
    signal: controller.signal,
    cleanup: () => {
      clearTimeout(timer)
      requestSignal.removeEventListener("abort", handleAbort)
    },
  }
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
    const {
      text,
      sourceLang,
      targetLang,
      apiKey,
      baseUrl,
      model = "gpt-4o-mini",
      customPrompt,
      outputMode = "translation-only",
    } = await req.json()

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

    const outputInstruction =
      outputMode === "bilingual"
        ? `Return bilingual output in this format:
ORIGINAL:
[original text]

TRANSLATION:
[translated text in ${targetLangName}]`
        : `Only provide the translation in ${targetLangName} (language code: ${targetLang}), with no explanations or additional text.`

    const strictTargetLanguageInstruction = `Target language lock (must follow):
- The translated output MUST be in ${targetLangName} (language code: ${targetLang}).
- Do not use other languages in translated sentences.
- Allowed exceptions: proper nouns, brand/product names, URLs, emails, file paths, and code snippets.
- If the source text is already in ${targetLangName}, return it unchanged (while following the output format).
- Before responding, silently self-check and rewrite any translated sentence that is not in ${targetLangName}.`

    const customInstruction =
      typeof customPrompt === "string" && customPrompt.trim()
        ? `Additional instructions:\n${customPrompt.trim()}\n\n`
        : ""

    const prompt = `Translate the following text from ${sourceLangName} to ${targetLangName}.
${outputInstruction}
${strictTargetLanguageInstruction}

${customInstruction}Text to translate:
${text}`

    const { signal, cleanup } = createAbortSignalWithTimeout(req.signal, 20_000)

    const { text: translatedText, usage } = await generateText({
      model: apiKey
        ? createOpenAI({
            apiKey,
            baseURL: baseUrl || undefined,
          })(model)
        : `openai/${model}`,
      prompt,
      maxOutputTokens: 2000,
      abortSignal: signal,
    }).finally(() => cleanup())

    return NextResponse.json({
      translatedText,
      tokenUsage: normalizeTokenUsage(usage),
    })
  } catch (error) {
    console.error("Translation error:", error)

    if (
      error instanceof Error &&
      (error.name === "AbortError" || error.message === "Request timeout")
    ) {
      return NextResponse.json(
        { error: "Translation request was canceled or timed out." },
        { status: 504 },
      )
    }

    return NextResponse.json(
      { error: "Translation failed. Please check your API settings and try again." },
      { status: 500 },
    )
  }
}
