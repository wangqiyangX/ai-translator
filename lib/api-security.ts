import { NextResponse } from "next/server"

interface GuardOptions {
  headers: Headers
  apiKey?: string | null
  routeKey: string
  ipLimitPerMinute?: number
  userLimitPerMinute?: number
}

interface GuardResult {
  ok: boolean
  response?: NextResponse
}

interface Bucket {
  count: number
  resetAt: number
}

const WINDOW_MS = 60_000
const buckets = new Map<string, Bucket>()

function hashString(input: string) {
  let hash = 5381
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 33) ^ input.charCodeAt(i)
  }
  return (hash >>> 0).toString(16)
}

function getClientIp(headers: Headers) {
  const forwardedFor = headers.get("x-forwarded-for")
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim()
    if (first) return first
  }

  const realIp = headers.get("x-real-ip")
  if (realIp) return realIp

  return "unknown"
}

function hitLimit(key: string, limit: number) {
  const now = Date.now()
  const existing = buckets.get(key)

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }

  existing.count += 1
  buckets.set(key, existing)
  return existing.count > limit
}

function maybeCleanupBuckets() {
  // Lightweight cleanup to avoid unbounded growth.
  if (buckets.size < 5000) return
  const now = Date.now()
  for (const [key, value] of buckets) {
    if (value.resetAt <= now) {
      buckets.delete(key)
    }
  }
}

export function guardApiRoute({
  headers,
  apiKey,
  routeKey,
  ipLimitPerMinute = 120,
  userLimitPerMinute = 240,
}: GuardOptions): GuardResult {
  const trimmedKey = apiKey?.trim()
  if (!trimmedKey) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "API key is required. Please configure your own API key." },
        { status: 401 },
      ),
    }
  }

  const ip = getClientIp(headers)
  const userHash = hashString(trimmedKey)

  maybeCleanupBuckets()

  const ipExceeded = hitLimit(`ip:${routeKey}:${ip}`, ipLimitPerMinute)
  if (ipExceeded) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Too many requests from this IP. Please retry later." },
        { status: 429 },
      ),
    }
  }

  const userExceeded = hitLimit(`user:${routeKey}:${userHash}`, userLimitPerMinute)
  if (userExceeded) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Too many requests for this API key. Please retry later." },
        { status: 429 },
      ),
    }
  }

  return { ok: true }
}
