import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const snapshotPath = resolve(projectRoot, 'openapi/qadam.json')
const sourceUrl =
  process.env.QADAM_OPENAPI_URL ??
  'http://45.141.100.245:8080/disabled-support-service/api/v1/v3/api-docs'
const methods = new Set(['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace'])
const expected = { paths: 42, operations: 53, schemas: 31 }

function summarize(spec) {
  const paths = spec.paths ?? {}
  return {
    paths: Object.keys(paths).length,
    operations: Object.values(paths).reduce(
      (total, item) =>
        total +
        (item && typeof item === 'object'
          ? Object.keys(item).filter((key) => methods.has(key.toLowerCase())).length
          : 0),
      0,
    ),
    schemas: Object.keys(spec.components?.schemas ?? {}).length,
  }
}

function withoutDocumentation(value) {
  if (Array.isArray(value)) return value.map(withoutDocumentation)
  if (!value || typeof value !== 'object') return value

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !['description', 'example', 'examples', 'externalDocs'].includes(key))
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, child]) => [key, withoutDocumentation(child)]),
  )
}

function contractShape(spec) {
  return withoutDocumentation({ paths: spec.paths, components: spec.components })
}

function assertExpected(spec, label) {
  const actual = summarize(spec)
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${label} contract count mismatch: ${JSON.stringify(actual)}`)
  }
  return actual
}

async function fetchLiveSpec() {
  const response = await fetch(sourceUrl, { cache: 'no-store' })
  if (!response.ok) throw new Error(`OpenAPI request failed with ${response.status}`)
  return response.json()
}

const mode = process.argv[2] ?? 'check'
const live = await fetchLiveSpec()
const summary = assertExpected(live, 'Live')

if (mode === 'sync') {
  await mkdir(dirname(snapshotPath), { recursive: true })
  await writeFile(snapshotPath, `${JSON.stringify(live, null, 2)}\n`, 'utf8')
  console.log(`Saved OpenAPI snapshot: ${JSON.stringify(summary)}`)
} else if (mode === 'check') {
  const snapshot = JSON.parse(await readFile(snapshotPath, 'utf8'))
  assertExpected(snapshot, 'Snapshot')
  if (JSON.stringify(contractShape(live)) !== JSON.stringify(contractShape(snapshot))) {
    throw new Error('Live OpenAPI contract differs from openapi/qadam.json')
  }
  console.log(`OpenAPI contract is current: ${JSON.stringify(summary)}`)
} else {
  throw new Error(`Unsupported mode: ${mode}`)
}
