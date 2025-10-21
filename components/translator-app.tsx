"use client";

import { useState, useEffect } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRightLeft,
  Languages,
  Loader2,
  Settings,
  Upload,
  FileText,
  Download,
  Clipboard,
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

const LANGUAGES = [
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
];

interface ApiConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

const STORAGE_KEY = "ai-translator-config";

export default function TranslatorApp() {
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("zh");
  const [isTranslating, setIsTranslating] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [translatedFileContent, setTranslatedFileContent] = useState("");
  const [isTranslatingFile, setIsTranslatingFile] = useState(false);

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
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const savedConfig = localStorage.getItem(STORAGE_KEY);
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setApiConfig(parsed);
        setTempApiConfig(parsed);
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

  useEffect(() => {
    handleTranslate();
  }, [sourceText]);

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
    if (!selectedFile) return;

    setIsTranslatingFile(true);
    setTranslatedFileContent("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
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

  const handleCopyTranslation = () => {
    navigator.clipboard.writeText(translatedFileContent);
  };

  const handleDownloadTranslation = () => {
    if (!translatedFileContent || !selectedFile) return;

    const blob = new Blob([translatedFileContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const originalName = selectedFile.name;
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
    setApiConfig(tempApiConfig);
    setDialogOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Languages className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-balance">AI Translator</h1>
            <p className="text-muted-foreground text-pretty">
              Powered by Vercel AI SDK
            </p>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
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
                  Optional. Your API key is stored locally and never sent to our
                  servers.
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
                <p className="text-sm text-muted-foreground">
                  Select the model to use for translation.
                </p>
              </div>

              <Button onClick={handleSaveApiConfig} className="w-full">
                Save Settings
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="text" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
          <TabsTrigger value="text" className="gap-2">
            <FileText className="h-4 w-4" />
            Translate Text
          </TabsTrigger>
          <TabsTrigger value="file" className="gap-2">
            <Upload className="h-4 w-4" />
            Translate File
          </TabsTrigger>
        </TabsList>

        <div className="flex gap-2 mb-4 items-center">
          <Select value={sourceLang} onValueChange={setSourceLang}>
            <SelectTrigger id="source-lang" className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
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
            <SelectTrigger id="target-lang" className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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

        <TabsContent value="file">
          <Card>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".md,.mdx,.txt,.jpg,.jpeg,.png,.gif,.webp"
                      onChange={(e) =>
                        setSelectedFile(e.target.files?.[0] || null)
                      }
                      className="flex-1"
                    />
                    {selectedFile && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedFile(null);
                          setTranslatedFileContent("");
                        }}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Supported formats: .md, .mdx, .txt, .jpg, .jpeg, .png, .gif,
                    .webp
                  </p>
                  {selectedFile && (
                    <p className="text-sm font-medium">
                      Selected: {selectedFile.name} (
                      {(selectedFile.size / 1024).toFixed(2)} KB)
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleFileTranslate}
                  disabled={isTranslatingFile || !selectedFile}
                >
                  {isTranslatingFile ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Translating File...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Translate File
                    </>
                  )}
                </Button>

                {translatedFileContent && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="file-translation">
                        Translated Content
                      </Label>
                      <div className="flex gap-2">
                        <Button onClick={handleCopyTranslation} size="sm">
                          <Clipboard className="h-4 w-4" />
                          Copy
                        </Button>
                        <Button
                          onClick={handleDownloadTranslation}
                          variant="outline"
                          size="sm"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                    <Textarea
                      id="file-translation"
                      value={translatedFileContent}
                      readOnly
                      className="min-h-[400px] resize-none bg-muted/50 font-mono text-sm"
                    />
                    <p className="text-sm text-muted-foreground">
                      {translatedFileContent.length} characters
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
