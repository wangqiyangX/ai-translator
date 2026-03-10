"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Settings } from "lucide-react";
import { MODELS } from "./constants";
import type { OutputMode } from "./types";
import { useTranslatorSettingsStore } from "./store";

export function SettingsDialog() {
  const open = useTranslatorSettingsStore((state) => state.dialogOpen);
  const onOpenChange = useTranslatorSettingsStore((state) => state.setDialogOpen);
  const tempApiConfig = useTranslatorSettingsStore((state) => state.tempApiConfig);
  const setTempApiConfig = useTranslatorSettingsStore((state) => state.setTempApiConfig);
  const customModelName = useTranslatorSettingsStore((state) => state.customModelName);
  const setCustomModelName = useTranslatorSettingsStore(
    (state) => state.setCustomModelName
  );
  const setApiConfig = useTranslatorSettingsStore((state) => state.setApiConfig);

  const handleSave = () => {
    if (tempApiConfig.model === "custom") {
      if (!customModelName.trim()) {
        return;
      }
      setApiConfig({ ...tempApiConfig, model: customModelName.trim() });
    } else {
      setApiConfig(tempApiConfig);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Button variant="ghost" size="icon" onClick={() => onOpenChange(true)}>
        <Settings className="h-4 w-4" />
      </Button>
      <DialogContent
        onEscapeKeyDown={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
        className="flex max-h-[85vh] max-w-md flex-col overflow-hidden p-0"
      >
        <DialogHeader className="px-6 pt-6 pr-14">
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your AI API settings. Leave fields empty to use the default gateway.
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pr-5 pt-4 [scrollbar-width:none] [-ms-overflow-style:none] [scrollbar-gutter:stable] [&::-webkit-scrollbar]:hidden">
          <FieldGroup className="gap-4">
            <Field>
              <FieldContent>
                <FieldLabel htmlFor="api-key">API Key</FieldLabel>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="sk-... or your provider's API key"
                  value={tempApiConfig.apiKey}
                  onChange={(e) =>
                    setTempApiConfig((prev) => ({
                      ...prev,
                      apiKey: e.target.value,
                    }))
                  }
                />
                <FieldDescription>
                  Your API key is stored locally and only sent to this app&apos;s server endpoints to
                  perform translation.
                </FieldDescription>
              </FieldContent>
            </Field>

            <Field>
              <FieldContent>
                <FieldLabel htmlFor="base-url">Base URL</FieldLabel>
                <Input
                  id="base-url"
                  type="url"
                  placeholder="https://api.openai.com/v1"
                  value={tempApiConfig.baseUrl}
                  onChange={(e) =>
                    setTempApiConfig((prev) => ({
                      ...prev,
                      baseUrl: e.target.value,
                    }))
                  }
                />
                <FieldDescription>Use a custom API-compatible endpoint.</FieldDescription>
              </FieldContent>
            </Field>

            <Field>
              <FieldContent>
                <FieldLabel htmlFor="model">Model</FieldLabel>
                <Select
                  value={tempApiConfig.model}
                  onValueChange={(value) => setTempApiConfig((prev) => ({ ...prev, model: value }))}
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
                {tempApiConfig.model === "custom" && (
                  <Input
                    id="custom-model"
                    placeholder="Input model name, for example: gpt-4, claude-3-opus"
                    value={customModelName}
                    onChange={(e) => setCustomModelName(e.target.value)}
                    className="mt-2"
                  />
                )}
                <FieldDescription>
                  {tempApiConfig.model === "custom"
                    ? "Input the model name you want to use."
                    : "Select the model to use for translation."}
                </FieldDescription>
              </FieldContent>
            </Field>

            <Field>
              <FieldContent>
                <FieldLabel htmlFor="output-mode">Output Mode</FieldLabel>
                <Select
                  value={tempApiConfig.outputMode}
                  onValueChange={(value: OutputMode) =>
                    setTempApiConfig((prev) => ({ ...prev, outputMode: value }))
                  }
                >
                  <SelectTrigger id="output-mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="translation-only">Translation Only</SelectItem>
                    <SelectItem value="bilingual">Bilingual</SelectItem>
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>

            <Field>
              <FieldContent>
                <FieldLabel htmlFor="custom-prompt">Custom Prompt (Advanced)</FieldLabel>
                <Textarea
                  id="custom-prompt"
                  placeholder="Example: Use concise business tone and keep product terms untranslated."
                  value={tempApiConfig.customPrompt}
                  onChange={(e) =>
                    setTempApiConfig((prev) => ({
                      ...prev,
                      customPrompt: e.target.value,
                    }))
                  }
                  className="min-h-[100px]"
                />
              </FieldContent>
            </Field>

            <Field orientation="horizontal">
              <Checkbox
                id="auto-detect-source-language"
                className="mt-0.5 shrink-0"
                checked={tempApiConfig.autoDetectSourceLanguage}
                onCheckedChange={(checked) =>
                  setTempApiConfig((prev) => ({
                    ...prev,
                    autoDetectSourceLanguage: checked === true,
                  }))
                }
              />
              <FieldContent>
                <FieldLabel htmlFor="auto-detect-source-language">Auto Detect Source Language</FieldLabel>
                <FieldDescription>
                  Detect source language after typing pauses and update picker automatically.
                </FieldDescription>
              </FieldContent>
            </Field>

            <Button
              onClick={handleSave}
              className="w-full"
              disabled={tempApiConfig.model === "custom" && !customModelName.trim()}
            >
              Save Settings
            </Button>
          </FieldGroup>
        </div>
      </DialogContent>
    </Dialog>
  );
}
