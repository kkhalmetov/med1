export type ApiErrorCode =
  | 'ABORTED'
  | 'BAD_REQUEST'
  | 'CONFLICT'
  | 'FORBIDDEN'
  | 'NETWORK'
  | 'NOT_FOUND'
  | 'SERVER_ERROR'
  | 'TIMEOUT'
  | 'UNAUTHORIZED'
  | 'UNKNOWN'

interface ApiErrorOptions {
  status: number
  code: ApiErrorCode
  retryable: boolean
  details?: unknown
  cause?: unknown
}

export class ApiError extends Error {
  readonly status: number
  readonly code: ApiErrorCode
  readonly retryable: boolean
  readonly details: unknown

  constructor(message: string, options: ApiErrorOptions) {
    super(message, { cause: options.cause })
    this.name = 'ApiError'
    this.status = options.status
    this.code = options.code
    this.retryable = options.retryable
    this.details = options.details
  }
}

const statusCodes: Record<number, ApiErrorCode> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
}

export function apiErrorFromResponse(status: number, payload: unknown): ApiError {
  const objectPayload = payload && typeof payload === 'object' ? payload : undefined
  const messageValue =
    objectPayload && 'message' in objectPayload ? objectPayload.message : undefined
  const details = objectPayload && 'errors' in objectPayload ? objectPayload.errors : payload
  const code = statusCodes[status] ?? (status >= 500 ? 'SERVER_ERROR' : 'UNKNOWN')

  return new ApiError(
    typeof messageValue === 'string' ? messageValue : `Request failed (${status})`,
    {
      status,
      code,
      retryable: status >= 500 || status === 408 || status === 429,
      details,
    },
  )
}
