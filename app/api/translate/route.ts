import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { NextResponse } from "next/server"

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

export async function POST(req: Request) {
  try {
    const { text, sourceLang, targetLang, apiKey, baseUrl, model = "gpt-4o-mini" } = await req.json()

    if (!text || !sourceLang || !targetLang) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const sourceLangName = LANGUAGE_NAMES[sourceLang] || sourceLang
    const targetLangName = LANGUAGE_NAMES[targetLang] || targetLang

    const prompt = `Translate the following text from ${sourceLangName} to ${targetLangName}. Only provide the translation, no explanations or additional text.

Text to translate:
${text}`

    let aiModel: any

    if (apiKey) {
      // Custom API key provided - create OpenAI provider with custom config
      const customOpenAI = createOpenAI({
        apiKey: apiKey,
        baseURL: baseUrl || undefined,
      })
      aiModel = customOpenAI(model)
    } else {
      // Use Vercel AI Gateway (no API key needed)
      aiModel = `openai/${model}`
    }

    const { text: translatedText } = await generateText({
      model: aiModel,
      prompt,
      maxOutputTokens: 2000,
      temperature: 0.3,
    })

    return NextResponse.json({ translatedText })
  } catch (error) {
    console.error("Translation error:", error)
    return NextResponse.json(
      { error: "Translation failed. Please check your API settings and try again." },
      { status: 500 },
    )
  }
}
