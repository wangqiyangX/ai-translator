"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowRightLeft,
  Languages,
  Settings,
  FileText,
  ImageIcon,
  TextIcon,
  Check,
  Clipboard,
  Download,
  ArrowRight,
  Globe,
  RefreshCw,
  GithubIcon,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModeToggle } from "./mode-toggle";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";

const LANGUAGES = [
  { code: "en", name: "English" /* flag: "🇺🇸" */ },
  { code: "es", name: "Spanish" /* flag: "🇪🇸" */ },
  { code: "fr", name: "French" /* flag: "🇫🇷" */ },
  { code: "de", name: "German" /* flag: "🇩🇪" */ },
  { code: "it", name: "Italian" /* flag: "🇮🇹" */ },
  { code: "pt", name: "Portuguese" /* flag: "🇵🇹" */ },
  { code: "ru", name: "Russian" /* flag: "🇷🇺" */ },
  { code: "ja", name: "Japanese" /* flag: "🇯🇵" */ },
  { code: "ko", name: "Korean" /* flag: "🇰🇷" */ },
  { code: "zh", name: "Chinese" /* flag: "🇨🇳" */ },
  { code: "ar", name: "Arabic" /* flag: "🇸🇦" */ },
  { code: "hi", name: "Hindi" /* flag: "🇮🇳"  */ },
];

