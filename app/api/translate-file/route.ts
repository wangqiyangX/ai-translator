import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024

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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const sourceLang = formData.get("sourceLang") as string
    const targetLang = formData.get("targetLang") as string
    const apiKey = formData.get("apiKey") as string | null
    const baseUrl = formData.get("baseUrl") as string | null
    const textContent = formData.get("textContent") as string | null
    const model = (formData.get("model") as string) || "gpt-4o-mini"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!sourceLang || !targetLang) {
      return NextResponse.json({ error: "Source and target languages are required" }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File is too large. Please upload a file smaller than 5MB." },
        { status: 413 },
      )
    }

    const sourceLanguage = LANGUAGE_NAMES[sourceLang] || sourceLang
    const targetLanguage = LANGUAGE_NAMES[targetLang] || targetLang

    // Check file type
    const fileType = file.type
    const fileName = file.name.toLowerCase()
    const isImage = fileType.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp)$/.test(fileName)
    const isTextFile = fileType.startsWith("text/") || /\.(md|mdx|txt)$/.test(fileName)

    let content: string
    let prompt: string

    if (isImage) {
      // For images, use vision capabilities
      const arrayBuffer = await file.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString("base64")
      const dataUrl = `data:${fileType};base64,${base64}`

      prompt = `You are a professional translator. Analyze this image and extract all visible text. Then translate the extracted text from ${sourceLanguage} to ${targetLanguage}. 

Format your response as:
ORIGINAL TEXT:
[extracted text here]

TRANSLATED TEXT:
[translated text here]

Preserve the structure and formatting of the text as much as possible.`

      // Use vision model for images
      const visionModel = apiKey ? `${model}` : "openai/gpt-4o"

      const openai =
        apiKey
          ? createOpenAI({
              apiKey,
              baseURL: baseUrl || undefined,
            })
          : undefined

      const { text: translatedContent, usage } = await generateText({
        model: openai ? openai(model) : visionModel,
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

      return NextResponse.json({
        translatedContent,
        tokenUsage: normalizeTokenUsage(usage),
      })
    } else if (isTextFile) {
      // For text files, read content directly
      content = textContent ?? (await file.text())

      prompt = `You are a professional translator. Translate the following ${sourceLanguage} text to ${targetLanguage}.

IMPORTANT INSTRUCTIONS:
- Preserve all markdown formatting, including headers, lists, links, code blocks, and emphasis
- Keep all code blocks unchanged (do not translate code)
- Preserve all URLs and file paths
- Maintain the document structure exactly as it is
- Only translate the actual text content, not the markdown syntax or code

Text to translate:

${content}

Provide only the translated text with preserved formatting, without any explanations or additional comments.`

      const openai =
        apiKey
          ? createOpenAI({
              apiKey,
              baseURL: baseUrl || undefined,
            })
          : undefined

      const { text: translatedContent, usage } = await generateText({
        model: openai ? openai(model) : `openai/${model}`,
        prompt,
      })

      return NextResponse.json({
        translatedContent,
        tokenUsage: normalizeTokenUsage(usage),
      })
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload .md, .mdx, .txt, or image files." },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("[v0] File translation error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "File translation failed" },
      { status: 500 },
    )
  }
}
