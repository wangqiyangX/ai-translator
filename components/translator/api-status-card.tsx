"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Globe } from "lucide-react";
import { useTranslatorRuntimeStore, useTranslatorSettingsStore } from "./store";

export function ApiStatusCard() {
  const status = useTranslatorRuntimeStore((state) => state.apiStatus);
  const statusMessage = useTranslatorRuntimeStore((state) => state.apiStatusMessage);
  const detailsExpanded = useTranslatorRuntimeStore(
    (state) => state.apiDetailsExpanded
  );
  const tokenStats = useTranslatorRuntimeStore((state) => state.tokenStats);
  const setApiDetailsExpanded = useTranslatorRuntimeStore(
    (state) => state.setApiDetailsExpanded
  );
  const model = useTranslatorSettingsStore((state) => state.apiConfig.model);

  return (
    <div className="mb-4 p-4 border rounded-lg bg-card my-2">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {status === "checking" && (
              <>
                <Spinner className="h-4 w-4" />
                <span className="text-sm font-medium">Checking API status...</span>
              </>
            )}
            {status === "available" && (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-500">API Available</span>
              </>
            )}
            {status === "unavailable" && (
              <>
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium text-red-500">API Unavailable</span>
              </>
            )}
            {status === "idle" && (
              <>
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">API Status</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Model: {model || "Not set"}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setApiDetailsExpanded((prev) => !prev)}
            >
              {detailsExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
          </div>
        </div>
        {detailsExpanded && (
          <>
            {statusMessage && <div className="text-xs text-muted-foreground">{statusMessage}</div>}
            <div className="pt-2 border-t">
              <div className="text-xs text-muted-foreground mb-2">Token Usage (Current Session)</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="rounded-md border p-2 bg-background/50">
                  <div className="text-muted-foreground">Requests</div>
                  <div className="font-medium">{tokenStats.requests}</div>
                </div>
                <div className="rounded-md border p-2 bg-background/50">
                  <div className="text-muted-foreground">Input Tokens</div>
                  <div className="font-medium">{tokenStats.inputTokens.toLocaleString()}</div>
                </div>
                <div className="rounded-md border p-2 bg-background/50">
                  <div className="text-muted-foreground">Output Tokens</div>
                  <div className="font-medium">{tokenStats.outputTokens.toLocaleString()}</div>
                </div>
                <div className="rounded-md border p-2 bg-background/50">
                  <div className="text-muted-foreground">Total Tokens</div>
                  <div className="font-medium">{tokenStats.totalTokens.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
