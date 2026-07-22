# QadamAI Gemini relay specification

## Goal

Restore the existing patient short-review feature without exposing the Gemini API key and without sending Gemini requests directly from the unsupported backend region.

## Contract

- `POST /api/internal/gemini` is a server-to-server endpoint deployed with the Next.js application on Vercel.
- Authentication is `Authorization: Bearer <GEMINI_RELAY_SECRET>`.
- The endpoint accepts only the Gemini `generateContent` request shape currently produced by the Spring backend: `contents[].parts[].text`.
- The relay first calls the fixed, low-latency Gemini model `gemini-3.5-flash-lite` and falls back to `gemini-2.5-flash-lite`; callers cannot choose a model or upstream URL.
- The Gemini API key is read only from the server-side `GEMINI_API_KEY` environment variable and is forwarded in the `x-goog-api-key` header.
- Requests are limited to 256 KiB and generated answers to 1,024 tokens. Each model is allowed at most 15 seconds, so the fallback path finishes in about 30 seconds instead of waiting indefinitely. The frontend backend-proxy allows 40 seconds and the browser allows 45 seconds so each layer can receive the final response from the layer behind it.
- Responses never include either server secret. Authentication, validation, configuration, timeout, network, and upstream failures return safe machine-readable errors.

## Acceptance criteria

1. Missing or invalid relay credentials return `401` without calling Gemini.
2. Missing server configuration returns `503`.
3. Invalid or oversized input returns `400` or `413`.
4. Valid input is forwarded only to the fixed Gemini endpoints and the first successful JSON response is returned unchanged.
5. Upstream details and secrets are not exposed on errors.
6. The Spring backend uses the relay secret from a root-only environment file and no longer sends a Gemini key in the URL.
7. The deployed `/patients/{id}/short-review` flow succeeds for an authorized practitioner or admin.
