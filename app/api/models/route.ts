export const maxDuration = 10

export async function POST(req: Request) {
  try {
    const { apiKey, baseUrl, model } = await req.json()

    if (!model) {
      return Response.json(
        { available: false, error: "Model is required" },
        { status: 400 }
      )
    }

    if (apiKey) {
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
          return Response.json(
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

        const data = await response.json()
        const models = data.data || []

        // Check if the specific model is available in the list
        const modelExists = models.some((m: any) => m.id === model)

        return Response.json({
          available: true,
          modelExists,
          message: modelExists
            ? "API is available and model is accessible"
            : "API is available, but model may not be in the list",
        })
      } catch (error) {
        return Response.json(
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
    } else {
      // Use Vercel AI Gateway - assume available if no API key is provided
      // The gateway will handle the actual connection
      return Response.json({
        available: true,
        message: "Using Vercel AI Gateway",
      })
    }
  } catch (error) {
    console.error("Model check error:", error)
    return Response.json(
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

