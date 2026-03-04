import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { guardApiRoute } from "@/lib/api-security"

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024

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
    const customPrompt = formData.get("customPrompt") as string | null
    const outputMode = (formData.get("outputMode") as string | null) || "translation-only"
    const model = (formData.get("model") as string) || "gpt-4o-mini"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!sourceLang || !targetLang) {
      return NextResponse.json({ error: "Source and target languages are required" }, { status: 400 })
    }

    const guard = guardApiRoute({
      headers: request.headers,
      apiKey,
      routeKey: "translate-file",
      ipLimitPerMinute: 40,
      userLimitPerMinute: 80,
    })
    if (!guard.ok) return guard.response

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
    const customInstruction =
      customPrompt && customPrompt.trim()
        ? `Additional instructions:\n${customPrompt.trim()}\n\n`
        : ""

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

Preserve the structure and formatting of the text as much as possible.

${customInstruction}`

      // Use vision model for images
      const visionModel = apiKey ? `${model}` : "openai/gpt-4o"

      const openai =
        apiKey
          ? createOpenAI({
              apiKey,
              baseURL: baseUrl || undefined,
            })
          : undefined

      const { signal, cleanup } = createAbortSignalWithTimeout(request.signal, 20_000)

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
        abortSignal: signal,
      }).finally(() => cleanup())

      return NextResponse.json({
        translatedContent,
        tokenUsage: normalizeTokenUsage(usage),
      })
    } else if (isTextFile) {
      // For text files, read content directly
      content = textContent ?? (await file.text())

      const outputInstruction =
        outputMode === "bilingual"
          ? "- Return bilingual output with ORIGINAL and TRANSLATION sections"
          : "- Return translated content only"
      const closingInstruction =
        outputMode === "bilingual"
          ? "Provide bilingual output with clear ORIGINAL and TRANSLATION sections, without extra commentary."
          : "Provide only the translated text with preserved formatting, without any explanations or additional comments."

      prompt = `You are a professional translator. Translate the following ${sourceLanguage} text to ${targetLanguage}.

IMPORTANT INSTRUCTIONS:
- Preserve all markdown formatting, including headers, lists, links, code blocks, and emphasis
- Keep all code blocks unchanged (do not translate code)
- Preserve all URLs and file paths
- Maintain the document structure exactly as it is
- Only translate the actual text content, not the markdown syntax or code
${outputInstruction}
${customInstruction ? `- Follow these custom requirements:\n${customPrompt}\n` : ""}

Text to translate:

${content}

${closingInstruction}`

      const openai =
        apiKey
          ? createOpenAI({
              apiKey,
              baseURL: baseUrl || undefined,
            })
          : undefined

      const { signal, cleanup } = createAbortSignalWithTimeout(request.signal, 20_000)

      const { text: translatedContent, usage } = await generateText({
        model: openai ? openai(model) : `openai/${model}`,
        prompt,
        abortSignal: signal,
      }).finally(() => cleanup())

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

    if (
      error instanceof Error &&
      (error.name === "AbortError" || error.message === "Request timeout")
    ) {
      return NextResponse.json(
        { error: "File translation request was canceled or timed out." },
        { status: 504 },
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "File translation failed" },
      { status: 500 },
    )
  }
}
