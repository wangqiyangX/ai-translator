import { NextResponse } from "next/server"
import { guardApiRoute } from "@/lib/api-security"

export const maxDuration = 10

interface ModelsResponse {
  data?: Array<{ id?: string }>
}

export async function POST(req: Request) {
  try {
    const { apiKey, baseUrl, model } = await req.json()

    if (!model) {
      return NextResponse.json(
        { available: false, error: "Model is required" },
        { status: 400 }
      )
    }

    const guard = guardApiRoute({
      headers: req.headers,
      apiKey,
      routeKey: "models",
      ipLimitPerMinute: 60,
      userLimitPerMinute: 120,
    })
    if (!guard.ok) return guard.response

    // Custom API key provided - check using /models endpoint
    // This doesn't consume tokens, just checks connectivity
    try {
      const apiBaseUrl = baseUrl || "https://api.openai.com/v1"
      const modelsUrl = `${apiBaseUrl.replace(/\/$/, "")}/models`

      const response = await fetch(modelsUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: { message: "Failed to connect to API" },
        }))
        return NextResponse.json(
          {
            available: false,
            error:
              errorData.error?.message ||
              errorData.error ||
              `API returned status ${response.status}`,
          },
          { status: response.status }
        )
      }

      const data = (await response.json()) as ModelsResponse
      const models = Array.isArray(data.data) ? data.data : []

      // Check if the specific model is available in the list
      const modelExists = models.some((m) => m.id === model)

      return NextResponse.json({
        available: true,
        modelExists,
        message: modelExists
          ? "API is available and model is accessible"
          : "API is available, but model may not be in the list",
      })
    } catch (error) {
      return NextResponse.json(
        {
          available: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to connect to API",
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Model check error:", error)
    return NextResponse.json(
      {
        available: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to check API availability",
      },
      { status: 500 }
    )
  }
}
