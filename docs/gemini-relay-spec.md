# QadamAI Gemini relay specification

## Goal

Restore the existing patient short-review feature without exposing the Gemini API key and without sending Gemini requests directly from the unsupported backend region.

## Contract

- `POST /api/internal/gemini` is a server-to-server endpoint deployed with the Next.js application on Vercel.
- Authentication is `Authorization: Bearer <GEMINI_RELAY_SECRET>`.
- The endpoint accepts only the Gemini `generateContent` request shape currently produced by the Spring backend: `contents[].parts[].text`.
- The relay always calls the fixed Gemini model `gemini-3.1-flash-lite`; callers cannot choose a model or upstream URL.
- The Gemini API key is read only from the server-side `GEMINI_API_KEY` environment variable and is forwarded in the `x-goog-api-key` header.
- Requests are limited to 256 KiB and upstream calls time out after 90 seconds. The frontend backend-proxy allows 100 seconds for this operation so it can receive the relay response.
- Responses never include either server secret. Authentication, validation, configuration, timeout, network, and upstream failures return safe machine-readable errors.

## Acceptance criteria

1. Missing or invalid relay credentials return `401` without calling Gemini.
2. Missing server configuration returns `503`.
3. Invalid or oversized input returns `400` or `413`.
4. Valid input is forwarded to the fixed Gemini endpoint and the successful JSON response is returned unchanged.
5. Upstream details and secrets are not exposed on errors.
6. The Spring backend uses the relay secret from a root-only environment file and no longer sends a Gemini key in the URL.
7. The deployed `/patients/{id}/short-review` flow succeeds for an authorized practitioner or admin.
