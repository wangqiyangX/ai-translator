"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowRightLeft,
  Languages,
  Settings,
  FileText,
  ImageIcon,
  Terminal as TextInitial,
  Check,
  Clipboard,
  Download,
  ArrowRight,
  Globe,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ModeToggle } from "./mode-toggle"
import { Dropzone, DropzoneContent, DropzoneEmptyState } from "@/components/ui/shadcn-io/dropzone"
import { Spinner } from "@/components/ui/spinner"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"

const LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹" },
  { code: "ru", name: "Russian", flag: "🇷🇺" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
  { code: "ar", name: "Arabic", flag: "🇸🇦" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
]

const MODELS = [
  { value: "gpt-4o", label: "GPT-4o", provider: "OpenAI" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini", provider: "OpenAI" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo", provider: "OpenAI" },
  { value: "gpt-4", label: "GPT-4", provider: "OpenAI" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo", provider: "OpenAI" },
  {
    value: "claude-3-5-sonnet-20241022",
    label: "Claude 3.5 Sonnet",
    provider: "Anthropic",
  },
  {
    value: "claude-3-5-haiku-20241022",
    label: "Claude 3.5 Haiku",
    provider: "Anthropic",
  },
  {
    value: "claude-3-opus-20240229",
    label: "Claude 3 Opus",
    provider: "Anthropic",
  },
  {
    value: "gemini-2.0-flash-exp",
    label: "Gemini 2.0 Flash",
    provider: "Google",
  },
  {
    value: "gemini-1.5-pro-latest",
    label: "Gemini 1.5 Pro",
    provider: "Google",
  },
  {
    value: "gemini-1.5-flash-latest",
    label: "Gemini 1.5 Flash",
    provider: "Google",
  },
  {
    value: "llama-3.3-70b-versatile",
    label: "Llama 3.3 70B",
    provider: "Meta",
  },
  {
    value: "llama-3.1-70b-versatile",
    label: "Llama 3.1 70B",
    provider: "Meta",
  },
]

interface ApiConfig {
  apiKey: string
  baseUrl: string
  model: string
}

const STORAGE_KEY = "ai-translator-config"

export default function TranslatorApp() {
  const [isCopied, setIsCopied] = useState(false)

  const [sourceText, setSourceText] = useState("")
  const [translatedText, setTranslatedText] = useState("")
  const [sourceLang, setSourceLang] = useState("en")
  const [targetLang, setTargetLang] = useState("zh")
  const [isTranslating, setIsTranslating] = useState(false)

  const [selectedDocuments, setSelectedDocuments] = useState<File[] | undefined>()
  const [selectedImages, setSelectedImages] = useState<File[] | undefined>()
  const [preview, setPreview] = useState<string | null>(null)
  const [translatedFileContent, setTranslatedFileContent] = useState("")
  const [isTranslatingFile, setIsTranslatingFile] = useState(false)

  const [apiConfig, setApiConfig] = useState<ApiConfig>({
    apiKey: "",
    baseUrl: "",
    model: "gpt-4o-mini",
  })
  const [tempApiConfig, setTempApiConfig] = useState<ApiConfig>({
    apiKey: "",
    baseUrl: "",
    model: "gpt-4o-mini",
  })
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    const savedConfig = localStorage.getItem(STORAGE_KEY)
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig)
        setApiConfig(parsed)
        setTempApiConfig(parsed)
      } catch (error) {
        console.error("Failed to parse saved config:", error)
      }
    }
  }, [])

  useEffect(() => {
    if (apiConfig.apiKey || apiConfig.baseUrl || apiConfig.model !== "gpt-4o-mini") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(apiConfig))
    }
  }, [apiConfig])

  useEffect(() => {
    if (!sourceText.trim()) {
      setTranslatedText("")
      return
    }

    const timeoutId = setTimeout(() => {
      handleTranslate()
    }, 800) // Wait 800ms after user stops typing

    return () => clearTimeout(timeoutId)
  }, [sourceText, sourceLang, targetLang])

  const handleTranslate = async () => {
    if (!sourceText.trim()) return

    setIsTranslating(true)
    setTranslatedText("")

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: sourceText,
          sourceLang,
          targetLang,
          apiKey: apiConfig.apiKey || undefined,
          baseUrl: apiConfig.baseUrl || undefined,
          model: apiConfig.model,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Translation failed")
      }

      const data = await response.json()
      setTranslatedText(data.translatedText)
    } catch (error) {
      console.error("Translation error:", error)
      setTranslatedText(`Error: ${error instanceof Error ? error.message : "Translation failed. Please try again."}`)
    } finally {
      setIsTranslating(false)
    }
  }

  const handleFileTranslate = async () => {
    if (!selectedDocuments) return

    setIsTranslatingFile(true)
    setTranslatedFileContent("")

    try {
      const formData = new FormData()
      formData.append("file", selectedDocuments[0])
      formData.append("sourceLang", sourceLang)
      formData.append("targetLang", targetLang)
      formData.append("model", apiConfig.model)
      if (apiConfig.apiKey) formData.append("apiKey", apiConfig.apiKey)
      if (apiConfig.baseUrl) formData.append("baseUrl", apiConfig.baseUrl)

      const response = await fetch("/api/translate-file", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "File translation failed")
      }

      const data = await response.json()
      setTranslatedFileContent(data.translatedContent)
    } catch (error) {
      console.error("File translation error:", error)
      setTranslatedFileContent(
        `Error: ${error instanceof Error ? error.message : "File translation failed. Please try again."}`,
      )
    } finally {
      setIsTranslatingFile(false)
    }
  }

  const handleCopyTranslation = () => {
    navigator.clipboard.writeText(translatedFileContent)
    setIsCopied(true)
  }

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 1500)
      return () => clearTimeout(timer)
    }
  }, [isCopied])

  const handleDownloadTranslation = () => {
    if (!translatedFileContent || !selectedDocuments) return

    const blob = new Blob([translatedFileContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    const originalName = selectedDocuments[0].name
    const extension = originalName.substring(originalName.lastIndexOf("."))
    a.download = `${originalName.replace(extension, "")}-${targetLang}${extension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleSwapLanguages = () => {
    setSourceLang(targetLang)
    setTargetLang(sourceLang)
    setSourceText(translatedText)
    setTranslatedText(sourceText)
  }

  const handleSaveApiConfig = () => {
    setApiConfig(tempApiConfig)
    setDialogOpen(false)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Globe className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-balance">AI Translator</h1>
            <p className="text-muted-foreground text-pretty">Powered by Vercel AI SDK</p>
          </div>
        </div>

        <div className="flex gap-1">
          <ModeToggle />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>API Settings</DialogTitle>
                <DialogDescription>
                  Configure your AI API settings. Leave fields empty to use the default gateway.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key</Label>
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="sk-... or your provider's API key"
                    value={tempApiConfig.apiKey}
                    onChange={(e) =>
                      setTempApiConfig({
                        ...tempApiConfig,
                        apiKey: e.target.value,
                      })
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Optional. Your API key is stored locally and never sent to our servers.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="base-url">Base URL</Label>
                  <Input
                    id="base-url"
                    type="url"
                    placeholder="https://api.openai.com/v1"
                    value={tempApiConfig.baseUrl}
                    onChange={(e) =>
                      setTempApiConfig({
                        ...tempApiConfig,
                        baseUrl: e.target.value,
                      })
                    }
                  />
                  <p className="text-sm text-muted-foreground">Optional. Use a custom API-compatible endpoint.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Select
                    value={tempApiConfig.model}
                    onValueChange={(value) => setTempApiConfig({ ...tempApiConfig, model: value })}
                  >
                    <SelectTrigger id="model">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MODELS.map((model) => (
                        <SelectItem key={model.value} value={model.value}>
                          {model.label} <span className="text-muted-foreground text-xs">({model.provider})</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">Select the model to use for translation.</p>
                </div>

                <Button onClick={handleSaveApiConfig} className="w-full">
                  Save Settings
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex gap-2 items-center mb-4">
        <Select value={sourceLang} onValueChange={setSourceLang}>
          <SelectTrigger id="source-lang" className="w-[120px]" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                <span className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={handleSwapLanguages} variant="ghost" size="sm" disabled={isTranslating}>
          <ArrowRightLeft className="h-4 w-4" />
        </Button>

        <Select value={targetLang} onValueChange={setTargetLang}>
          <SelectTrigger id="target-lang" className="w-[120px]" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                <span className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="document">
        <TabsList className="mb-6 md:mx-auto">
          <TabsTrigger value="text" className="gap-2">
            <TextInitial className="h-4 w-4" />
            Text
          </TabsTrigger>
          <TabsTrigger value="document" className="gap-2">
            <FileText className="h-4 w-4" />
            Document
          </TabsTrigger>
          <TabsTrigger value="image" className="gap-2">
            <ImageIcon className="h-4 w-4" />
            Image
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text">
          <div className="grid md:grid-cols-2 gap-2">
            <Textarea
              id="source-text"
              placeholder="Enter text to translate..."
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              className="min-h-[300px] resize-none rounded-lg"
            />

            <Textarea
              id="translated-text"
              placeholder="Translation will appear here..."
              value={translatedText}
              readOnly
              className="min-h-[300px] resize-none bg-muted/50 rounded-lg"
            />
          </div>
        </TabsContent>

        <TabsContent value="document">
          <Dropzone
            accept={{ "text/mdx": [] }}
            maxFiles={1}
            onDrop={(files: File[]) => {
              setSelectedDocuments(files)
            }}
            onError={console.error}
            src={selectedDocuments}
            className="min-h-[140px]"
          >
            <DropzoneEmptyState />
            <DropzoneContent />
          </Dropzone>

          {selectedDocuments && (
            <>
              <Separator className="my-4" />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="file-translation">Translated Content</Label>
                  <div className="flex gap-2 items-center">
                    <Button onClick={handleFileTranslate} disabled={isTranslatingFile || !selectedDocuments} size="sm">
                      {isTranslatingFile ? (
                        <>
                          <Spinner className="size-4" />
                          Translating...
                        </>
                      ) : (
                        <>
                          <Languages />
                          Translate
                        </>
                      )}
                    </Button>
                    {translatedFileContent && (
                      <>
                        <Button
                          variant="outline"
                          onClick={handleCopyTranslation}
                          size="sm"
                          disabled={translatedFileContent.length === 0}
                        >
                          {isCopied ? (
                            <>
                              <Check className="h-4 w-4" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Clipboard className="h-4 w-4" />
                              Copy
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={handleDownloadTranslation}
                          variant="outline"
                          size="sm"
                          disabled={translatedFileContent.length === 0}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <Textarea
                  id="file-translation"
                  value={translatedFileContent}
                  readOnly
                  className="h-full min-h-[400px] resize-none bg-muted/50 font-mono text-sm"
                />
                <p className="text-sm text-muted-foreground">{translatedFileContent.length} characters</p>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="image">
          <Dropzone
            accept={{ "image/*": [] }}
            maxFiles={1}
            onDrop={(files: File[]) => {
              console.log(files)
              setSelectedImages(files)
              const imageUrl = URL.createObjectURL(files[0])
              setPreview(imageUrl)
            }}
            onError={console.error}
            src={selectedImages}
            className="min-h-[140px]"
          >
            <DropzoneEmptyState />
            <DropzoneContent />
          </Dropzone>
          <div className="space-y-2">
            {preview && (
              <>
                <Separator className="my-4" />
                <div className="flex gap-2 items-center">
                  <div className="border border-border rounded-md w-full h-[200px] overflow-hidden flex items-center justify-center p-4">
                    <Image
                      src={preview || "/placeholder.svg"}
                      width={400}
                      height={300}
                      alt="Selected image"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <Button size="icon-sm">
                    <ArrowRight className="min-w-8" />
                  </Button>
                  <div className="border border-border rounded-md w-full h-[200px]"></div>
                </div>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
