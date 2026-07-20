import { readFile } from 'node:fs/promises'

const snapshot = JSON.parse(
  await readFile(new URL('../openapi/qadam.json', import.meta.url), 'utf8'),
)
const catalogSource = await readFile(
  new URL('../src/shared/api/operation-catalog.ts', import.meta.url),
  'utf8',
)
const methods = new Set(['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace'])
const backendIds = new Set(
  Object.values(snapshot.paths).flatMap((pathItem) =>
    Object.entries(pathItem)
      .filter(([method]) => methods.has(method))
      .map(([, operation]) => operation.operationId),
  ),
)
const frontendIds = new Set(
  [...catalogSource.matchAll(/'([A-Za-z][A-Za-z0-9_]*)'/g)].map((match) => match[1]),
)
const missing = [...backendIds].filter((operationId) => !frontendIds.has(operationId))
const extra = [...frontendIds].filter((operationId) => !backendIds.has(operationId))
const schemaCount = Object.keys(snapshot.components?.schemas ?? {}).length

if (backendIds.size !== 52 || schemaCount !== 30 || missing.length > 0 || extra.length > 0) {
  console.error(
    JSON.stringify({ operations: backendIds.size, schemas: schemaCount, missing, extra }),
  )
  process.exit(1)
}

console.log(
  `Qadam API coverage: operations ${frontendIds.size}/${backendIds.size}; schemas ${schemaCount}/${schemaCount}`,
)
