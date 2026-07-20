const HTTP_METHODS = new Set(['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace'])

export interface OpenApiSummary {
  paths: number
  operations: number
  schemas: number
}

interface OpenApiLike {
  paths?: Record<string, unknown>
  components?: {
    schemas?: Record<string, unknown>
  }
}

export function summarizeOpenApi(spec: OpenApiLike): OpenApiSummary {
  const paths = spec.paths ?? {}
  const operations = Object.values(paths).reduce<number>((count, pathItem) => {
    if (!pathItem || typeof pathItem !== 'object') return count

    return count + Object.keys(pathItem).filter((key) => HTTP_METHODS.has(key.toLowerCase())).length
  }, 0)

  return {
    paths: Object.keys(paths).length,
    operations,
    schemas: Object.keys(spec.components?.schemas ?? {}).length,
  }
}
