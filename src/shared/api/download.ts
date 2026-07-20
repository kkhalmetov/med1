import { apiErrorFromResponse } from './error'

export interface DownloadResult {
  blob: Blob
  filename: string
}

function filenameFromDisposition(disposition: string | null, fallback: string) {
  if (!disposition) return fallback
  const utf8 = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1]
  if (utf8) return decodeURIComponent(utf8).replaceAll(/[\\/:*?"<>|]/g, '-')
  const plain = disposition.match(/filename="?([^";]+)"?/i)?.[1]
  return plain?.replaceAll(/[\\/:*?"<>|]/g, '-') ?? fallback
}

export async function fetchDownload(
  path: string,
  fallbackFilename: string,
): Promise<DownloadResult> {
  const response = await fetch(`/api/backend${path}`, {
    credentials: 'same-origin',
    cache: 'no-store',
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => undefined)
    throw apiErrorFromResponse(response.status, payload)
  }
  return {
    blob: await response.blob(),
    filename: filenameFromDisposition(
      response.headers.get('content-disposition'),
      fallbackFilename,
    ),
  }
}

export function saveDownload({ blob, filename }: DownloadResult) {
  const href = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = href
  link.download = filename
  link.click()
  URL.revokeObjectURL(href)
}
