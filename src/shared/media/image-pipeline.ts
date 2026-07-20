const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_SOURCE_BYTES = 10 * 1024 * 1024
const MAX_DIMENSION = 1_600
const MAX_TOTAL_OUTPUT_BYTES = 4 * 1024 * 1024
const MAX_SINGLE_OUTPUT_BYTES = 2 * 1024 * 1024

export function validateImageSelection(files: File[], maxCount: number) {
  if (files.length > maxCount) throw new Error('TOO_MANY_IMAGES')
  for (const file of files) {
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) throw new Error('UNSUPPORTED_IMAGE_TYPE')
    if (file.size > MAX_SOURCE_BYTES) throw new Error('IMAGE_TOO_LARGE')
  }
  return files
}

function canvasBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('IMAGE_COMPRESSION_FAILED'))),
      'image/webp',
      quality,
    )
  })
}

async function prepareOne(file: File, targetBytes: number) {
  const bitmap = await createImageBitmap(file)
  try {
    const initialScale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
    let width = Math.max(1, Math.round(bitmap.width * initialScale))
    let height = Math.max(1, Math.round(bitmap.height * initialScale))
    let best: Blob | undefined

    for (let scaleAttempt = 0; scaleAttempt < 5; scaleAttempt += 1) {
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const context = canvas.getContext('2d')
      if (!context) throw new Error('IMAGE_COMPRESSION_FAILED')
      context.drawImage(bitmap, 0, 0, width, height)

      for (const quality of [0.86, 0.74, 0.62, 0.5]) {
        const blob = await canvasBlob(canvas, quality)
        if (!best || blob.size < best.size) best = blob
        if (blob.size <= targetBytes) {
          return new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), {
            type: 'image/webp',
            lastModified: file.lastModified,
          })
        }
      }
      width = Math.max(1, Math.round(width * 0.78))
      height = Math.max(1, Math.round(height * 0.78))
    }

    if (!best || best.size > targetBytes) throw new Error('IMAGE_COMPRESSION_FAILED')
    return new File([best], file.name.replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' })
  } finally {
    bitmap.close()
  }
}

export async function prepareImages(files: File[], maxCount: number) {
  const valid = validateImageSelection(files, maxCount)
  if (valid.length === 0) return []
  const perFileTarget = Math.min(
    MAX_SINGLE_OUTPUT_BYTES,
    Math.floor(MAX_TOTAL_OUTPUT_BYTES / valid.length),
  )
  return Promise.all(valid.map((file) => prepareOne(file, perFileTarget)))
}
