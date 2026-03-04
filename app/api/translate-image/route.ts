import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024

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

function parseTag(content: string, tag: "ORIGINAL_TEXT" | "TRANSLATED_TEXT") {
  const pattern = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "i")
  const match = content.match(pattern)
  return (match?.[1] ?? "").trim()
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const sourceLang = formData.get("sourceLang") as string
    const targetLang = formData.get("targetLang") as string
    const apiKey = formData.get("apiKey") as string | null
    const baseUrl = formData.get("baseUrl") as string | null
    const model = (formData.get("model") as string) || "gpt-4o-mini"

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    if (!sourceLang || !targetLang) {
      return NextResponse.json({ error: "Source and target languages are required" }, { status: 400 })
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Image is too large. Please upload an image smaller than 5MB." },
        { status: 413 },
      )
    }

    const fileType = file.type
    const fileName = file.name.toLowerCase()
    const isImage = fileType.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|bmp)$/.test(fileName)
    if (!isImage) {
      return NextResponse.json({ error: "Unsupported file type. Please upload an image file." }, { status: 400 })
    }

    const sourceLanguage = LANGUAGE_NAMES[sourceLang] || sourceLang
    const targetLanguage = LANGUAGE_NAMES[targetLang] || targetLang
    const normalizedFileType = fileType || "image/png"

    const arrayBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString("base64")
    const dataUrl = `data:${normalizedFileType};base64,${base64}`

    const prompt = `You are a professional translator.
Extract all visible text from the image, then translate it from ${sourceLanguage} to ${targetLanguage}.

Return your response in this exact XML-like format:
<ORIGINAL_TEXT>
[all extracted text]
</ORIGINAL_TEXT>
<TRANSLATED_TEXT>
[translated text]
</TRANSLATED_TEXT>

Rules:
- Keep line breaks and reading order as naturally as possible.
- If there is no visible text, put "No readable text found." in both sections.`

    const openai = apiKey
      ? createOpenAI({
          apiKey,
          baseURL: baseUrl || undefined,
        })
      : undefined

    const { text, usage } = await generateText({
      model: openai ? openai(model) : "openai/gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image", image: dataUrl },
          ],
        },
      ],
    })

    const originalText = parseTag(text, "ORIGINAL_TEXT")
    const translatedText = parseTag(text, "TRANSLATED_TEXT")

    return NextResponse.json({
      originalText: originalText || "",
      translatedText: translatedText || text,
      raw: text,
      tokenUsage: normalizeTokenUsage(usage),
    })
  } catch (error) {
    console.error("Image translation error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Image translation failed" },
      { status: 500 },
    )
  }
}
