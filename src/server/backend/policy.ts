import openApi from '../../../openapi/qadam.json'

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace'] as const

type OperationShape = {
  operationId?: string
  parameters?: Array<{ name?: string; in?: string; required?: boolean }>
  requestBody?: { content?: Record<string, unknown> }
}

type PathShape = Record<string, OperationShape | unknown>

export interface BackendOperation {
  method: string
  path: string
  operationId: string
  query: Array<{ name: string; required: boolean }>
  contentTypes: string[]
  matcher: RegExp
}

function compilePath(path: string) {
  const expression = path
    .split('/')
    .map((segment) =>
      /^\{[^}]+\}$/.test(segment) ? '[^/]+' : segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
    )
    .join('/')
  return new RegExp(`^${expression}$`)
}

function buildOperations(): BackendOperation[] {
  const operations: BackendOperation[] = []
  for (const [path, rawPathItem] of Object.entries(openApi.paths)) {
    const pathItem = rawPathItem as PathShape
    const sharedParameters = Array.isArray(pathItem.parameters) ? pathItem.parameters : []
    for (const method of HTTP_METHODS) {
      const rawOperation = pathItem[method]
      if (!rawOperation || typeof rawOperation !== 'object') continue
      const operation = rawOperation as OperationShape
      const parameters = [...sharedParameters, ...(operation.parameters ?? [])] as Array<{
        name?: string
        in?: string
        required?: boolean
      }>

      operations.push({
        method: method.toUpperCase(),
        path,
        operationId: operation.operationId ?? `${method}:${path}`,
        query: parameters
          .filter(
            (parameter): parameter is { name: string; in: string; required?: boolean } =>
              parameter.in === 'query' && typeof parameter.name === 'string',
          )
          .map((parameter) => ({ name: parameter.name, required: Boolean(parameter.required) })),
        contentTypes: Object.keys(operation.requestBody?.content ?? {}),
        matcher: compilePath(path),
      })
    }
  }
  return operations.sort((left, right) => {
    const leftDynamic = left.path.includes('{') ? 1 : 0
    const rightDynamic = right.path.includes('{') ? 1 : 0
    return leftDynamic - rightDynamic || right.path.length - left.path.length
  })
}

export const backendOperations = buildOperations()

function isSafePath(path: string) {
  if (!path.startsWith('/') || path.includes('\\') || path.includes('\0')) return false
  return !path.split('/').some((segment) => segment === '.' || segment === '..')
}

export function resolveBackendOperation(
  method: string,
  path: string,
  searchParams: URLSearchParams,
): BackendOperation | null {
  if (!isSafePath(path)) return null
  const operation = backendOperations.find(
    (candidate) => candidate.method === method.toUpperCase() && candidate.matcher.test(path),
  )
  if (!operation) return null

  const allowedKeys = new Set(operation.query.map((parameter) => parameter.name))
  if ([...searchParams.keys()].some((key) => !allowedKeys.has(key))) return null
  if (
    operation.query.some((parameter) => parameter.required && !searchParams.has(parameter.name))
  ) {
    return null
  }
  return operation
}
