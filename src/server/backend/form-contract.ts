import openApi from '../../../openapi/qadam.json'
import type { OperationDefinition, OperationField } from '@/shared/api/operation-form'
import { backendOperations } from './policy'

type JsonObject = Record<string, unknown>

function object(value: unknown): JsonObject {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as JsonObject) : {}
}

function resolveSchema(schemaValue: unknown) {
  const schema = object(schemaValue)
  const reference = schema.$ref
  if (typeof reference !== 'string') return schema
  const name = reference.split('/').at(-1)
  return name ? object((openApi.components.schemas as JsonObject)[name]) : schema
}

function fieldFromSchema(
  name: string,
  location: OperationField['location'],
  schemaValue: unknown,
  required: boolean,
): OperationField {
  const schema = object(schemaValue)
  const items = object(schema.items)
  const file = schema.format === 'binary' || items.format === 'binary'
  const schemaType = typeof schema.type === 'string' ? schema.type : 'string'
  return {
    name,
    location,
    type: file
      ? 'file'
      : schemaType === 'number' ||
          schemaType === 'integer' ||
          schemaType === 'boolean' ||
          schemaType === 'array'
        ? schemaType
        : 'string',
    format: typeof schema.format === 'string' ? schema.format : undefined,
    required,
    enum: Array.isArray(schema.enum) ? schema.enum.map(String) : undefined,
    min: typeof schema.minimum === 'number' ? schema.minimum : undefined,
    max: typeof schema.maximum === 'number' ? schema.maximum : undefined,
    minLength: typeof schema.minLength === 'number' ? schema.minLength : undefined,
    pattern:
      typeof schema.pattern === 'string'
        ? schema.pattern
        : schema.format === 'uuid'
          ? '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}'
          : undefined,
    multiple: schemaType === 'array',
  }
}

export function getOperationDefinitions(operationIds: readonly string[]): OperationDefinition[] {
  return operationIds.map((operationId) => {
    const catalogOperation = backendOperations.find(
      (candidate) => candidate.operationId === operationId,
    )
    if (!catalogOperation) throw new Error(`Unknown OpenAPI operation: ${operationId}`)
    const pathItem = object((openApi.paths as JsonObject)[catalogOperation.path])
    const operation = object(pathItem[catalogOperation.method.toLowerCase()])
    const parameters = [
      ...(Array.isArray(pathItem.parameters) ? pathItem.parameters : []),
      ...(Array.isArray(operation.parameters) ? operation.parameters : []),
    ]
    const fields: OperationField[] = parameters.flatMap((parameterValue) => {
      const parameter = object(parameterValue)
      if (parameter.in !== 'path' && parameter.in !== 'query') return []
      return [
        fieldFromSchema(
          String(parameter.name),
          parameter.in,
          parameter.schema,
          Boolean(parameter.required),
        ),
      ]
    })

    const requestBody = object(operation.requestBody)
    const content = object(requestBody.content)
    const contentType = Object.keys(content)[0]
    if (contentType) {
      const media = object(content[contentType])
      const bodySchema = resolveSchema(media.schema)
      const requiredFields = new Set(
        Array.isArray(bodySchema.required) ? bodySchema.required.map(String) : [],
      )
      for (const [name, schema] of Object.entries(object(bodySchema.properties))) {
        fields.push(fieldFromSchema(name, 'body', schema, requiredFields.has(name)))
      }
    }

    const responses = object(operation.responses)
    const responseTypes = Object.entries(responses)
      .filter(([status]) => status.startsWith('2'))
      .flatMap(([, response]) => Object.keys(object(object(response).content)))
    const kind =
      operationId === 'getFile' ||
      operationId.toLowerCase().includes('export') ||
      responseTypes.some(
        (type) => type.includes('pdf') || type.includes('csv') || type === 'text/plain',
      )
        ? 'download'
        : 'data'

    return {
      operationId,
      method: catalogOperation.method,
      path: catalogOperation.path,
      contentType,
      kind,
      fields,
    }
  })
}
