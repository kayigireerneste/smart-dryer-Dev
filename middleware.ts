import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { redis, KEYS } from "@/lib/redis"

const RATE_LIMIT_REQUESTS = 100
const RATE_LIMIT_WINDOW = 60

export async function middleware(request: NextRequest) {

  if (!request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next()
  }

  
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "anonymous"

 
  const endpoint = request.nextUrl.pathname
  const rateLimitKey = `${KEYS.RATE_LIMIT}${ip}:${endpoint}`

  try {
    const currentCount = (await redis.get(rateLimitKey)) as number | null

    if (currentCount === null) {
      await redis.set(rateLimitKey, 1)
      await redis.expire(rateLimitKey, RATE_LIMIT_WINDOW)
    } else if (currentCount < RATE_LIMIT_REQUESTS) {
      await redis.incr(rateLimitKey)
    } else {
      return new NextResponse(JSON.stringify({ error: "Rate limit exceeded" }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Limit": RATE_LIMIT_REQUESTS.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": (Math.floor(Date.now() / 1000) + (await redis.ttl(rateLimitKey))).toString(),
        },
      })
    }

    const remaining = currentCount === null ? RATE_LIMIT_REQUESTS - 1 : RATE_LIMIT_REQUESTS - (currentCount + 1)
    const response = NextResponse.next()

    response.headers.set("X-RateLimit-Limit", RATE_LIMIT_REQUESTS.toString())
    response.headers.set("X-RateLimit-Remaining", Math.max(0, remaining).toString())
    response.headers.set(
      "X-RateLimit-Reset",
      (Math.floor(Date.now() / 1000) + (await redis.ttl(rateLimitKey))).toString(),
    )

    return response
  } catch (error) {
    console.error("Rate limiting error:", error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    "/api/:path*",
  ],
}
