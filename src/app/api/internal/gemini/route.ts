import { randomUUID, timingSafeEqual } from 'node:crypto'
import { z } from 'zod'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent'
const MAX_BODY_BYTES = 256 * 1024
const UPSTREAM_TIMEOUT_MS = 90_000

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

  try {
    const upstreamResponse = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(validatedBody.data),
      cache: 'no-store',
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    })

    if (!upstreamResponse.ok) {
      logRelayFailure(requestId, 'upstream_response', upstreamResponse.status)
      return jsonResponse({ code: 'AI_UPSTREAM_UNAVAILABLE' }, 503, requestId)
    }

    const responseBody = await upstreamResponse.text()
    return new Response(responseBody, {
      status: 200,
      headers: {
        'cache-control': 'no-store',
        'content-type': 'application/json',
        'x-request-id': requestId,
      },
    })
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === 'TimeoutError'
    logRelayFailure(requestId, timedOut ? 'upstream_timeout' : 'upstream_network')
    return jsonResponse(
      { code: timedOut ? 'AI_UPSTREAM_TIMEOUT' : 'AI_UPSTREAM_UNAVAILABLE' },
      timedOut ? 504 : 503,
      requestId,
    )
  }
}