const MODELS = [
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

interface ApiConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

const STORAGE_KEY = "ai-translator-config";

export default function TranslatorApp() {
  const [isCopied, setIsCopied] = useState(false);

  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("zh");
  const [isTranslating, setIsTranslating] = useState(false);

  const [selectedDocuments, setSelectedDocuments] = useState<
    File[] | undefined
  >();
  const [selectedImages, setSelectedImages] = useState<File[] | undefined>();
  const [preview, setPreview] = useState<string | null>(null);
  const [translatedFileContent, setTranslatedFileContent] = useState("");
  const [isTranslatingFile, setIsTranslatingFile] = useState(false);
  const [selectedDocumentContent, setSelectedDocumentContent] = useState("");

  const [apiConfig, setApiConfig] = useState<ApiConfig>({
    apiKey: "",
    baseUrl: "",
    model: "gpt-4o-mini",
  });
  const [tempApiConfig, setTempApiConfig] = useState<ApiConfig>({
    apiKey: "",
    baseUrl: "",
    model: "gpt-4o-mini",
  });
  const [customModelName, setCustomModelName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState<
    "idle" | "checking" | "available" | "unavailable"
  >("idle");
  const [apiStatusMessage, setApiStatusMessage] = useState("");

  useEffect(() => {
    const savedConfig = localStorage.getItem(STORAGE_KEY);
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setApiConfig(parsed);
        // Check if the saved model is a custom model (not in MODELS list)
        const isCustomModel = !MODELS.some(
          (m) => m.value === parsed.model && m.value !== "custom"
        );
        if (isCustomModel && parsed.model) {
          setCustomModelName(parsed.model);
          setTempApiConfig({ ...parsed, model: "custom" });
        } else {
          setTempApiConfig(parsed);
        }
      } catch (error) {
        console.error("Failed to parse saved config:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (
      apiConfig.apiKey ||
      apiConfig.baseUrl ||
      apiConfig.model !== "gpt-4o-mini"
    ) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(apiConfig));
    }
  }, [apiConfig]);

  // Sync tempApiConfig when dialog opens
  useEffect(() => {
    if (dialogOpen) {
      // Check if the current model is a custom model (not in MODELS list)
      const isCustomModel = !MODELS.some(
        (m) => m.value === apiConfig.model && m.value !== "custom"
      );
      if (isCustomModel && apiConfig.model) {
        setCustomModelName(apiConfig.model);
        setTempApiConfig({ ...apiConfig, model: "custom" });
      } else {
        setTempApiConfig(apiConfig);
        setCustomModelName("");
      }
    }
  }, [dialogOpen, apiConfig]);

  useEffect(() => {
    if (!sourceText.trim()) {
      setTranslatedText("");
      return;
    }

    const timeoutId = setTimeout(() => {
      handleTranslate();
    }, 800); // Wait 800ms after user stops typing

    return () => clearTimeout(timeoutId);
  }, [sourceText, sourceLang, targetLang]);

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;

    setIsTranslating(true);
    setTranslatedText("");

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
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Translation failed");
      }

      const data = await response.json();
      setTranslatedText(data.translatedText);
    } catch (error) {
      console.error("Translation error:", error);
      setTranslatedText(
        `Error: ${
          error instanceof Error
            ? error.message
            : "Translation failed. Please try again."
        }`
      );
    } finally {
      setIsTranslating(false);
    }
  };

  const handleFileTranslate = async () => {
    if (!selectedDocuments) return;

    setIsTranslatingFile(true);
    setTranslatedFileContent("");

    try {
      const formData = new FormData();
      formData.append("file", selectedDocuments[0]);
      formData.append("sourceLang", sourceLang);
      formData.append("targetLang", targetLang);
      formData.append("model", apiConfig.model);
      if (apiConfig.apiKey) formData.append("apiKey", apiConfig.apiKey);
      if (apiConfig.baseUrl) formData.append("baseUrl", apiConfig.baseUrl);

      const response = await fetch("/api/translate-file", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "File translation failed");
      }

      const data = await response.json();
      setTranslatedFileContent(data.translatedContent);
    } catch (error) {
      console.error("File translation error:", error);
      setTranslatedFileContent(
        `Error: ${
          error instanceof Error
            ? error.message
            : "File translation failed. Please try again."
        }`
      );
    } finally {
      setIsTranslatingFile(false);
    }
  };

  const handleCopyTranslatedText = () => {
    navigator.clipboard.writeText(translatedText);
    setIsCopied(true);
  };

  const handleCopyTranslatedDocumentContent = () => {
    navigator.clipboard.writeText(translatedFileContent);
    setIsCopied(true);
  };

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  useEffect(() => {
    setTranslatedFileContent("");
    getDocumentContent();
  }, [selectedDocuments]);

  const getDocumentContent = async () => {
    const content = (await selectedDocuments?.[0].text()) ?? "";
    setSelectedDocumentContent(content);
  };

  const handleDownloadTranslation = () => {
    if (!translatedFileContent || !selectedDocuments) return;

    const blob = new Blob([translatedFileContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const originalName = selectedDocuments[0].name;
    const extension = originalName.substring(originalName.lastIndexOf("."));
    a.download = `${originalName.replace(
      extension,
      ""
    )}-${targetLang}${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSwapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const handleSaveApiConfig = () => {
    // If custom model is selected, use the custom model name
    if (tempApiConfig.model === "custom") {
      if (!customModelName.trim()) {
        // Don't save if custom model name is empty
        return;
      }
      setApiConfig({ ...tempApiConfig, model: customModelName.trim() });
    } else {
      setApiConfig(tempApiConfig);
    }
    setDialogOpen(false);
  };

  const handleDocumentContent = (value: string) => {
    setSelectedDocumentContent(value);
  };

  const checkApiAvailability = useCallback(async () => {
    setApiStatus("checking");
    setApiStatusMessage("Checking API availability...");

    try {
      // Use /api/models endpoint to check availability without consuming tokens
      const response = await fetch("/api/models", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: apiConfig.apiKey || undefined,
          baseUrl: apiConfig.baseUrl || undefined,
          model: apiConfig.model,
        }),
      });

      const data = await response.json();

      if (response.ok && data.available) {
        setApiStatus("available");
        setApiStatusMessage(
          data.message || "API is available and working correctly"
        );
      } else {
        setApiStatus("unavailable");
        setApiStatusMessage(data.error || "API request failed");
      }
    } catch (error) {
      setApiStatus("unavailable");
      setApiStatusMessage(
        error instanceof Error
          ? error.message
          : "Failed to connect to API. Please check your settings."
      );
    }
  }, [apiConfig.apiKey, apiConfig.baseUrl, apiConfig.model]);

  // Check API availability when config changes
  useEffect(() => {
    if (apiConfig.model) {
      // Debounce the check
      const timeoutId = setTimeout(() => {
        checkApiAvailability();
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [
    apiConfig.model,
    apiConfig.apiKey,
    apiConfig.baseUrl,
    checkApiAvailability,
  ]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Globe className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-balance">AI Translator</h1>
            <p className="text-muted-foreground text-pretty">
              Powered by Vercel AI SDK
            </p>
          </div>
        </div>

        <div className="flex gap-1">
          <ModeToggle />
          <Button variant="ghost" size="icon">
            <Link
              href={"https://github.com/wangqiyangX/ai-translator"}
              target="_blank"
            >
              <GithubIcon className="size-4" />
            </Link>
          </Button>
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
                  Configure your AI API settings. Leave fields empty to use the
                  default gateway.
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
                    Optional. Your API key is stored locally and never sent to
                    our servers.
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
                  <p className="text-sm text-muted-foreground">
                    Optional. Use a custom API-compatible endpoint.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Select
                    value={tempApiConfig.model}
                    onValueChange={(value) =>
                      setTempApiConfig({ ...tempApiConfig, model: value })
                    }
                  >
                    <SelectTrigger id="model">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MODELS.map((model) => (
                        <SelectItem key={model.value} value={model.value}>
                          {model.label}{" "}
                          <span className="text-muted-foreground text-xs">
                            ({model.provider})
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {tempApiConfig.model === "custom" && (
                    <Input
                      id="custom-model"
                      placeholder="Input model name, for example: gpt-4, claude-3-opus"
                      value={customModelName}
                      onChange={(e) => {
                        setCustomModelName(e.target.value);
                        // Update tempApiConfig.model with the custom model name for preview
                        // but keep the select value as "custom"
                      }}
                      className="mt-2"
                    />
                  )}
                  <p className="text-sm text-muted-foreground">
                    {tempApiConfig.model === "custom"
                      ? "Input the model name you want to use."
                      : "Select the model to use for translation."}
                  </p>
                </div>

                <Button
                  onClick={handleSaveApiConfig}
                  className="w-full"
                  disabled={
                    tempApiConfig.model === "custom" && !customModelName.trim()
                  }
                >
                  Save Settings
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="text">
        <div className="md:flex justify-between items-center">
          <TabsList className="my-2">
            <TabsTrigger value="text" className="gap-2">
              <TextIcon className="h-4 w-4" />
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

          <div className="flex gap-1 my-2">
            <Select value={sourceLang} onValueChange={setSourceLang}>
              <SelectTrigger id="source-lang" className="w-full" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <span className="flex items-center gap-2">
                      {/* <span>{lang.flag}</span> */}
                      <span>{lang.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={handleSwapLanguages}
              variant="ghost"
              size="sm"
              disabled={isTranslating}
            >
              <ArrowRightLeft className="h-4 w-4" />
            </Button>

            <Select value={targetLang} onValueChange={setTargetLang}>
              <SelectTrigger id="target-lang" className="w-full" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <span className="flex items-center gap-2">
                      {/* <span>{lang.flag}</span> */}
                      <span>{lang.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="text">
          <div className="flex justify-end mb-2">
            <Button
              variant="outline"
              onClick={handleCopyTranslatedText}
              size="sm"
              disabled={translatedText.length === 0}
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
          </div>
          <div className="grid md:grid-cols-2 gap-2 min-h-[140px]">
            <Textarea
              id="source-text"
              placeholder="Enter text to translate..."
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              className="resize-none rounded-lg"
            />

            <Textarea
              id="translated-text"
              placeholder="Translation will appear here..."
              value={translatedText}
              readOnly
              className="resize-none bg-muted/50 rounded-lg"
            />
          </div>
        </TabsContent>

        <TabsContent value="document">
          <Dropzone
            accept={{
              "text/mdx": [".mdx"],
              "text/markdown": [".md", ".markdown"],
              "text/plain": [".txt"],
            }}
            maxFiles={1}
            onDrop={(files: File[]) => {
              setSelectedDocuments(files);
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
                    {translatedFileContent ? (
                      <>
                        <Button
                          onClick={handleCopyTranslatedDocumentContent}
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
                          <Download />
                        </Button>
                        <Button
                          onClick={handleTranslate}
                          variant="outline"
                          size="sm"
                          disabled={isTranslatingFile || !selectedDocuments}
                        >
                          {isTranslating ? <Spinner /> : <RefreshCw />}
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={handleFileTranslate}
                        disabled={isTranslatingFile || !selectedDocuments}
                        size="sm"
                      >
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
                    )}
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-2 min-h-[140px]">
                  <Textarea
                    id="file-raw-content"
                    value={selectedDocumentContent}
                    onChange={(e) => setSelectedDocumentContent(e.target.value)}
                    className="h-full min-h-[400px] resize-none font-mono text-sm"
                  />
                  <Textarea
                    id="file-translated-content"
                    value={translatedFileContent}
                    readOnly
                    className="h-full min-h-[400px] resize-none bg-muted/50 font-mono text-sm"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {translatedFileContent.length} characters
                </p>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="image">
          <Dropzone
            accept={{ "image/*": [] }}
            maxFiles={1}
            onDrop={(files: File[]) => {
              console.log(files);
              setSelectedImages(files);
              const imageUrl = URL.createObjectURL(files[0]);
              setPreview(imageUrl);
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

      {/* api 可用性检测 */}
      <div className="mt-6 p-4 border rounded-lg bg-card">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {apiStatus === "checking" && (
                <>
                  <Spinner className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Checking API status...
                  </span>
                </>
              )}
              {apiStatus === "available" && (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-500">
                    API Available
                  </span>
                </>
              )}
              {apiStatus === "unavailable" && (
                <>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium text-red-500">
                    API Unavailable
                  </span>
                </>
              )}
              {apiStatus === "idle" && (
                <>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    API Status
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                Model: {apiConfig.model || "Not set"}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={checkApiAvailability}
                disabled={apiStatus === "checking"}
              >
                {apiStatus === "checking" ? (
                  <>
                    <Spinner className="h-3 w-3 mr-2" />
                    Checking...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3 mr-2" />
                    Test API
                  </>
                )}
              </Button>
            </div>
          </div>
          {apiStatusMessage && (
            <div className="text-xs text-muted-foreground">
              {apiStatusMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
