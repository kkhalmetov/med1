import { randomUUID, timingSafeEqual } from 'node:crypto'
import { z } from 'zod'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models'
const GEMINI_MODELS = ['gemini-3.5-flash-lite', 'gemini-2.5-flash-lite'] as const
const MAX_BODY_BYTES = 256 * 1024
const UPSTREAM_ATTEMPT_TIMEOUT_MS = 15_000
const MAX_OUTPUT_TOKENS = 1024
const RETRY_DELAY_MS = 250

const geminiRequestSchema = z
  .object({
    contents: z
      .array(
        z
          .object({
            parts: z
              .array(
                z
                  .object({
                    text: z.string().min(1).max(250_000),
                  })
                  .strict(),
              )
              .min(1)
              .max(32),
          })
          .strict(),
      )
      .min(1)
      .max(8),
  })
  .strict()

function jsonResponse(body: { code: string }, status: number, requestId: string) {
  return Response.json(body, {
    status,
    headers: {
      'cache-control': 'no-store',
      'x-request-id': requestId,
    },
  })
}

function secretsMatch(candidate: string, expected: string) {
  const candidateBuffer = Buffer.from(candidate)
  const expectedBuffer = Buffer.from(expected)
  return (
    candidateBuffer.length === expectedBuffer.length &&
    timingSafeEqual(candidateBuffer, expectedBuffer)
  )
}

function logRelayFailure(requestId: string, reason: string, upstreamStatus?: number) {
  console.error(
    JSON.stringify({
      event: 'gemini_relay_failed',
      requestId,
      reason,
      ...(upstreamStatus === undefined ? {} : { upstreamStatus }),
    }),
  )
}

function retryDelay() {
  return new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS))
}

export async function POST(request: Request) {
  const requestId = randomUUID()
  const apiKey = process.env.GEMINI_API_KEY
  const relaySecret = process.env.GEMINI_RELAY_SECRET

  if (!apiKey || !relaySecret) {
    logRelayFailure(requestId, 'missing_configuration')
    return jsonResponse({ code: 'AI_RELAY_UNAVAILABLE' }, 503, requestId)
  }

  const authorization = request.headers.get('authorization')
  const candidateSecret = authorization?.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length)
    : ''
  if (!candidateSecret || !secretsMatch(candidateSecret, relaySecret)) {
    return jsonResponse({ code: 'UNAUTHORIZED' }, 401, requestId)
  }

  const declaredLength = Number(request.headers.get('content-length') ?? 0)
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return jsonResponse({ code: 'PAYLOAD_TOO_LARGE' }, 413, requestId)
  }

  const rawBody = await request.arrayBuffer()
  if (rawBody.byteLength > MAX_BODY_BYTES) {
    return jsonResponse({ code: 'PAYLOAD_TOO_LARGE' }, 413, requestId)
  }

  let parsedBody: unknown
  try {
    parsedBody = JSON.parse(new TextDecoder().decode(rawBody))
  } catch {
    return jsonResponse({ code: 'INVALID_REQUEST' }, 400, requestId)
  }

  const validatedBody = geminiRequestSchema.safeParse(parsedBody)
  if (!validatedBody.success) {
    return jsonResponse({ code: 'INVALID_REQUEST' }, 400, requestId)
  }

  const upstreamBody = JSON.stringify({
    ...validatedBody.data,
    generationConfig: { maxOutputTokens: MAX_OUTPUT_TOKENS },
  })
  for (const [modelIndex, model] of GEMINI_MODELS.entries()) {
    const hasFallback = modelIndex < GEMINI_MODELS.length - 1
    const upstreamUrl = `${GEMINI_BASE_URL}/${model}:generateContent`
    try {
      const upstreamResponse = await fetch(upstreamUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: upstreamBody,
        cache: 'no-store',
        signal: AbortSignal.timeout(UPSTREAM_ATTEMPT_TIMEOUT_MS),
      })

      if (upstreamResponse.ok) {
        const responseBody = await upstreamResponse.text()
        return new Response(responseBody, {
          status: 200,
          headers: {
            'cache-control': 'no-store',
            'content-type': 'application/json',
            'x-request-id': requestId,
          },
        })
      }

      logRelayFailure(requestId, 'upstream_response', upstreamResponse.status)
      if (hasFallback) {
        await retryDelay()
        continue
      }
      return jsonResponse({ code: 'AI_UPSTREAM_UNAVAILABLE' }, 503, requestId)
    } catch (error) {
      const timedOut = error instanceof DOMException && error.name === 'TimeoutError'
      logRelayFailure(requestId, timedOut ? 'upstream_timeout' : 'upstream_network')
      if (hasFallback) {
        await retryDelay()
        continue
      }
      return jsonResponse(
        { code: timedOut ? 'AI_UPSTREAM_TIMEOUT' : 'AI_UPSTREAM_UNAVAILABLE' },
        timedOut ? 504 : 503,
        requestId,
      )
    }
  }

  return jsonResponse({ code: 'AI_UPSTREAM_UNAVAILABLE' }, 503, requestId)
}
